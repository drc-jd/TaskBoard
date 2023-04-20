import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatewisetasksRoutingModule } from './datewisetasks-routing.module';
import { DatewisetasksComponent } from './datewisetasks.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DatewisetasksComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DatewisetasksRoutingModule
  ]
})
export class DatewisetasksModule { }
