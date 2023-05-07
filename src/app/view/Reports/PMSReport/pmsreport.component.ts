import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { TooltipDirective } from 'src/app/Directive/tooltip.directive';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';
import { LoginService } from 'src/app/Services/Common/Login.service';
import { ProjectsService } from 'src/app/Services/Projects/Projects.service';
import { PMSReportService } from 'src/app/Services/Reports/PMSReport.service';
import { Helper, MessageType } from 'src/environments/Helper';
import * as _ from 'underscore';
declare var $: any;

@Component({
  selector: 'app-pmsreport',
  templateUrl: './pmsreport.component.html',
  styleUrls: ['./pmsreport.component.css']
})
export class PmsreportComponent implements OnInit {

  //#region Declaration
  @ViewChild(TooltipDirective) ToolTip;
  public ddlType: string[] = ["UserWise", "ProjectWise"];
  public ddlProjectId: object[] = [];
  public ddlUserId: object[] = [];

  public selectedType: string = "UserWise";
  public selectedProjectId: object;
  public selectedUserId: object;
  public timeLineText: string = "";

  public SDate: string;
  public EDate: string;

  public UserInfo: UserInfo;
  public tblData: object[] = [];
  public tblDetail: object[] = [];
  windowScrolled = false;
  //#endregion

  constructor(private header: HeaderNameService,
    private errorService: ErrorDialogueService,
    private spinnerService: NgxSpinnerService,
    @Inject(LOCALE_ID) private locale: string,
    private projectService: ProjectsService,
    private loginService: LoginService,
    private Service: PMSReportService,
    private toastr: ToastrService,
    private router: Router,
    private helper: Helper) { this.header.NewHeaderName("PMS Report"); }

  async ngOnInit() {
    window.addEventListener('scroll', () => {
      this.windowScrolled = window.pageYOffset !== 0;
    });
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    await this.FillCombo();
    this.SDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
    this.EDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
  }

  //#region API Methods
  private async FillCombo() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'FillCombo',
        Role: this.UserInfo.role,
        UserId: this.UserInfo.userId
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['ds']['table'].length > 0) {
            this.ddlUserId = response.dataList['ds']['table'];
          }
          if (response.dataList['ds']['table1'].length > 0) {
            this.ddlProjectId = response.dataList['ds']['table1'];
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
  public async Find() {
    try {
      this.spinnerService.show();
      if (await this.ValidateSearch()) {
        let paraList = {
          Type: 'GetData',
          ProType: this.helper.getString(this.selectedType),
          UserId: this.helper.getStringOrEmpty(this.selectedType).toUpperCase() == "PROJECTWISE" ? (this.UserInfo.role == "Developer" ? this.UserInfo.userId : 0) : this.helper.getInt(this.selectedUserId),
          ProjectId: this.helper.getInt(this.selectedProjectId),
          SDate: this.SDate,
          EDate: this.EDate,
        }
        let response: ApiResponse = await this.Service.Data(paraList);
        if (response.isValidUser) {
          if (response.messageType == MessageType.success) {
            this.tblData = response.dataList['tblData'];
            this.tblDetail = [];
            this.tblData.forEach(element => {
              element['SDate'] = this.getDateOfWeek(element['weekNo'], this.helper.getInt(element['week'].slice(element['week'].length - 4)));
              element['sunDate'] = formatDate(element['SDate'], 'MMM dd,yyyy', this.locale)
              element['monDate'] = formatDate(new Date(new Date(element['SDate']).setDate(new Date(element['SDate']).getDate() + 1)), 'MMM dd,yyyy', this.locale)
              element['tueDate'] = formatDate(new Date(new Date(element['SDate']).setDate(new Date(element['SDate']).getDate() + 2)), 'MMM dd,yyyy', this.locale)
              element['wedDate'] = formatDate(new Date(new Date(element['SDate']).setDate(new Date(element['SDate']).getDate() + 3)), 'MMM dd,yyyy', this.locale)
              element['thuDate'] = formatDate(new Date(new Date(element['SDate']).setDate(new Date(element['SDate']).getDate() + 4)), 'MMM dd,yyyy', this.locale)
              element['friDate'] = formatDate(new Date(new Date(element['SDate']).setDate(new Date(element['SDate']).getDate() + 5)), 'MMM dd,yyyy', this.locale)
              element['satDate'] = formatDate(new Date(new Date(element['SDate']).setDate(new Date(element['SDate']).getDate() + 6)), 'MMM dd,yyyy', this.locale)
            });
            if (response.dataList['tblDates'].length > 0) {
              let details: object[] = response.dataList['tblDetails'];
              let projects: object[] = response.dataList['tblProjects'];
              response.dataList['tblDates'].forEach((element, index) => {
                this.tblDetail.push({
                  date: new Date(element['date']),
                  formatDate: formatDate(new Date(element['date']), 'MMM dd,yyyy', this.locale),
                  hours: element['hours'],
                  projects: projects.filter(f => f['date'] == element['date'])
                });
                this.tblDetail[index]["projects"].forEach((proj, i) => {
                  this.tblDetail[index]["projects"][i]['details'] = details.filter(f => f['date'] == element['date'] && f['projectID'] == proj['projectID'])
                });
              });
            }
            if (this.selectedType == "UserWise")
              this.timeLineText = this.selectedType + " - " + this.ddlUserId.find(f => f['value'] == this.selectedUserId)['text']
            else if (this.selectedType == "ProjectWise")
              this.timeLineText = this.selectedType + " - " + this.ddlProjectId.find(f => f['value'] == this.selectedProjectId)['text'];
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
  //#endregion

  //#region Other Methods
  private async ValidateSearch(): Promise<boolean> {
    if (this.helper.getStringOrEmpty(this.selectedType) == "ProjectWise") {
      if (this.helper.getStringOrEmpty(this.selectedProjectId) == "") {
        this.ToolTip.show(document.getElementById("ProjectId"), "Select Project");
        return false;
      }
    }
    if (this.helper.getStringOrEmpty(this.selectedType) == "UserWise") {
      if (this.helper.getStringOrEmpty(this.selectedUserId) == "") {
        this.ToolTip.show(document.getElementById("UserId"), "Select User");
        return false;
      }
    }
    return true;
  }
  private getDateOfWeek(w: number, y: number) {
    var d: number = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

    return new Date(y, 0, d);
  }
  public scroll(id: string) {
    let element = document.getElementById(id);
    element.scrollIntoView({ behavior: 'smooth', block: "center" });
    element.classList.add("highlight");
    setTimeout(() => {
      element.classList.remove("highlight");
    }, 3000);
  }
  public openProjects(projectID: number, projectName: string) {

    if (this.selectedType == "UserWise") {
      const url = this.router.serializeUrl(
        this.router.createUrlTree([`/PendingTask/${projectID}/${projectName}`])
      );
      window.open(url, '_blank');
    }
  }
  public scrollToTop(element): void {
    element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
  }
  //#endregion

  //#region Pop-up Methods
  public comment: string;
  public hours: number;
  public minutes: number;
  public refSrNo: number = 0;
  public srNo: number = 0;
  public tblComments: object[] = [];
  public disableControlls: boolean = true;
  public profileName: string;
  public profileImg: string;

  public async OpenCommentPop(data: any) {
    this.refSrNo = data['refSrNo'];
    this.disableControlls = data['devCompleteDate'] == null ? false : true;
    $("#openModal")[0].click();
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GetImageById',
        UserId: this.selectedType == "UserWise" ? this.selectedUserId : data['projectID']
      }
      let response: ApiResponse = await this.loginService.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['tblData'].length > 0) {
            this.profileName = response.dataList['tblData'][0]['name'];
            this.profileImg = response.dataList['tblData'][0]['profileImg'];
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
    await this.GetComments();
  }
  public async GetComments() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GETCOMMENTS',
        RefSrNo: this.refSrNo
      }
      let response: ApiResponse = await this.projectService.Data(paraList);
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
        let response: ApiResponse = await this.projectService.Data(paraList);
        if (response.isValidUser) {
          if (response.messageType == MessageType.success) {
            this.toastr.success(response.message);
            this.hours = null;
            this.minutes = null;
            this.comment = null;
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
  }
  //#endregion

}
