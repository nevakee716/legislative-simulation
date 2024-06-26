import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-assembly-results-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './assembly-results-chart.component.html',
  styleUrl: './assembly-results-chart.component.scss'
})

export class AssemblyResultsChartComponent implements OnChanges {
  @Input() results: any;

  public chartPlugins = [ChartDataLabels];

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: false
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels![ctx.dataIndex];
          return `${label}\n${value}`;
        },
        align: 'center',
        anchor: 'center'
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20
      }
    },
  };

  public chartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      circumference: 180,
      rotation: 270,
    }]
  };

  public chartType: ChartType = 'doughnut';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['results']) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    const orderParties = ['Front Populaire', 'LREM', 'RN', 'Autres'];
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColors = [
      '#FF0000',  // Front Populaire
      '#FFEB00',  // LREM
      '#0072BB',  // RN
      '#808080'   // Autres
    ];

    orderParties.forEach(party => {
      if (party === 'Autres') {
        const othersValue = this.results['undefined'] || 0;
        if (othersValue > 0) {
          labels.push('Autres');
          data.push(othersValue);
        }
      } else if (this.results.hasOwnProperty(party)) {
        labels.push(party);
        data.push(this.results[party]);
      }
    });

    this.chartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        circumference: 180,
        rotation: 270,
      }]
    };
  }
}