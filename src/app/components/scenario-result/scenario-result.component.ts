import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AssemblyResultsChartComponent } from '../assembly-results-chart/assembly-results-chart.component';


@Component({
  selector: 'app-scenario-result',
  standalone: true,
  imports: [CommonModule, MatCardModule,AssemblyResultsChartComponent],
  templateUrl: './scenario-result.component.html',
  styleUrl: './scenario-result.component.scss'
})
export class ScenarioResultComponent {
  @Input({ required: true }) result: any;
  formattedResult: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['result']) {
      this.formattedResult = JSON.stringify(this.result, null, 2);
    }
  }
}
