import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';

import { PendingtaskRoutingModule } from './pendingtask-routing.module';
import { PendingtaskComponent } from './pendingtask.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectiveModule } from 'src/app/Directive/shareddirecitve.module';
import { DragulaModule } from 'ng2-dragula';


@NgModule({
  declarations: [
    PendingtaskComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedDirectiveModule,
    DragulaModule.forRoot(),
    PendingtaskRoutingModule
  ],
  providers: [TitleCasePipe]
})
export class PendingtaskModule { }
