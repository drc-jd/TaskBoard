import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DeveloperdashComponent } from './Developerdash/developerdash.component';
import { ManagerdashComponent } from './Managerdash/managerdash.component';
import { AuthoritydashComponent } from './Authoritydash/authoritydash.component';
import { FormsModule } from '@angular/forms';


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
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
