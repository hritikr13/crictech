import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlayerStats {
  player: string;
  team: string;
  season: number;
  runs: number;
  wickets: number;
  strikeRate: number;
  role: 'Batsman' | 'Bowler' | 'All-rounder'; // Make sure this field exists
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private baseUrl = 'http://localhost:8080/api/stats';

  constructor(private http: HttpClient) {}

  getAllPlayers(): Observable<PlayerStats[]> {
    return this.http.get<PlayerStats[]>(`${this.baseUrl}/players`);
  }

  getByTeam(team: string): Observable<PlayerStats[]> {
    return this.http.get<PlayerStats[]>(`${this.baseUrl}/team/${team}`);
  }

  getBySeason(season: number): Observable<PlayerStats[]> {
    return this.http.get<PlayerStats[]>(`${this.baseUrl}/season/${season}`);
  }

  getByTeamAndSeason(team: string, season: number): Observable<PlayerStats[]> {
    return this.http.get<PlayerStats[]>(`${this.baseUrl}?team=${team}&season=${season}`);
  }
}
