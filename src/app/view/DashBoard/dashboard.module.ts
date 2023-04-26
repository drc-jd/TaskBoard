import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DeveloperdashComponent } from './Developerdash/developerdash.component';
import { ManagerdashComponent } from './Managerdash/managerdash.component';
import { AuthoritydashComponent } from './Authoritydash/authoritydash.component';
import { FormsModule } from '@angular/forms';
import { StarRatingModule } from 'angular-star-rating';
import { SharedDirectiveModule } from 'src/app/Directive/shareddirecitve.module';


@NgModule({
  declarations: [
    DashboardComponent,
    DeveloperdashComponent,
    ManagerdashComponent,
    AuthoritydashComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    StarRatingModule,
    SharedDirectiveModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
