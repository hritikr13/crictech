import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface PlayerStats {
  id?: string;
  player: string;
  team: string;
  season: number;
  runs: number;
  wickets: number;
  strikeRate: number;
}

export interface PlayerStatsFilters {
  team?: string;
  season?: number | null;
  playerName?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/stats';

  getAllPlayers(): Observable<PlayerStats[]> {
    return this.http.get<PlayerStats[]>(`${this.apiUrl}/players`)
      .pipe(catchError(this.handleError));
  }

  getPlayersByTeam(team: string): Observable<PlayerStats[]> {
    return this.http.get<PlayerStats[]>(
      `${this.apiUrl}/team/${encodeURIComponent(team)}`
    ).pipe(catchError(this.handleError));
  }

  getPlayersBySeason(season: number): Observable<PlayerStats[]> {
    return this.http.get<PlayerStats[]>(
      `${this.apiUrl}/season/${season}`
    ).pipe(catchError(this.handleError));
  }

  getPlayersByFilters(
    filters: PlayerStatsFilters
  ): Observable<PlayerStats[]> {

    let params = new HttpParams();

    if (filters.team) {
      params = params.set('team', filters.team);
    }

    if (filters.season) {
      params = params.set('season', filters.season);
    }

    return this.http.get<PlayerStats[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  searchPlayers(
    filters: PlayerStatsFilters
  ): Observable<PaginatedResponse<PlayerStats>> {

    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20)
      .set('sortBy', filters.sortBy ?? 'runs')
      .set('direction', filters.direction ?? 'desc');

    if (filters.team?.trim()) {
      params = params.set('team', filters.team.trim());
    }

    if (filters.season !== undefined && filters.season !== null) {
      params = params.set('season', filters.season);
    }

    if (filters.playerName?.trim()) {
      params = params.set('playerName', filters.playerName.trim());
    }

    return this.http.get<PaginatedResponse<PlayerStats>>(
      `${this.apiUrl}/search`,
      { params }
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'An unexpected error occurred.';

    if (error.status === 0) {
      message = 'Unable to connect to the backend. Check whether Spring Boot is running.';
    } else if (error.status === 400) {
      message = error.error?.message || 'Invalid search parameters.';
    } else if (error.status === 404) {
      message = 'The requested API endpoint was not found.';
    } else if (error.status >= 500) {
      message = 'The backend encountered an error. Check the Spring Boot logs.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    console.error('Player API error:', error);

    return throwError(() => new Error(message));
  }
}