import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';

import { DatewisetasksRoutingModule } from './datewisetasks-routing.module';
import { DatewisetasksComponent } from './datewisetasks.component';
import { FormsModule } from '@angular/forms';
import { AgModule } from '../../Common/ag-grid/ag-grid.module';


@NgModule({
  declarations: [
    DatewisetasksComponent
  ],
  imports: [
    AgModule,
    CommonModule,
    FormsModule,
    DatewisetasksRoutingModule
  ],
  providers: [TitleCasePipe]
})
export class DatewisetasksModule { }
