import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../Services/Common/auth.guard';
import { ViewComponent } from './view.component';

const routes: Routes = [
  {
    path: '', component: ViewComponent, children: [
      { path: '', redirectTo: 'Dashboard', canActivate: [AuthGuard] },
      { path: 'Dashboard', loadChildren: () => import('./DashBoard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
      { path: 'Masters', loadChildren: () => import('./Masters/masters.module').then(m => m.MastersModule), canActivate: [AuthGuard] },
      { path: 'Task', loadChildren: () => import('./Task/task.module').then(m => m.TaskModule), canActivate: [AuthGuard] },
      { path: 'Projects', loadChildren: () => import('./Projects/projects.module').then(m => m.ProjectsModule), canActivate: [AuthGuard] },
      { path: 'PendingTask/:id/:name', loadChildren: () => import('./Projects/PendingTask/pendingtask.module').then(m => m.PendingtaskModule), canActivate: [AuthGuard] },
      { path: 'PMSReport', loadChildren: () => import('./Reports/PMSReport/pmsreport.module').then(m => m.PmsreportModule), canActivate: [AuthGuard] },
      { path: 'DatewiseTasksReport', loadChildren: () => import('./Reports/datewisetasks/datewisetasks.module').then(m => m.DatewisetasksModule), canActivate: [AuthGuard] }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }
