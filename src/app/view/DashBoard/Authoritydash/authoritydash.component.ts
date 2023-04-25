import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { DashboardService } from 'src/app/Services/Common/Dashboard.service';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { MessageType } from 'src/environments/Helper';

@Component({
  selector: 'app-authoritydash',
  templateUrl: './authoritydash.component.html',
  styleUrls: ['./authoritydash.component.css']
})
export class AuthoritydashComponent implements OnInit {

  //#region Declaration
  public totalTask: string = "0";
  public CompletedTask: string = "0";
  public InProgress: string = "0";
  public ratio: number = 0;

  public totalTime: string = "0";
  public pendingTime: string = "0";
  public actualTime: string = "0";

  public tblUsers: object[] = [];
  public UserInfo: UserInfo;
  //#endregion

  constructor(private errorService: ErrorDialogueService,
    private spinnerService: NgxSpinnerService,
    private Service: DashboardService,
    // private taskService: TaskService,
    private toastr: ToastrService) { }

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
        UserId: this.UserInfo.userId
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          console.log(response.dataList['ds']);
          this.tblUsers = response.dataList['ds']['table'];
          if (response.dataList['ds']['table1'].length > 0) {
            this.totalTask = response.dataList['ds']['table1'][0]['totalTasks'];
            this.CompletedTask = response.dataList['ds']['table1'][0]['completed'];
            this.InProgress = response.dataList['ds']['table1'][0]['inProgress'];
            this.ratio = response.dataList['ds']['table1'][0]['ratio'];

            this.totalTime = response.dataList['ds']['table1'][0]['approxHours'];
            this.pendingTime = response.dataList['ds']['table1'][0]['pendingHours'];
            this.actualTime = response.dataList['ds']['table1'][0]['spentHours'];
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
