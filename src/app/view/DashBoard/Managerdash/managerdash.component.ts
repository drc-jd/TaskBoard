import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { DashboardService } from 'src/app/Services/Common/Dashboard.service';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { TaskService } from 'src/app/Services/Task/Task.service';
import { Helper, MessageType } from 'src/environments/Helper';

@Component({
  selector: 'app-managerdash',
  templateUrl: './managerdash.component.html',
  styleUrls: ['./managerdash.component.css']
})
export class ManagerdashComponent implements OnInit {

  //#region Declaration
  public totalTask: string = "0";
  public CompletedTask: string = "0";
  public InProgress: string = "0";
  public ratio: number = 0;

  public totalTime: string = "0";
  public pendingTime: string = "0";
  public actualTime: string = "0";

  public averageRating: number = 0;
  public totalRatedTask: number = 0;
  public totalRating: number = 0;

  public ddlReportType: string[] = ["In Progess", "Rating Pending", "Completed"]
  public selectedReportType: string = "In Progess";

  public developerID: number = 0;
  public developerName: string;

  public tblTaskList: object[] = [];
  public tblUsers: object[] = [];
  public UserInfo: UserInfo;
  //#endregion

  constructor(private errorService: ErrorDialogueService,
    private spinnerService: NgxSpinnerService,
    private Service: DashboardService,
    private taskService: TaskService,
    private toastr: ToastrService,
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
        UserId: this.UserInfo.userId
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          console.log(response.dataList['ds'])
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
          if (response.dataList['ds']['table2'].length > 0) {
            this.averageRating = response.dataList['ds']['table2'][0]['average'];
            this.totalRatedTask = response.dataList['ds']['table2'][0]['totalTask'];
            this.totalRating = response.dataList['ds']['table2'][0]['totalRatings'];
          }
          else {
            this.averageRating = 0;
            this.totalRatedTask = 0;
            this.totalRating = 0;
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
  public async GetTask() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GetTask',
        ReportType: this.selectedReportType,
        UserId: this.developerID
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.tblTaskList = response.dataList['ds']['table'];
          this.tblTaskList.forEach(element => {
            element['devData'] = response.dataList['ds']['table1'].filter(f => f['taskId'] == element['id']);
            element['disableComplete'] = element['devData'].find(f => f['completeDate'] == null) == undefined ? false : true;
            if (response.dataList['ds']['table2'].length > 0) {
              let utMin: Object = response.dataList['ds']['table2'].filter(d => d['taskId'] == element['id'])[0];
              element['Progress'] = this.helper.getDecimal((utMin['usedMins'] * 100) / utMin['totalMins']).toFixed(2);
              element['TotalHours'] = this.helper.getDecimal(response.dataList['ds']['table2'].filter(f => f['taskId'] == element['id'])[0]['finalTotalHours']).toFixed(2);
              element['UtilizeHours'] = this.helper.getDecimal(response.dataList['ds']['table2'].filter(f => f['taskId'] == element['id'])[0]['utilizeHours']).toFixed(2);
              element['PendingHours'] = this.helper.getDecimal(response.dataList['ds']['table2'].filter(f => f['taskId'] == element['id'])[0]['finalPendingHours']).toFixed(2);
            }
            element['Files'] = [];
            if (this.helper.getStringOrEmpty(element['fileList']) != "") {
              element['fileList'].split("|").forEach(f => {
                element['Files'].push(f);
              });
            }
          });
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
  public async DownloadFile(fileName: string) {
    try {
      this.spinnerService.show();
      await this.taskService.Download(fileName)
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  //#endregion

  //#region Other Methods
  public async DeveloperCardClick(data: object) {
    this.developerID = data['id'];
    this.developerName = data['fullName'];
    await this.GetTask();
  }
  public async CloseUser() {
    this.developerID = 0;
    this.developerName = null;
    this.tblTaskList = [];
    this.selectedReportType = "In Progess";
  }
  //#endregion

}
