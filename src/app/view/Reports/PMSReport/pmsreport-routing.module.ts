import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PmsreportComponent } from './pmsreport.component';

const routes: Routes = [
  { path: '', component: PmsreportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PmsreportRoutingModule { }
