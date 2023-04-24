import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Helper, MessageType } from 'src/environments/Helper';
import { ApiResponse } from '../Class/Common/ApiResponse';
import { UserInfo } from '../Class/Common/UserInfo';
import { TooltipDirective } from '../Directive/tooltip.directive';
import { ErrorDialogueService } from '../Services/Common/ErrorDiag.service';
import { HeaderNameService } from '../Services/Common/HeaderName';
import { LoginService } from '../Services/Common/Login.service';
declare var $: any;

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  //#region Declaration
  @ViewChild(TooltipDirective) ToolTip;

  public headerName: string = "";
  public UserInfo: UserInfo;
  public currentPass: string;
  public newPass: string;
  public confirmPass: string;
  public disableChangeButton: boolean = true;
  public tblForm: object[] = [];
  public tblReports: object[] = [];
  //#endregion

  constructor(private header: HeaderNameService,
    private spinnerService: NgxSpinnerService,
    private errorService: ErrorDialogueService,
    private toastr: ToastrService,
    private Service: LoginService,
    private router: Router,
    private helper: Helper) {
    this.header.HeaderName.subscribe(f => {
      this.headerName = f
    });
  }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    await this.GetUserpermission();
  }

  //#region API Methods
  public async ChangePassword() {
    try {
      this.spinnerService.show();
      if (await this.Validate()) {
        let paraList = {
          Type: 'ChangePassword',
          UserId: this.UserInfo.userId,
          CurrentPassword: this.helper.getString(this.currentPass),
          NewPassword: this.helper.getString(this.newPass)
        }
        let response: ApiResponse = await this.Service.Data(paraList);
        if (response.isValidUser) {
          if (response.messageType == MessageType.success) {
            this.toastr.success(response.message);
            $("#closePass")[0].click();
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
  private async GetUserpermission() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GetUserpermission',
        UserId: this.UserInfo.userId
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.tblForm = response.dataList['ds']['table'];
          this.tblReports = response.dataList['ds']['table1'];
          console.log(this.tblForm);
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
  public async LogOut() {
    sessionStorage.removeItem("UserInfo");
    this.router.navigate(["Login"]);
  }
  private async Validate(): Promise<boolean> {
    if (this.helper.getStringOrEmpty(this.currentPass) == "") {
      this.ToolTip.show(document.getElementById("taskName"), "Enter Project Name");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.newPass) == "") {
      this.ToolTip.show(document.getElementById("Project"), "Select Project");
      return false;
    }
    return true;
  }
  public async passTextChange() {
    this.disableChangeButton = (this.helper.getString(this.newPass) == this.helper.getString(this.confirmPass)) ? false : true;
  }
  public ClearPass() {
    this.currentPass = null;
    this.newPass = null;
    this.confirmPass = null;
  }
  //#endregion

}
