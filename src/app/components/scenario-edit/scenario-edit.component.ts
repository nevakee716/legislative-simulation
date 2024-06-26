import { Component, Input, Output, EventEmitter, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { Scenario } from '../../models/scenario.model';
import { ScenarioResultComponent } from '../scenario-result/scenario-result.component';
import { LegislativeSimulationService } from '../../services/legislative-simulation.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-scenario-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatSliderModule,
    MatCheckboxModule ,
    MatDividerModule,
    MatCardModule,
    MatTooltipModule, 
    ScenarioResultComponent
  ],
  templateUrl: './scenario-edit.component.html',
  styleUrl: './scenario-edit.component.scss'
})
export class ScenarioEditComponent implements OnInit {
  @Input({ required: true }) set scenario(value: Scenario) {
    this._scenario = value;
    this.initForms();
    if (value) {
      this.updateFormsFromScenario(value);
    }
  }
  @Output() scenarioUpdated = new EventEmitter<Scenario>();
  @Output() scenarioDeleted = new EventEmitter<void>();

  private _scenario!: Scenario;
  scenarioForm!: FormGroup;
  jsonEditorForm!: FormGroup;
  scenarioResult: any;

  private formChanges$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private simulationService: LegislativeSimulationService
  ) {}


  formatLabel(value: number): string {
    return `${value}%`;
  }


  ngOnInit() {
    this.simulationService.loadInitialData().subscribe(() => {
      console.log('Données de simulation chargées');

      if (this._scenario) {
        this.updateFormsFromScenario(this._scenario);
        this.updateScenarioResult()
      }
    });

    this.formChanges$.pipe(
      debounceTime(300), // Ajoute un délai de 300ms
      takeUntil(this.destroy$)
    ).subscribe(() => {
      
      this.updateScenarioResult();
    });
  }


  initForms() {
    this.scenarioForm = this.fb.group({
      name: ['', Validators.required],
      reveilDeLaGauche: [0, [Validators.required, Validators.min(0), Validators.max(30)]],
      participation: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      psRatio: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      lremToNfpRatio: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      lrToNfpRatio: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      lrToRNRatio: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      nfpRetreatIf3rd: [false],
      lremRetreatIf3rd: [false]
    });

    this.jsonEditorForm = this.fb.group({
      jsonContent: ['', Validators.required]
    });

    this.scenarioForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.formChanges$.next();
    });

    if (this._scenario) {
      this.updateFormsFromScenario(this._scenario);
    }
  }

  private getCurrentScenario(): Scenario {
    const formValue = this.scenarioForm.value;
    return this.setRatios(formValue);
  }

  updateScenarioResult() {
    const updatedScenario = this.getCurrentScenario(); 
    this.scenarioResult = this.simulationService.simulateResult(updatedScenario).results;
    this.updateJsonEditor(updatedScenario);
  }

  updateFormsFromScenario(scenario: Scenario) {
    this.scenarioForm.patchValue({
      name: scenario.name,
      participation: this.toPercentage(scenario.participation),
      reveilDeLaGauche: this.toPercentage(scenario.reveilDeLaGauche ?? 0), // pas compris
      psRatio: this.toPercentage(this.getPSRatio(scenario)),
      lremToNfpRatio: this.toPercentage(this.getLREMToNFPRatio(scenario)),
      lrToNfpRatio: this.toPercentage(this.getLRToNFPRatio(scenario)),
      lrToRNRatio: this.toPercentage(this.getLRToRNRatio(scenario)),
      nfpRetreatIf3rd: scenario.nfpRetreatIf3rd || false,
      lremRetreatIf3rd: scenario.lremRetreatIf3rd || false
    }, { emitEvent: false });

    this.updateJsonEditor(scenario);
  }

  updateJsonEditor(scenario: Scenario) {
    this.jsonEditorForm.patchValue({
      jsonContent: JSON.stringify(scenario, null, 2)
    }, { emitEvent: false });
  }
  getPSRatio(scenario: Scenario): number {
    const frontPopulaire = scenario.groupement.find(g => g.name === "Front Populaire");
    if (frontPopulaire) {
      const ps = frontPopulaire.regroupement.find(r => r.name === "PS");
      return ps ? ps.ratio : 0;
    }
    return 0;
  }

  getLREMToNFPRatio(scenario: Scenario): number {
    const frontPopulaire = scenario["RN vs Front Populaire"]?.find(g => g.name === "Front Populaire");
    return frontPopulaire?.regroupement.find(r => r.name === "LREM")?.ratio || 0;
  }

  getLRToNFPRatio(scenario: Scenario): number {
    const frontPopulaire = scenario["RN vs Front Populaire"]?.find(g => g.name === "Front Populaire");
    return frontPopulaire?.regroupement.find(r => r.name === "LR")?.ratio || 0;
  }

  getLRToRNRatio(scenario: Scenario): number {
    const rn = scenario["RN vs Front Populaire"]?.find(g => g.name === "RN");
    return rn?.regroupement.find(r => r.name === "LR")?.ratio || 0;
  }

  setRatios(formValue: any): Scenario {
    const updatedScenario = { ...this._scenario };
    updatedScenario.name = formValue.name;
    updatedScenario.participation = this.fromPercentage(formValue.participation);
    updatedScenario.reveilDeLaGauche = this.fromPercentage(formValue.reveilDeLaGauche);
    updatedScenario.nfpRetreatIf3rd = formValue.nfpRetreatIf3rd;
    updatedScenario.lremRetreatIf3rd = formValue.lremRetreatIf3rd;

    const frontPopulaire = updatedScenario.groupement.find(g => g.name === "Front Populaire");
    if (frontPopulaire) {
      const ps = frontPopulaire.regroupement.find(r => r.name === "PS");
      if (ps) {
        ps.ratio = this.fromPercentage(formValue.psRatio);
      }
    }

    const LREM = updatedScenario.groupement.find(g => g.name === "LREM");
    if (LREM) {
      const ps = LREM.regroupement.find(r => r.name === "PS");
      if (ps) {
        ps.ratio = 1 - this.fromPercentage(formValue.psRatio);
      }
    }

    const frontPopulaireDuel = updatedScenario["RN vs Front Populaire"]?.find(g => g.name === "Front Populaire");
    if (frontPopulaireDuel) {
      const lrem = frontPopulaireDuel.regroupement.find(r => r.name === "LREM");
      if (lrem) {
        lrem.ratio = this.fromPercentage(formValue.lremToNfpRatio);
      } else {
        frontPopulaireDuel.regroupement.push({ name: "LREM", ratio: this.fromPercentage(formValue.lremToNfpRatio) });
      }

      const lr = frontPopulaireDuel.regroupement.find(r => r.name === "LR");
      if (lr) {
        lr.ratio = this.fromPercentage(formValue.lrToNfpRatio);
      } else {
        frontPopulaireDuel.regroupement.push({ name: "LR", ratio: this.fromPercentage(formValue.lrToNfpRatio) });
      }
    }

    const rn = updatedScenario["RN vs Front Populaire"]?.find(g => g.name === "RN");
    if (rn) {
      const lr = rn.regroupement.find(r => r.name === "LR");
      if (lr) {
        lr.ratio = this.fromPercentage(formValue.lrToRNRatio);
      } else {
        rn.regroupement.push({ name: "LR", ratio: this.fromPercentage(formValue.lrToRNRatio) });
      }
    }

    return updatedScenario;
  }

  saveScenario() {
    if (this.scenarioForm.valid) {
      const updatedScenario = this.getCurrentScenario();
      this.scenarioUpdated.emit(updatedScenario);
    }
  }

  deleteScenario() {
    this.scenarioDeleted.emit();
  }

  saveJsonScenario() {
    if (this.jsonEditorForm.valid) {
      try {
        const updatedScenario = JSON.parse(this.jsonEditorForm.value.jsonContent);
        this._scenario = updatedScenario;
        this.updateFormsFromScenario(updatedScenario);
        this.scenarioUpdated.emit(updatedScenario);
      } catch (error) {
        console.error('Invalid JSON', error);
        // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
      }
    }
  }

  private toPercentage(value: number): number {
    return Math.round(value * 100);
  }

  private fromPercentage(value: number): number {
    return value / 100;
  }
}