import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ScenarioService } from '../../services/scenario.service';
import { Scenario } from '../../models/scenario.model';
import { ScenarioEditComponent } from '../scenario-edit/scenario-edit.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-scenario-list',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatTabsModule, MatButtonModule, MatIconModule, ScenarioEditComponent, MatDialogModule],
  templateUrl: './scenario-list.component.html',
  styleUrl: './scenario-list.component.scss'
})
export class ScenarioListComponent implements OnInit {
  scenarios: Scenario[] = [];
  selectedTabIndex = 0;

  constructor(private dialog: MatDialog, private scenarioService: ScenarioService, private _snackBar: MatSnackBar,) { }

  ngOnInit() {
    this.loadScenarios();
  }

  loadScenarios() {
    this.scenarioService.getScenarios().subscribe(scenarios => {
      console.log(this.scenarios)
      this.scenarios = scenarios;
    });
  }

  loadDefaultScenarios() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Charger les scénarios par défaut',
        message: 'Êtes-vous sûr de vouloir charger les scénarios par défaut ? Cela écrasera tous les changements non sauvegardés.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scenarioService.loadDefaultScenariosManually().subscribe(
          scenarios => {
            this.scenarios = scenarios;
            this.selectedTabIndex = 0;
            this._snackBar.open('Scénarios par défaut chargés avec succès', 'Fermer', { duration: 3000 });
          },
          error => {
            console.error('Erreur lors du chargement des scénarios par défaut', error);
            this._snackBar.open('Erreur lors du chargement des scénarios par défaut', 'Fermer', { duration: 3000 });
          }
        );
      }
    });
  }

  updateScenario(updatedScenario: Scenario, index: number) {
    this.scenarios[index] = updatedScenario;
    this.scenarioService.updateScenario(updatedScenario).subscribe();
  }

  deleteScenario(index: number) {
    const scenarioToDelete = this.scenarios[index];
    this.scenarioService.deleteScenario(scenarioToDelete.name).subscribe(() => {
      this.scenarios.splice(index, 1);
      if (this.selectedTabIndex >= this.scenarios.length) {
        this.selectedTabIndex = Math.max(0, this.scenarios.length - 1);
      }
    });
  }


  duplicateLastScenario() {
    if (this.scenarios.length > 0) {
      const lastScenario = this.scenarios[this.scenarios.length - 1];
      const newScenario: Scenario = JSON.parse(JSON.stringify(lastScenario));
      newScenario.name = `${newScenario.name} (copie)`;

      this.scenarioService.addScenario(newScenario).subscribe(() => {
        this.selectedTabIndex = this.scenarios.length - 1;
        this._snackBar.open('Scénario dupliqué avec succès', 'Fermer', { duration: 3000 });
      });
    } else {
      this._snackBar.open('Aucun scénario à dupliquer', 'Fermer', { duration: 3000 });
    }
  }


  addScenario() {
    const newScenario: Scenario = {
      name: 'Nouveau scénario',
      participation: 0,
      reveilDeLaGauche : 0,
      groupement: [],
      'LREM vs Front Populaire': [],
      'RN vs LREM': [],
      'RN vs Front Populaire': [],
      'RN vs LREM vs Front Populaire': [],
      result: {}
    };
    this.scenarioService.addScenario(newScenario).subscribe(addedScenario => {
      this.scenarios.push(addedScenario);
      this.selectedTabIndex = this.scenarios.length - 1;
    });
  }
}