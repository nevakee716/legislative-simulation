import { Component, input, computed, signal,effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {
  data = input.required<{ [key: string]: number }>();
  title = input<string>("title");



  chartData = computed(() => {
    const currentData = this.data();
    const sortedData = Object.entries(currentData)
      .sort(([, a], [, b]) => b - a);

    return {
      labels: sortedData.map(([label]) => this.formatLabel(label)),
      datasets: [
        {
          data: sortedData.map(([, value]) => value),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'
          ]
        }
      ]
    } as ChartData<'bar'>;
  });

  chartOptions = computed(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: this.title()
        }
      }
    }
  } as ChartConfiguration['options']));

  public chartType: ChartType = 'bar';

  constructor() {
    effect(() => {
      console.log("Data changed:", this.data());
      console.log("Chart data updated:", this.chartData());
    });
  }

  private formatLabel(label: string): string {
    return label
  }
}