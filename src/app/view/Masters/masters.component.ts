import { Component, OnInit } from '@angular/core';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';

@Component({
  selector: 'app-masters',
  templateUrl: './masters.component.html',
  styleUrls: ['./masters.component.css']
})
export class MastersComponent implements OnInit {

  //#region Declaration
  public visibleUser: boolean = true;
  public visibleProjectList: boolean = false;
  //#endregion

  constructor(private header: HeaderNameService) { this.header.NewHeaderName("Master"); }

  async ngOnInit() {
  }

  //#region API Methods
  public async changeTab(tab: string) {
    this.visibleProjectList = false;
    this.visibleUser = false;
    switch (tab.toUpperCase()) {
      case 'USERS':
        this.visibleUser = true;
        break;
      case 'PROJECTLIST':
        this.visibleProjectList = true;
        break;
    }
  }
  //#endregion
}
