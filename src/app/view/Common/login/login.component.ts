import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TooltipDirective } from 'src/app/Directive/tooltip.directive';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { LoginService } from 'src/app/Services/Common/Login.service';
import { Helper } from 'src/environments/Helper';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //#region Declaration
  @ViewChild(TooltipDirective) ToolTip;
  public username: string;
  public password: string;
  //#endregion

  constructor(private service: LoginService,
    private spinnerService: NgxSpinnerService,
    private errorService: ErrorDialogueService,
    private toastr: ToastrService,
    private router: Router,
    private helper: Helper) { }

  async ngOnInit() {
    if (sessionStorage.getItem("UserInfo"))
      this.router.navigate(["Dashboard"]);
  }

  //#region API Methods
  public async Login() {
    try {
      this.spinnerService.show();
      if (await this.Validate()) {
        let data = await this.service.getToken(this.username, this.password);
        if (data) {
          let UserInfo: object = {};
          let Access_token: object = {};
          UserInfo = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'profileImg': data['profileImg'],
            'role': data['role'],
            'userId': data['userId'],
            'userName': data['userName']
          }
          Access_token = {
            'Access_token': data['Access_token'],
            'Client_id': data['Client_id'],
            'Expires': data['Expires'],
            'Expires_in': data['Expires_in'],
            'Issued': data['Issued'],
            'Token_type': data['Token_type']
          }
          sessionStorage.setItem("UserInfo", JSON.stringify(UserInfo))
          sessionStorage.setItem("Access_token", JSON.stringify(Access_token));
          this.router.navigate(["Dashboard"]);
        }
        // let paramList = {
        //   Type: 'Login',
        //   UserName: this.username,
        //   Password: this.password
        // }
        // let response: ApiResponse = await this.service.Data(paramList);
        // if (response.isValidUser) {
        //   if (response.messageType == MessageType.success) {
        //     if (Object.keys(response.dataList['tblData'][0]).includes("result")) {
        //       this.toastr.error(response.dataList['tblData'][0]['result']);
        //     }
        //     else {
        //       sessionStorage.setItem("UserInfo", JSON.stringify(response.dataList['tblData'][0]))
        //       this.router.navigate(["Dashboard"]);
        //     }
        //   }
        //   else if (response.messageType == MessageType.error)
        //     this.toastr.error(response.message);
        //   else
        //     this.toastr.warning('Something Went Wrong');
        // }
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
  private async Validate(): Promise<boolean> {
    if (this.helper.getStringOrEmpty(this.username) == "") {
      this.ToolTip.show(document.getElementById("username"), "Enter User Name");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.password) == "") {
      this.ToolTip.show(document.getElementById("password"), "Enter Password");
      return false;
    }
    return true;
  }
  //#endregion

}
