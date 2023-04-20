import { Component, OnInit } from '@angular/core';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  //#region Declaration
  public UserInfo: UserInfo;
  //#endregion

  constructor(private header: HeaderNameService) { this.header.NewHeaderName("DashBoard"); }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
  }

}
