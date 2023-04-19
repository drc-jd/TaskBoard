import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewRoutingModule } from './view-routing.module';
import { ViewComponent } from '../view/view.component';
import { Helper } from 'src/environments/Helper';
import { FormsModule } from '@angular/forms';
import { SharedDirectiveModule } from '../Directive/shareddirecitve.module';


@NgModule({
  declarations: [
    ViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedDirectiveModule,
    ViewRoutingModule
  ],
  providers: [Helper]
})
export class ViewModule { }
