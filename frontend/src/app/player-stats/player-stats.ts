import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs';

import { PlayerService, PlayerStats } from '../player';
import { PlayerChartsComponent } from './player-charts';

@Component({
  selector: 'app-player-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerChartsComponent],
  templateUrl: './player-stats.html',
  styleUrls: ['./player-stats.css'],
})
export class PlayerStatsComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playerService = inject(PlayerService);

  private readonly destroy$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();

  players: PlayerStats[] = [];
  allPlayers: PlayerStats[] = [];
  chartPlayers: PlayerStats[] = [];

  teams: string[] = [
    'Royal Challengers Bengaluru',
    'Mumbai Indians',
    'Chennai Super Kings',
    'Punjab Kings',
    'Kolkata Knight Riders',
    'Rajasthan Royals',
    'Sunrisers Hyderabad',
    'Delhi Capitals',
    'Gujarat Titans',
    'Lucknow Super Giants',
  ];

  seasons: number[] = Array.from(
    { length: 2025 - 2008 + 1 },
    (_, index) => 2008 + index
  );

  selectedTeam = '';
  selectedSeason: number | null = null;

  sortField = 'runs';
  sortDirection: 'asc' | 'desc' = 'desc';

  searchText = '';

  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  isLoading = false;
  errorMessage = '';

  private searchRequestVersion = 0;

  ngOnInit(): void {

    this.loadChartData();

    this.searchInput$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.updateChartPlayers();
        this.loadPlayers();
      });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {

        this.selectedTeam = params['team'] || '';

        const seasonValue = Number(params['season']);

        this.selectedSeason =
          params['season'] && Number.isInteger(seasonValue)
            ? seasonValue
            : null;

        this.currentPage = 0;

        this.updateChartPlayers();
        this.loadPlayers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadChartData(): void {

    this.playerService.getAllPlayers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allPlayers = Array.isArray(data) ? data : [];
          this.updateChartPlayers();
        },
        error: (error: Error) => {
          console.error('Chart data loading failed:', error);
        }
      });
  }

  private updateChartPlayers(): void {

    const normalizedSearch = this.searchText.trim().toLowerCase();

    this.chartPlayers = this.allPlayers.filter((player) => {

      const matchesTeam =
        !this.selectedTeam ||
        player.team?.toLowerCase() === this.selectedTeam.toLowerCase();

      const matchesSeason =
        this.selectedSeason === null ||
        player.season === this.selectedSeason;

      const matchesPlayer =
        !normalizedSearch ||
        player.player?.toLowerCase().includes(normalizedSearch);

      return matchesTeam && matchesSeason && matchesPlayer;
    });
  }

  loadPlayers(): void {

    const requestVersion = ++this.searchRequestVersion;

    this.isLoading = true;
    this.errorMessage = '';

    this.playerService.searchPlayers({
      team: this.selectedTeam || undefined,
      season: this.selectedSeason,
      playerName: this.searchText.trim() || undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortField,
      direction: this.sortDirection
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({

      next: (response) => {

        if (requestVersion !== this.searchRequestVersion) {
          return;
        }

        this.players = response.content || [];
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;

        this.isLoading = false;
      },

      error: (error: Error) => {

        if (requestVersion !== this.searchRequestVersion) {
          return;
        }

        this.players = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.isLoading = false;

        this.errorMessage =
          error.message || 'Unable to load player statistics.';
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.updateChartPlayers();
    this.loadPlayers();
  }

  onSearchChange(): void {
    this.searchInput$.next(this.searchText);
  }

  selectTeam(team: string): void {
    this.selectedTeam = team;
    this.currentPage = 0;
    this.updateUrlAndLoad();
  }

  selectSeason(season: number | null): void {
    this.selectedSeason = season;
    this.currentPage = 0;
    this.updateUrlAndLoad();
  }

  toggleSort(field: string): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }

    this.currentPage = 0;
    this.loadPlayers();
  }

  goToPage(page: number): void {

    if (
      page < 0 ||
      page >= this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.loadPlayers();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  clearFilters(): void {

    this.selectedTeam = '';
    this.selectedSeason = null;

    this.sortField = 'runs';
    this.sortDirection = 'desc';

    this.searchText = '';
    this.currentPage = 0;

    this.searchInput$.next('');
    this.updateChartPlayers();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        team: null,
        season: null
      },
      queryParamsHandling: 'merge'
    });
  }

  private updateUrlAndLoad(): void {

    this.updateChartPlayers();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        team: this.selectedTeam || null,
        season: this.selectedSeason
      },
      queryParamsHandling: 'merge'
    });
  }

  get pageStart(): number {
    return this.totalElements === 0
      ? 0
      : this.currentPage * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(
      (this.currentPage + 1) * this.pageSize,
      this.totalElements
    );
  }

  get visiblePages(): number[] {

    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);

    return Array.from(
      { length: Math.max(0, end - start) },
      (_, index) => start + index
    );
  }
}