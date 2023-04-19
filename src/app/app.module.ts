import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthGuard } from './Services/Common/auth.guard';
import { StarRatingModule } from 'angular-star-rating';
import { DragulaModule } from 'ng2-dragula';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    StarRatingModule.forRoot(),
    DragulaModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [AuthGuard, ToastrService],
  bootstrap: [AppComponent]
})
export class AppModule { }
