import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from '../login/login.component';
import { SharedDirectiveModule } from 'src/app/Directive/shareddirecitve.module';
import { FormsModule } from '@angular/forms';
import { Helper } from 'src/environments/Helper';


@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedDirectiveModule,
    LoginRoutingModule
  ],
  providers: [Helper]
})
export class LoginModule { }
