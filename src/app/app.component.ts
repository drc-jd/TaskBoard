import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    let obj = await this.http.get('./../assets/variable.json').toPromise() as any;
    if (obj && obj.apiBaseUrl) {
      environment.apiBaseUrl = obj.apiBaseUrl;
    }
    // if (sessionStorage.getItem("fxCredentials") != null) {
    //   await this.appreload.getGSuser();
    // }
  }

}
