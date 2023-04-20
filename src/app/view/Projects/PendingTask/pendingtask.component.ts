import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { TooltipDirective } from 'src/app/Directive/tooltip.directive';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';
import { ProjectsService } from 'src/app/Services/Projects/Projects.service';
import { TaskService } from 'src/app/Services/Task/Task.service';
import { Helper, MessageType } from 'src/environments/Helper';
declare var $: any;

@Component({
  selector: 'app-pendingtask',
  templateUrl: './pendingtask.component.html',
  styleUrls: ['./pendingtask.component.css']
})
export class PendingtaskComponent implements OnInit, OnDestroy {

  //#region Declaration
  @ViewChild(TooltipDirective) ToolTip;
  private projectID: number;
  public projectName: string;
  public UserInfo: UserInfo;
  public tblTaskList: object[] = [];
  public ddlUsers: object[] = [];
  public selectedUsers: string;

  public comment: string;
  public hours: number;
  public minutes: number;
  public refSrNo: number = 0;
  public taskId: number = 0;
  public srNo: number = 0;
  public selectedFiles: object[] = [];
  public confirmText: { Header: string, Body: string, Method: string } = {
    Header: '',
    Body: '',
    Method: '',
  };
  public tblComments: object[] = [];
  public dropSub;
  public dropModel;
  //#endregion

  constructor(private header: HeaderNameService,
    private errorService: ErrorDialogueService,
    private spinnerService: NgxSpinnerService,
    private _Activatedroute: ActivatedRoute,
    private dragulaService: DragulaService,
    private titleCase: TitleCasePipe,
    private Service: ProjectsService,
    private toastr: ToastrService,
    private taskService: TaskService,
    private helper: Helper) {
    this.header.NewHeaderName("Pending Tasks");
  }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    this.projectID = this.helper.getInt(this._Activatedroute.snapshot.paramMap.get("id"));
    this.projectName = this.helper.getString(this._Activatedroute.snapshot.paramMap.get("name"));
    this.projectName = this.titleCase.transform(this.projectName);
    await this.FillCombo();
    await this.GetPendingTask();

    this.dropSub = this.dragulaService.drop().subscribe(async (f) => {
      await this.UpdatePriority();
    })
    this.dropModel = this.dragulaService.dropModel().subscribe(async (f) => {
      try {
        this.spinnerService.show();
        let paraList = {
          Type: 'UpdatePriorityDate',
          TaskId: this.helper.getInt(this.tblTaskList[f.sourceIndex]['id'])
        }
        let response: ApiResponse = await this.Service.Data(paraList);
        if (response.isValidUser) {
          if (response.messageType == MessageType.success) {
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
    })
  }
  ngOnDestroy(): void {
    this.dropSub.unsubscribe();
    this.dropModel.unsubscribe();
  }

  //#region API MEthods
  private async FillCombo() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'FillCombo',
        UserId: this.UserInfo.userId,
        ProjectId: this.projectID,
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['ds']['table'].length > 0) {
            this.ddlUsers = response.dataList['ds']['table'];
            this.selectedUsers = this.ddlUsers[0]['value'];
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
  public async GetPendingTask() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GETPENDINGTASK',
        UserId: this.UserInfo.userId,
        ProjectId: this.projectID,
        Role: this.UserInfo.role,
        DevId: this.selectedUsers
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.tblTaskList = response.dataList['ds']['table'];
          this.tblTaskList.forEach(element => {
            element['devData'] = response.dataList['ds']['table1'].filter(f => f['taskId'] == element['id']);
            element['disableComplete'] = element['devData'].find(f => f['completeDate'] == null) == undefined ? false : true;
            // element['UtilHours'] = this.helper.getInt(response.dataList['tblDuration'].filter(f => f['taskID'] == element['id'])[0]['hours']);
            // element['UtilMinutes'] = this.helper.getInt(response.dataList['tblDuration'].filter(f => f['taskID'] == element['id'])[0]['minutes']);
            // element['TotalHours'] = element['totalHours'] + (this.helper.getInt(element['totalMinutes']) > 0 ? ":" + element['totalMinutes'] : "");
            // let totalPendingMinutes: number = ((this.helper.getInt(element['totalHours']) * 60) + this.helper.getInt(element['totalMinutes'])) - ((this.helper.getInt(element['UtilHours']) * 60) + this.helper.getInt(element['UtilMinutes']));
            // element['totalPendingMinutes'] = totalPendingMinutes;
            // element['PenHours'] = this.helper.getInt(Math.abs(totalPendingMinutes) / 60);
            // element['PenMinutes'] = Math.abs(totalPendingMinutes) % 60;
            element['TotalHours'] = this.helper.getDecimal(response.dataList['ds']['table2'].filter(f => f['taskId'] == element['id'])[0]['finalTotalHours']).toFixed(2);
            element['UtilizeHours'] = this.helper.getDecimal(response.dataList['ds']['table2'].filter(f => f['taskId'] == element['id'])[0]['utilizeHours']).toFixed(2);
            element['PendingHours'] = this.helper.getDecimal(response.dataList['ds']['table2'].filter(f => f['taskId'] == element['id'])[0]['finalPendingHours']).toFixed(2);
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
        let response: ApiResponse = await this.Service.Data(paraList);
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
      let response: ApiResponse = await this.Service.Data(paraList);
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
      let response: ApiResponse = await this.Service.Data(paraList);
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
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
          this.srNo = 0;
          await this.GetPendingTask();
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
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
          this.srNo = 0;
          await this.GetPendingTask();
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
  private async UpdatePriority() {
    try {
      this.spinnerService.show();
      let priority: object[] = this.tblTaskList.map((f, i) => {
        let obj: object = {}
        obj['seqNo'] = i + 1;
        obj['taskId'] = f['id']
        return obj
      });
      let paraList = {
        Type: 'UPDATEPRIORITY',
        priority: priority
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success('Priority Changed')
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
  public async Clear() {
    this.selectedFiles = [];
    this.hours = null;
    this.minutes = null;
    this.comment = null;
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
  public async closeDiag() {
    this.tblComments = [];
    this.refSrNo = 0;
    this.taskId = 0;
    this.selectedFiles = [];
    await this.GetPendingTask();
  }
  public async ConfirmDelete(srNo: number) {
    debugger;
    this.srNo = srNo;
    this.confirmText = {
      Header: 'Delete?', Body: 'Are you sure you want to delete this comment?', Method: 'DeleteComment'
    }
    $("#openModal")[0].click();
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
  //#endregion
}
