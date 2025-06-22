import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css'],
})
export class HomepageComponent {
  teams = ['RCB', 'MI', 'CSK', 'PBKS', 'KKR', 'RR', 'SRH', 'DC', 'GT', 'LSG'];
  selectedTeam = '';
  selectedSeason: number | null = null;
  seasons = Array.from({ length: 2025 - 2008 + 1 }, (_, i) => 2008 + i);

  showSelection = false;

  constructor(private router: Router) {}

  get backgroundStyle() {
    return {
      'background-image': `url('./assets/images/stadium.jpg')`,
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
    };
  }

  goToStats() {
    if (this.selectedTeam) {
      this.router.navigate(['/stats'], {
        queryParams: {
          team: this.selectedTeam,
          season: this.selectedSeason ?? '',
        },
      });
    }
  }
}
