import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingtaskComponent } from './pendingtask.component';

const routes: Routes = [
  { path: '', component: PendingtaskComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingtaskRoutingModule { }
