import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatewisetasksComponent } from './datewisetasks.component';

const routes: Routes = [
  { path: '', component: DatewisetasksComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatewisetasksRoutingModule { }
