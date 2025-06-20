import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService, PlayerStats } from '../player';
import { PlayerChartsComponent } from './player-charts';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerChartsComponent],
  templateUrl: './player-stats.html',
  styleUrls: ['./player-stats.css'],
})
export class PlayerStatsComponent {
  players: PlayerStats[] = [];
  allPlayers: PlayerStats[] = [];

  teams: string[] = [
    'RCB',
    'MI',
    'CSK',
    'PBKS',
    'KKR',
    'RR',
    'SRH',
    'DC',
    'GT',
    'LSG',
  ];
  seasons: number[] = Array.from(
    { length: 2025 - 2008 + 1 },
    (_, i) => 2008 + i
  ); // [2008..2025]

  selectedTeam: string = '';
  selectedSeason: number | null = null;

  sortField: 'runs' | 'wickets' | 'season' | '' = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.selectedTeam = params['team'] || '';
      this.selectedSeason = params['season'] ? +params['season'] : null;

      this.playerService.getAllPlayers().subscribe((data) => {
        this.allPlayers = data;
        this.applyFilters();
      });
    });
  }

  applyFilters() {
  let filtered = [...this.allPlayers];

  if (this.selectedTeam && this.selectedTeam.trim() !== '') {
    filtered = filtered.filter(p => p.team === this.selectedTeam);
  }

  if (this.selectedSeason !== null) {
    filtered = filtered.filter(p => p.season === this.selectedSeason);
  }

  if (this.sortField) {
    const field = this.sortField as keyof PlayerStats;
    filtered = filtered.sort((a, b) => {
      const valA = Number(a[field]);
      const valB = Number(b[field]);
      return this.sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }

  this.players = filtered;
}


  selectTeam(team: string) {
    this.selectedTeam = team.trim(); // sanitize
    this.applyFilters();
  }

  selectSeason(season: number | null) {
    this.selectedSeason = season;
    this.applyFilters();
  }

  toggleSort(field: 'runs' | 'wickets' | 'season') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  clearFilters() {
  this.selectedTeam = '';
  this.selectedSeason = null;
  this.sortField = '';
  this.sortDirection = 'desc';
  this.applyFilters();
}
}
