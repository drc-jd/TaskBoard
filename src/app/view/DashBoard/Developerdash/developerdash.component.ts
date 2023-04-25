import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { TooltipDirective } from 'src/app/Directive/tooltip.directive';
import { DashboardService } from 'src/app/Services/Common/Dashboard.service';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { ProjectsService } from 'src/app/Services/Projects/Projects.service';
import { TaskService } from 'src/app/Services/Task/Task.service';
import { Helper, MessageType } from 'src/environments/Helper';
declare var $: any;

@Component({
  selector: 'app-developerdash',
  templateUrl: './developerdash.component.html',
  styleUrls: ['./developerdash.component.css']
})
export class DeveloperdashComponent implements OnInit {

  //#region Declaration Methods
  @ViewChild(TooltipDirective) ToolTip;
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

  public tblTaskList: object[] = [];

  public comment: string;
  public hours: number;
  public minutes: number;
  public refSrNo: number = 0;
  public taskId: number = 0;
  public srNo: number = 0;
  public selectedFiles: object[] = [];

  public ddlReportType: string[] = ["In Progess", "Rating Pending", "Completed"]
  public selectedReportType: string = "In Progess";

  public confirmText: { Header: string, Body: string, Method: string } = {
    Header: '',
    Body: '',
    Method: '',
  };
  public tblComments: object[] = [];

  public UserInfo: UserInfo;
  //#endregion

  constructor(private errorService: ErrorDialogueService,
    private spinnerService: NgxSpinnerService,
    private projectsService: ProjectsService,
    private Service: DashboardService,
    private taskService: TaskService,
    private toastr: ToastrService,
    private helper: Helper) { }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    await this.GetData();
    await this.GetTask();
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
          if (response.dataList['ds']['table'].length > 0) {
            this.totalTask = response.dataList['ds']['table'][0]['total'];
            this.CompletedTask = response.dataList['ds']['table'][0]['complete'];
            this.InProgress = response.dataList['ds']['table'][0]['pending'];
            this.ratio = response.dataList['ds']['table'][0]['ratio'];
          }
          // this.tblTaskList = response.dataList['ds'][''];
          // this.tblTaskList.forEach(element => {
          //   element['devData'] = response.dataList['ds']['1'].filter(f => f['taskId'] == element['id']);
          //   element['disableComplete'] = element['devData'].find(f => f['completeDate'] == null) == undefined ? false : true;
          //   if (response.dataList['ds']['table3'].length > 0) {
          //     let utMin: Object = response.dataList['ds']['table3'].filter(d => d['taskId'] == element['id'])[0];
          //     element['Progress'] = this.helper.getDecimal((utMin['usedMins'] * 100) / utMin['totalMins']).toFixed(2);
          //     element['TotalHours'] = this.helper.getDecimal(response.dataList['ds']['table3'].filter(f => f['taskId'] == element['id'])[0]['finalTotalHours']).toFixed(2);
          //     element['UtilizeHours'] = this.helper.getDecimal(response.dataList['ds']['table3'].filter(f => f['taskId'] == element['id'])[0]['utilizeHours']).toFixed(2);
          //     element['PendingHours'] = this.helper.getDecimal(response.dataList['ds']['table3'].filter(f => f['taskId'] == element['id'])[0]['finalPendingHours']).toFixed(2);
          //   }
          //   element['Files'] = [];
          //   if (this.helper.getStringOrEmpty(element['fileList']) != "") {
          //     element['fileList'].split("|").forEach(f => {
          //       element['Files'].push(f);
          //     });
          //   }
          // });
          if (response.dataList['ds']['table4'].length > 0) {
            this.totalTime = response.dataList['ds']['table4'][0]['totalTime'];
            this.pendingTime = response.dataList['ds']['table4'][0]['pendingTime'];
            this.actualTime = response.dataList['ds']['table4'][0]['actualTime'];
          }
          else {
            this.totalTime = "0";
            this.pendingTime = "0";
            this.actualTime = "0";
          }
          if (response.dataList['ds']['table5'].length > 0) {
            this.averageRating = response.dataList['ds']['table5'][0]['average'];
            this.totalRatedTask = response.dataList['ds']['table5'][0]['totalTask'];
            this.totalRating = response.dataList['ds']['table5'][0]['totalRatings'];
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
        UserId: this.UserInfo.userId
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          console.log(response.dataList['ds'])
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
  public async InsertComment() {
    try {
      this.spinnerService.show();
      if (await this.Validate()) {
        let paraList = {
          Type: 'INSERTCOMMENT',
          RefSrNo: this.refSrNo,
          Hours: this.hours,
          Minutes: this.minutes,
          Comment: this.comment
        }
        let response: ApiResponse = await this.projectsService.Data(paraList);
        if (response.isValidUser) {
          if (response.messageType == MessageType.success) {
            this.toastr.success(response.message)
            if (this.selectedFiles.length > 0) {
              await this.UploadFiles(this.taskId, response.dataList['srNo']);
            }
            await this.Clear();
            await this.GetComments();
          }
          else if (response.messageType == MessageType.error)
            this.toastr.error(response.message);
          else
            this.toastr.error('Something Went Wrong');
        }
      }
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  public async GetComments() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GETCOMMENTS',
        RefSrNo: this.refSrNo
      }
      let response: ApiResponse = await this.projectsService.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.tblComments = response.dataList['tblData'];
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
  public async DeleteComment() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'DELETECOMMENT',
        SrNo: this.srNo
      }
      let response: ApiResponse = await this.projectsService.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
          this.srNo = 0;
          await this.GetComments();
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
  public async CompleteDevComment() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'COMPLETECOMMENT',
        SrNo: this.srNo
      }
      let response: ApiResponse = await this.projectsService.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
          this.srNo = 0;
          await this.GetData();
          await this.GetTask();
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
  public async CompleteTask() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'COMPLETETASK',
        SrNo: this.srNo
      }
      let response: ApiResponse = await this.projectsService.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
          this.srNo = 0;
          await this.GetData();
          await this.GetTask();
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

  //#region Other Methods
  public async addComment(data: object) {
    this.refSrNo = data['srNo'];
    this.taskId = data['taskId'];
    await this.GetComments();
  }
  public async ConfirmDevComment(srNo: number) {
    this.srNo = srNo;
    this.confirmText = {
      Header: 'Complete?', Body: 'Are you sure you want to complete this entry?', Method: 'DevComment'
    }
    $("#openModal")[0].click();
  }
  public async ConfirmTaskComplete(srNo: number) {
    this.srNo = srNo;
    this.confirmText = {
      Header: 'complete?', Body: 'Are you sure you want to complete this task?', Method: 'CompleteTask'
    }
    $("#openModal")[0].click();
  }
  public async ConfirmDelete(srNo: number) {
    this.srNo = srNo;
    this.confirmText = {
      Header: 'Delete?', Body: 'Are you sure you want to delete this comment?', Method: 'DeleteComment'
    }
    $("#openModal")[0].click();
  }
  public async closeDiag() {
    this.tblComments = [];
    this.refSrNo = 0;
    this.taskId = 0;
    this.selectedFiles = [];
    await this.GetData();
    await this.GetTask();
  }
  public async yesClick() {
    if (this.confirmText.Method.toUpperCase() == "DELETECOMMENT")
      await this.DeleteComment();
    else if (this.confirmText.Method.toUpperCase() == "DEVCOMMENT")
      await this.CompleteDevComment();
    else if (this.confirmText.Method.toUpperCase() == "COMPLETETASK")
      await this.CompleteTask();
  }
  public async upload(event: any) {
    this.selectedFiles = [];
    for (let i = 0; i < event.target.files.length; i++) {
      this.selectedFiles.push(event.target.files[i]);
    }
  }
  private async UploadFiles(taskId, CSrNo = 0) {
    try {
      this.spinnerService.show();
      let response: ApiResponse = await this.taskService.uploadFile(this.selectedFiles, taskId, "Developer", CSrNo);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
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
  private async Validate(): Promise<boolean> {
    if (this.helper.getStringOrEmpty(this.comment) == "") {
      this.ToolTip.show(document.getElementById("comment"), "Enter Comment");
      return false;
    }
    else if (this.helper.getInt(this.hours) == 0 && this.helper.getInt(this.minutes) == 0) {
      this.ToolTip.show(document.getElementById("hours"), "Enter Time");
      return false;
    }
    return true;
  }
  public async Clear() {
    this.selectedFiles = [];
    this.hours = null;
    this.minutes = null;
    this.comment = null;
  }
  //#endregion

}
