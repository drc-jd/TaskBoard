import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { TooltipDirective } from 'src/app/Directive/tooltip.directive';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';
import { TaskService } from 'src/app/Services/Task/Task.service';
import { Helper, MessageType } from 'src/environments/Helper';
import * as _ from 'underscore';
declare var $: any;

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  //#region Declaration
  @ViewChild(TooltipDirective) ToolTip;

  public taskId: number = 0;
  public aComment: string = "";
  public ddlType: string[] = ["Bug", "Change", "New"];
  public ddlReqDeveloper: object[] = [];

  public taskName: string;

  public ddlProject: object[] = [];
  public ddlDeveloper: object[] = [];
  public ddlPriority: object[] = [{ text: "High", value: 1 }, { text: "Medium", value: 2 }, { text: "Low", value: 3 }];
  public ddlReportType: string[] = ["Receive Pending", "In Progess", "Rating Pending", "Completed"]

  public selectedProject: object;
  public selectedDeveloper: object;
  public selectedPriority: object;
  public selectedReportType: string = "Receive Pending";

  public description: string;
  public UserInfo: UserInfo;
  public Rating: number = 0;

  public selectedFiles: object[] = [];
  public tblTaskList: object[] = [];
  public dropdownSettings: object = {
    singleSelection: false,
    badgeShowLimit: 1,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: "myclass custom-class"
  };
  //#endregion

  constructor(private header: HeaderNameService,
    private Service: TaskService,
    private spinnerService: NgxSpinnerService,
    private errorService: ErrorDialogueService,
    private toastr: ToastrService,
    private helper: Helper) { this.header.NewHeaderName("Task"); }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    await this.GetTaskList();
    await this.GetReqDevelopers();
  }

  //#region API Methods
  private async FillCombo(ProType: string): Promise<ApiResponse> {
    let res: ApiResponse = new ApiResponse();
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'FILLCOMBO',
        ProType: ProType,
        UserId: this.UserInfo.userId,
        ProjectId: this.helper.getInt(this.selectedProject)
      }
      res = await this.Service.Data(paraList);
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
    return res;
  }
  public async GetTaskList() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GETTASKLIST',
        Role: this.UserInfo.role,
        ReportType: this.selectedReportType,
        UserId: this.UserInfo.userId
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.tblTaskList = response.dataList['tblData'].map(f => {
            f['DevComments'] = [];
            f['removeDetail'] = false;
            if (this.UserInfo.role == 'Task Incharge' || this.UserInfo.role == 'Manager')
              f['removeDetail'] = true;
            f['Files'] = [];
            if (this.helper.getStringOrEmpty(f['fileList']) != "") {
              f['fileList'].split("|").forEach(element => {
                f['Files'].push(element);
              });
            }
            if (this.selectedReportType == "In Progess") {
              f['UtilHours'] = this.helper.getInt(response.dataList['tblDuration'].filter(d => d['taskID'] == f['id'])[0]['hours']);
              f['UtilMinutes'] = this.helper.getInt(response.dataList['tblDuration'].filter(d => d['taskID'] == f['id'])[0]['minutes']);
              f['TotalHours'] = f['totalHours'] + (this.helper.getInt(f['totalMinutes']) > 0 ? ":" + f['totalMinutes'] : "");
              f['UtilizeHours'] = f['UtilHours'] + (this.helper.getInt(f['UtilMinutes']) > 0 ? ":" + f['UtilMinutes'] : "");
              let totalPendingMinutes: number = ((this.helper.getInt(f['totalHours']) * 60) + this.helper.getInt(f['totalMinutes'])) - ((this.helper.getInt(f['UtilHours']) * 60) + this.helper.getInt(f['UtilMinutes']));
              f['totalPendingMinutes'] = totalPendingMinutes;
              f['PenHours'] = this.helper.getInt(Math.abs(totalPendingMinutes) / 60);
              f['PenMinutes'] = Math.abs(totalPendingMinutes) % 60;
              f['PendingHours'] = (totalPendingMinutes >= 0 ? "" : "-") + this.helper.getInt(f['PenHours']) + (this.helper.getInt(f['PenMinutes']) > 0 ? ":" + f['PenMinutes'] : "");
            }
            return f;
          });
          if (response.dataList['tblDevComments'].length > 0) {
            this.tblTaskList.forEach(element => {
              element['devData'] = response.dataList['tblDevComments'].filter(f => f['taskID'] == element['id']);
              if (element['devData'].length > 0)
                element['removeDetail'] = false;
            });
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
  private async GetReqDevelopers() {
    try {
      this.spinnerService.show();
      let response: ApiResponse = await this.FillCombo("GetReqDevelopers");
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['tblData'].length > 0)
            Object.assign(this.ddlReqDeveloper, response.dataList['tblData'])
        }
        else if (response.messageType == MessageType.error)
          this.errorService.warning(response.message);
        else
          this.errorService.warning('Something Went Wrong');
      }
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  public async Receive(task: object) {
    try {
      this.spinnerService.show();
      if (await this.ValidateReceive(task)) {
        try {
          this.spinnerService.show();
          let paraList = {
            Type: 'RECEIVETASKBYDEV',
            TaskId: task['id'],
            TaskStartDate: task['taskStartDate'],
            TotalHours: task['taskHours'],
            TotalMinutes: task['taskMinutes'],
            TaskType: task['selectedType'],
            DevComment: task['DevComments'].map(f => {
              f['approxHours'] = this.helper.getInt(f['approxHours']);
              f['approxMinutes'] = this.helper.getInt(f['approxMinutes']);
              f['developerId'] = f['developer']
              return f;
            })
          }
          let response: ApiResponse = await this.Service.Data(paraList);
          if (response.isValidUser) {
            if (response.messageType == MessageType.success) {
              this.toastr.success(response.message);
              await this.GetTaskList();
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
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  public async Approve() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'APPROVEBYAUTH',
        TaskId: this.helper.getInt(this.taskId),
        AComment: this.helper.getString(this.aComment)
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
          await this.GetTaskList();
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
    this.taskId = 0;
  }
  public async DownloadFile(fileName: string) {
    try {
      this.spinnerService.show();
      await this.Service.Download(fileName)
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  public async onRatingChanged(event) {
    this.Rating = event['rating'];
  }
  public async SubmitRating(taskId: number) {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'SUBMITRATING',
        TaskId: this.helper.getInt(taskId),
        Rating: this.helper.getInt(this.Rating)
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.toastr.success(response.message);
          await this.GetTaskList();
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

  //#region Popup Methods
  public async OpenTaskPopup() {
    try {
      this.spinnerService.show();
      let response: ApiResponse = await this.FillCombo("GetProjects");
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['tblData'].length > 0) {
            Object.assign(this.ddlProject, response.dataList['tblData'].map(f => {
              let obj: object = {};
              obj['text'] = f['projectName'];
              obj['value'] = f['projectId'];
              return obj;
            }))
          }
        }
        else if (response.messageType == MessageType.error)
          this.errorService.warning(response.message);
        else
          this.errorService.warning('Something Went Wrong');
      }
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  public async ProjectChanged() {
    try {
      this.spinnerService.show();
      this.ddlDeveloper = [];
      this.selectedDeveloper = null;
      let response: ApiResponse = await this.FillCombo("GetDevelopers");
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['tblData'].length > 0) {
            Object.assign(this.ddlDeveloper, response.dataList['tblData'])
          }
        }
        else if (response.messageType == MessageType.error)
          this.errorService.warning(response.message);
        else
          this.errorService.warning('Something Went Wrong');
      }
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  public async Clear() {
    this.selectedFiles = [];
    this.taskName = null;
    this.ddlProject = [];
    this.selectedProject = null;
    this.ddlDeveloper = [];
    this.selectedDeveloper = null;
    this.selectedPriority = null;
    this.description = null;
    await this.GetTaskList();
  }
  public async AddByIncharge() {
    try {
      this.spinnerService.show();
      if (await this.Validate()) {
        let paraList = {
          Type: 'AddByIncharge',
          spType: "AddByIncharge",
          taskIncharge: this.UserInfo.userId,
          taskName: this.taskName,
          projectId: this.selectedProject,
          taskDescription: this.description,
          developerId: this.selectedDeveloper,
          ipriorityId: this.selectedPriority,
        }
        let response: ApiResponse = await this.Service.Data(paraList);
        if (response.isValidUser) {
          if (response.messageType == MessageType.success) {
            this.toastr.success(response.message);
            if (this.selectedFiles.length > 0) {
              let taskId: string = response.dataList['taskId'];
              await this.UploadFiles(taskId);
            }
            await this.Clear();
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
  private async Validate(): Promise<boolean> {
    if (this.helper.getStringOrEmpty(this.taskName) == "") {
      this.ToolTip.show(document.getElementById("taskName"), "Enter Project Name");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.selectedProject) == "") {
      this.ToolTip.show(document.getElementById("Project"), "Select Project");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.selectedDeveloper) == "") {
      this.ToolTip.show(document.getElementById("Developer"), "Select Developer");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.selectedPriority) == "") {
      this.ToolTip.show(document.getElementById("Priority"), "Set Priority");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.description) == "") {
      this.ToolTip.show(document.getElementById("description"), "Enter Task Description");
      return false;
    }
    return true;
  }
  //#endregion

  //#region Other Methods
  public async ConfirmApprove(task: number) {
    this.taskId = task;
    $("#openModal")[0].click();
  }
  public async addNewComment(task: object) {
    task['DevComments'].push({ taskId: task['id'], seqNo: task['DevComments'].length + 1, developer: null, approxHours: null, approxMinutes: null, comment: null });
  }
  public async deleteDev(task: object, i: number) {
    task["DevComments"].splice([i - 1], 1);
    task["DevComments"].forEach((element, i) => {
      element['seqNo'] = i + 1
    });
    this.calculateHours(task);
  }
  public calculateHours(task: object) {
    let totalMin: number = 0;
    let totalHour: number = 0;
    task["DevComments"].forEach(element => {
      totalMin += this.helper.getInt(element['approxMinutes']);
      totalHour += this.helper.getInt(element['approxHours']);
    });
    let flag: boolean = true;
    while (flag) {
      if (totalMin >= 60) {
        totalHour++;
        totalMin = totalMin - 60;
      }
      else
        flag = false;
    }
    task['taskHours'] = totalHour;
    task['taskMinutes'] = totalMin;
  }
  private async ValidateReceive(task: object): Promise<boolean> {
    let valid: boolean = true;
    if (this.helper.getStringOrEmpty(task['taskStartDate']) == "") {
      this.ToolTip.show(document.getElementById("taskStartDate" + task['id']), "Enter Start Date");
      valid = false;
    }
    else if (this.helper.getInt(task['taskHours']) == 0 && this.helper.getInt(task['taskMinutes']) == 0) {
      this.ToolTip.show(document.getElementById("taskHours" + task['id']), "Enter Approx Time");
      valid = false;
    }
    else if (this.helper.getStringOrEmpty(task['selectedType']) == "") {
      this.ToolTip.show(document.getElementById("ddlType" + task['id']), "Select Type");
      valid = false;
    }
    else if (this.helper.getStringOrEmpty(task['selectedType']) == "") {
      this.ToolTip.show(document.getElementById("ddlType" + task['id']), "Select Type");
      valid = false;
    }
    else if (task['DevComments'].length == 0) {
      this.ToolTip.show(document.getElementById("addDev" + task['id']), "Add Developers");
      valid = false;
    }
    if (!valid)
      return false;
    for (let i: number = 0; i < task['DevComments'].length; i++) {
      if (this.helper.getStringOrEmpty(task['DevComments'][i]['developer']) == "") {
        this.ToolTip.show(document.getElementById("Developer" + task['DevComments'][i]['taskId'] + "-" + task['DevComments'][i]['seqNo']), "Select Developer");
        valid = false;
      }
      else if (this.helper.getInt(task['DevComments'][i]['approxHours']) == 0 && this.helper.getInt(task['DevComments'][i]['approxMinutes']) == 0) {
        this.ToolTip.show(document.getElementById("approxHours" + task['DevComments'][i]['taskId'] + "-" + task['DevComments'][i]['seqNo']), "Enter Hours");
        valid = false;
      }
      else if (this.helper.getStringOrEmpty(task['DevComments'][i]['comment']) == "") {
        this.ToolTip.show(document.getElementById("comment" + task['DevComments'][i]['taskId'] + "-" + task['DevComments'][i]['seqNo']), "Enter comment");
        valid = false;
      }
      if (!valid)
        break;
    }
    return valid;
  }
  public async upload(event: any) {
    this.selectedFiles = [];
    for (let i = 0; i < event.target.files.length; i++) {
      this.selectedFiles.push(event.target.files[i]);
    }
  }
  private async UploadFiles(taskId) {
    try {
      this.spinnerService.show();
      let response: ApiResponse = await this.Service.uploadFile(this.selectedFiles, taskId, "Task Incharge");
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