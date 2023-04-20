import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { DashboardService } from 'src/app/Services/Common/Dashboard.service';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';
import { Helper, MessageType } from 'src/environments/Helper';

@Component({
  selector: 'app-developerdash',
  templateUrl: './developerdash.component.html',
  styleUrls: ['./developerdash.component.css']
})
export class DeveloperdashComponent implements OnInit {

  //#region Declaration Methods
  public totalTask: string = "0";
  public CompletedTask: string = "0";
  public PendingTask: string = "0";
  public ratio: number = 0;
  public UserInfo: UserInfo;
  //#endregion

  constructor(private header: HeaderNameService,
    private errorService: ErrorDialogueService,
    private spinnerService: NgxSpinnerService,
    @Inject(LOCALE_ID) private locale: string,
    private Service: DashboardService,
    private toastr: ToastrService,
    private router: Router,
    private helper: Helper) { }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    await this.GetData();
  }

  //#region API Methods
  private async GetData() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GetData',
        Role: this.UserInfo.role,
        DeveloperId: this.UserInfo.userId
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['ds']['table'].length > 0) {
            console.log(response.dataList['ds']['table']);
            this.totalTask = response.dataList['ds']['table'][0]['total'];
            this.CompletedTask = response.dataList['ds']['table'][0]['complete'];
            this.PendingTask = response.dataList['ds']['table'][0]['pending'];
            this.ratio = response.dataList['ds']['table'][0]['ratio'];
          }
        }
        else if (response.messageType == MessageType.error)
          this.toastr.error(response.message);
        else
          this.toastr.error('Something Went Wrong');
      }
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  //#endregion

}
