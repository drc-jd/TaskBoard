import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PmsreportRoutingModule } from './pmsreport-routing.module';
import { PmsreportComponent } from './pmsreport.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectiveModule } from 'src/app/Directive/shareddirecitve.module';


@NgModule({
  declarations: [
    PmsreportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedDirectiveModule,
    PmsreportRoutingModule
  ]
})
export class PmsreportModule { }
