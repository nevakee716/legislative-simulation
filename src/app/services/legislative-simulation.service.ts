import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupedObservable, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Groupement, Regroupement } from '../models/scenario.model';

@Injectable({
  providedIn: 'root'
})
export class LegislativeSimulationService {
  private correspondance: any;
  private europeenData: any[] = [];

  constructor(private http: HttpClient) {
  }

  loadInitialData(): Observable<void> {
    return forkJoin([
      this.http.get<any>('data/correspondance.json'),
      this.http.get<any[]>('data/europeenData.json')
    ]).pipe(
      map(([correspondance, europeenData]) => {
        this.correspondance = correspondance;
        this.europeenData = europeenData;
      })
    );
  }

  simulateResult(scenario: any): any {
    const results: any = {
      "Participation": {}, "Report 1er Tour": {}, "PS => NFP": {}, "Report 2e Tour": {}, 
      "LR => RN": {}, "LREM => NFP": {}, "LR => NFP": {}, Résultats: {},
      RN: {}, LREM: {}, "Front Populaire": {}, "undefined": {}
    };

    const constituencies: any = {};
    const parties: any[] = [];
    const duels: string[] = [];
    const tri: any[] = [];
    let totalVote = 0;
    const circonscriptions: any[] = [];

    // Simulation logic here
    this.europeenData.forEach(row => {

      const label = row['Libellé département'] + ' ' + row['Libellé circonscription législative'];
      totalVote += row['Votants'];

      const circonscription = this.processConstituency(row, scenario, results);
      circonscriptions.push(circonscription);

      // Process duels and triangulaires
      this.processDuelsAndTriangulaires(circonscription, duels, tri);
    });

    // Process final results
    this.processFinalResults(circonscriptions, scenario, results,tri,duels);
    scenario.results.circonscriptions = circonscriptions
    return scenario;
  }

  private processConstituency(row: any, scenario: any, results: any): any {
    const circonscription: any = {
      name: row['Libellé circonscription législative'],
      label: row['Libellé département'] + ' ' + row['Libellé circonscription législative'],
      results: [],
      code:  row['Code circonscription législative'],
      legislatives: { "1er": [], "2e": [] }
    };

    // Process party results
    for (let i = 1; i <= 38; i++) {
      const partyVotes = row[`Voix ${i}`];
      if (partyVotes > 0) {
        const partyName = this.correspondance[row[`Libellé de liste ${i}`]];
        const partyCode = row[`Numéro de panneau ${i}`];
        const percentageVotes = row[`% Voix/exprimés ${i}`];

        circonscription.results.push({
          party_code: partyCode,
          party_name: partyName,
          votes: partyVotes,
          percentage_votes: percentageVotes
        });
      }
    }

    // Process 1st round
    scenario.groupement.forEach((groupe: any) => {
      let voteGroup = 0;
      groupe.regroupement.forEach((r: any) => {
        const partyResult = circonscription.results.find((res: any) => res.party_name === r.name);
        if (partyResult) {
          voteGroup += partyResult.votes * r.ratio * scenario.participation / 0.5;
        }
      });
      groupe.vote = voteGroup;

      circonscription.legislatives["1er"].push({
        name: groupe.name,
        vote: groupe.vote,
        "vote%": Math.round((voteGroup / row["Exprimés"]) * 100),
        "vote%inscrits": Math.round((voteGroup / row["Inscrits"]) * 100)
      });

      // Check for 1st round winner
      if (voteGroup > row["Exprimés"] * scenario.participation) {
        circonscription.legislatives.winner = groupe.name;
      }
      // Check for 2nd round qualification
      if (voteGroup > row["Inscrits"] * 12.5 / 100) {
        circonscription.legislatives["2e"].push({
          name: groupe.name,
          vote: groupe.vote,
          "vote%": Math.round((voteGroup / row["Exprimés"]) * 100),
          "vote%inscrits": Math.round((voteGroup / row["Inscrits"]) * 100)
        });
      }
    });

    circonscription.legislatives["1er"].sort((a: any, b: any) => b.vote - a.vote);

    // Process 2nd round
    this.processSecondRound(circonscription, scenario, row);
   
    return circonscription;
  }

  private processSecondRound(circonscription: any, scenario: any, row: any): void {
    if (circonscription.legislatives.winner) {
      circonscription.legislatives["2e"] = [circonscription.legislatives["1er"][0]];
    } else if (circonscription.legislatives["2e"].length === 0) {
      circonscription.legislatives["2e"].push(circonscription.legislatives["1er"][0]);
      circonscription.legislatives["2e"].push(circonscription.legislatives["1er"][1]);
    } else if (circonscription.legislatives["2e"].length === 1) {
      circonscription.legislatives["2e"].push(circonscription.legislatives["1er"][1]);
    }


    circonscription.legislatives["2e"].sort((a: any, b: any) => b.vote - a.vote);
    circonscription.legislatives["2e"].sort((a: any, b: any) => b.name.localeCompare(a.name));

    let duel = circonscription.legislatives["2e"].map((p: any) => p.name).join(" vs ");
    if(duel == "RN vs LREM vs Front Populaire") {
      if(circonscription.legislatives["2e"][2] == "LREM" && scenario.lremRetreatIf3rd) {
        duel = "RN vs Front Populaire"
      }
      if(circonscription.legislatives["2e"][2] == "Front Populaire" && scenario.nfpRetreatIf3rd) {
        duel = "RN vs LREM"
      }
    }

    if (scenario[duel]) {
      let totalVote = 0;
      circonscription.legislatives["2e"] = [];
      scenario[duel].forEach((groupe: any) => {
        let voteGroup = 0;
        // look in groupement
        scenario.groupement.find((g : Groupement) => g.name == groupe.name).regroupement.forEach((r: Regroupement) => {
          const partyResult = circonscription.results.find((res: any) => res.party_name === r.name);
          if (partyResult) {
            voteGroup += partyResult.votes * r.ratio;
          }
        });
        // check if there is new regroupement in the duel
        groupe.regroupement.forEach((r: Regroupement) => {
          const partyResult = circonscription.results.find((res: any) => res.party_name === r.name);
          if (partyResult) {
            voteGroup += partyResult.votes * r.ratio;
          }
        });
        totalVote += voteGroup;
      });

      scenario[duel].forEach((groupe: any) => {
        let voteGroup = 0;
        groupe.regroupement.forEach((r: any) => {
          const partyResult = circonscription.results.find((res: any) => res.party_name === r.name);
          if (partyResult) {
            voteGroup += partyResult.votes * r.ratio;
          }
        });
        circonscription.legislatives["2e"].push({
          name: groupe.name,
          vote: voteGroup,
          "vote%": Math.round((voteGroup / totalVote) * 100)
        });
      });

      circonscription.legislatives["2e"].sort((a: any, b: any) => b.vote - a.vote);
      circonscription.legislatives.winner = circonscription.legislatives["2e"][0].name;
    } else if (circonscription.legislatives["2e"].length > 1) {
      console.log(duel);
    }
  }

  private processDuelsAndTriangulaires(circonscription: any, duels: string[], tri: any[]): void {
    if (circonscription.legislatives["2e"].length > 2) {
      tri.push(circonscription.legislatives["2e"][0]);
    }
    const duel = circonscription.legislatives["2e"].map((p: any) => p.name).join(" vs ");
    duels.push(duel);
  }
 
  private processFinalResults(circonscriptions: any[], scenario: any, results: any, tri: any[], duels: string[]): void {

    scenario.results = {}
    scenario.results.thirdAndEliminated = this.arrayToJsonWithOccurrences(circonscriptions.filter((c: any) => c.legislatives["2e"].length < 3).map((c: any) => c.legislatives["1er"][2].name))

    scenario.results = {}
    scenario.results.thirdInTriangulaire = this.arrayToJsonWithOccurrences(circonscriptions.filter((c: any) => c.legislatives["2e"].length > 2).map((c: any) => c.legislatives["1er"][2].name))

    scenario.results.winTriangulaire = this.arrayToJsonWithOccurrences(circonscriptions.filter((c: any) => c.legislatives["2e"].length > 2).map((c: any) => c.legislatives["2e"][0].name));

    scenario.results.secondRound = this.arrayToJsonWithOccurrences(duels)

    scenario.results.secondRound = this.arrayToJsonWithOccurrences(duels)

    
    scenario.results.assemble = this.arrayToJsonWithOccurrences(circonscriptions.map((c: any) => c.legislatives.winner))

  }

  private arrayToJsonWithOccurrences(array: any[]): any {
    const occurrences: any = {};
    array.forEach(item => {
      if (occurrences[item]) {
        occurrences[item]++;
      } else {
        occurrences[item] = 1;
      }
    });
    return occurrences;
  }
}