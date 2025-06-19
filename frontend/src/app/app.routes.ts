import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage';
import { PlayerStatsComponent } from './player-stats/player-stats';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'stats', component: PlayerStatsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
