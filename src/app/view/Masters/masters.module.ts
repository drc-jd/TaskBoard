import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MastersRoutingModule } from './masters-routing.module';
import { MastersComponent } from '../Masters/masters.component';
import { FormsModule } from '@angular/forms';
import { ProjectlistComponent } from './ProjectList/projectlist.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { AgModule } from '../Common/ag-grid/ag-grid.module';
import { UsersComponent } from './Users/users.component';
import { SharedDirectiveModule } from 'src/app/Directive/shareddirecitve.module';


@NgModule({
  declarations: [
    MastersComponent,
    ProjectlistComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    AgModule,
    FormsModule,
    AngularMultiSelectModule,
    SharedDirectiveModule,
    MastersRoutingModule
  ]
})
export class MastersModule { }
