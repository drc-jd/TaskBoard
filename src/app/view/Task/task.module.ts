import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskRoutingModule } from './task-routing.module';
import { TaskComponent } from '../Task/task.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectiveModule } from 'src/app/Directive/shareddirecitve.module';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { StarRatingModule } from 'angular-star-rating';


@NgModule({
  declarations: [
    TaskComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedDirectiveModule,
    StarRatingModule,
    AngularMultiSelectModule,
    TaskRoutingModule
  ]
})
export class TaskModule { }
