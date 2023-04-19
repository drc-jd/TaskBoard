import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridComponent } from './ag-grid.component';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [AgGridComponent],
  imports: [
    CommonModule,
    FormsModule,    
    AgGridModule.withComponents([]),
  ],
  exports: [AgGridComponent],
})
export class AgModule { }
