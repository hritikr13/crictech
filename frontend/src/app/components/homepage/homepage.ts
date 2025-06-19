import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})
export class HomepageComponent {
  teams = ['RCB', 'MI', 'CSK', 'PBKS', 'KKR', 'RR', 'SRH', 'DC', 'GT', 'LSG'];
  selectedTeam = '';
  selectedSeason: number | null = null;
  seasons = Array.from({ length: 2025 - 2008 + 1 }, (_, i) => 2008 + i); // [2008..2025]

  constructor(private router: Router) {}

  showSelection = false;

  goToStats() {
    if (this.selectedTeam) {
      this.router.navigate(['/stats'], {
        queryParams: {
          team: this.selectedTeam,
          season: this.selectedSeason ?? ''
        }
      });
    }
  }
}
