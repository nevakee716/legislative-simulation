import { Routes } from '@angular/router';
import { ScenarioEditComponent } from './components/scenario-edit/scenario-edit.component';
import { ScenarioListComponent } from './components/scenario-list/scenario-list.component';

export const routes: Routes = [
  { path: 'scenarios', component: ScenarioListComponent },
  { path: '', redirectTo: '/scenarios', pathMatch: 'full' }
];