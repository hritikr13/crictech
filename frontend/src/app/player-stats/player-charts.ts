import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { PlayerStats } from '../player';

@Component({
  selector: 'app-player-charts',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './player-charts.html',
  styleUrls: ['./player-charts.css']
})
export class PlayerChartsComponent implements OnChanges {
  @Input() players: PlayerStats[] = [];

  topRunScorersChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  topWicketTakersChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  topStrikeRateChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true
      },
      legend: {
        display: true,
        position: 'bottom'
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  ngOnChanges() {
    if (this.players?.length) {
      const topRuns = [...this.players].sort((a, b) => b.runs - a.runs).slice(0, 5);
      const topWickets = [...this.players].sort((a, b) => b.wickets - a.wickets).slice(0, 5);
      const topStrikeRates = [...this.players].sort((a, b) => b.strikeRate - a.strikeRate).slice(0, 5);

      this.topRunScorersChart = {
        labels: topRuns.map(p => p.player),
        datasets: [
          {
            label: 'Runs',
            data: topRuns.map(p => p.runs),
            backgroundColor: '#42A5F5'
          }
        ]
      };

      this.topWicketTakersChart = {
        labels: topWickets.map(p => p.player),
        datasets: [
          {
            label: 'Wickets',
            data: topWickets.map(p => p.wickets),
            backgroundColor: '#66BB6A'
          }
        ]
      };

      this.topStrikeRateChart = {
        labels: topStrikeRates.map(p => p.player),
        datasets: [
          {
            label: 'Strike Rate',
            data: topStrikeRates.map(p => p.strikeRate),
            backgroundColor: '#FFA726'
          }
        ]
      };
    }
  }
}
