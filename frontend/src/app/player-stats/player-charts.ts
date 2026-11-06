import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { PlayerStats } from '../player';

interface AggregatedPlayerStats {
  player: string;
  runs: number;
  wickets: number;
  weightedStrikeRateTotal: number;
  approximateStrikeRate: number;
}

@Component({
  selector: 'app-player-charts',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './player-charts.html',
  styleUrls: ['./player-charts.css']
})
export class PlayerChartsComponent implements OnChanges {

  @Input() players: PlayerStats[] = [];

  topRunScorersChart: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  topWicketTakersChart: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  topStrikeRateChart: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  readonly chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: '#172235',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        }
      },
      legend: {
        display: false
      }
    },
    animation: {
      duration: 700,
      easing: 'easeOutQuart'
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#edf1f5'
        },
        ticks: {
          precision: 0,
          color: '#64748b'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#475569',
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      }
    }
  };

  ngOnChanges(): void {
    this.updateCharts();
  }

  private aggregatePlayerStats(): AggregatedPlayerStats[] {

    const playerMap = new Map<string, AggregatedPlayerStats>();

    for (const record of this.players ?? []) {

      const playerName = (record.player || 'Unknown Player').trim();
      const playerKey = playerName.toLowerCase();

      const runs = Math.max(0, Number(record.runs) || 0);
      const wickets = Math.max(0, Number(record.wickets) || 0);
      const strikeRate = Math.max(0, Number(record.strikeRate) || 0);

      let player = playerMap.get(playerKey);

      if (!player) {
        player = {
          player: playerName,
          runs: 0,
          wickets: 0,
          weightedStrikeRateTotal: 0,
          approximateStrikeRate: 0
        };

        playerMap.set(playerKey, player);
      }

      player.runs += runs;
      player.wickets += wickets;

      // Approximation using runs-weighted seasonal strike rates.
      // Exact career strike rate requires total balls faced.
      player.weightedStrikeRateTotal += strikeRate * runs;
    }

    return Array.from(playerMap.values()).map((player) => ({
      ...player,
      approximateStrikeRate:
        player.runs > 0
          ? player.weightedStrikeRateTotal / player.runs
          : 0
    }));
  }

  private updateCharts(): void {

    const aggregatedPlayers = this.aggregatePlayerStats();

    // Top five run scorers.
    const topRuns = [...aggregatedPlayers]
      .filter((player) => player.runs > 0)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5);

    this.topRunScorersChart = {
      labels: topRuns.map((player) => player.player),
      datasets: [{
        label: 'Total Runs',
        data: topRuns.map((player) => player.runs),
        backgroundColor: '#2495cc',
        borderRadius: 5,
        barThickness: 22
      }]
    };

    // Top five wicket takers.
    const topWickets = [...aggregatedPlayers]
      .filter((player) => player.wickets > 0)
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 5);

    this.topWicketTakersChart = {
      labels: topWickets.map((player) => player.player),
      datasets: [{
        label: 'Total Wickets',
        data: topWickets.map((player) => player.wickets),
        backgroundColor: '#22a477',
        borderRadius: 5,
        barThickness: 22
      }]
    };

    // Top five approximate strike rates.
    const topStrikeRates = [...aggregatedPlayers]
      .filter(
        (player) =>
          player.runs > 0 &&
          player.approximateStrikeRate > 0
      )
      .sort(
        (a, b) =>
          b.approximateStrikeRate - a.approximateStrikeRate
      )
      .slice(0, 5);

    this.topStrikeRateChart = {
      labels: topStrikeRates.map((player) => player.player),
      datasets: [{
        label: 'Approximate Run-Weighted Strike Rate',
        data: topStrikeRates.map(
          (player) => Number(player.approximateStrikeRate.toFixed(2))
        ),
        backgroundColor: '#e9a23b',
        borderRadius: 5,
        barThickness: 22
      }]
    };
  }
}