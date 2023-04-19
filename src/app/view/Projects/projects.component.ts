import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';
import { ProjectsService } from 'src/app/Services/Projects/Projects.service';
import { Helper, MessageType } from 'src/environments/Helper';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  //#region Declaration
  public tblProjects: object[] = [];
  public UserInfo: UserInfo;
  //#endregion

  constructor(private header: HeaderNameService,
    private errorService: ErrorDialogueService,
    private spinnerService: NgxSpinnerService,
    private Service: ProjectsService,
    private toastr: ToastrService,
    private router: Router) { this.header.NewHeaderName("Projects"); }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    await this.GetProjectLists();
  }

  //#region API Methods
  private async GetProjectLists() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GETPROJECTBYUSER',
        UserId: this.UserInfo.userId,
        Role: this.UserInfo.role
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          this.tblProjects = response.dataList['ds']['table'];
          this.tblProjects.forEach(element => {
            element['projectMembers'] = response.dataList['ds']['table1'].filter(f => f['projectId'] == element['id']);
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
  //#endregion

  //#region Otner Methods
  public async openProject(project: object) {
    this.router.navigate(["PendingTask", project['id'], project['projectName']]);
    // this.router.navigate(["PendingTask",project['id']], { queryParams: { pid: project['id'] } });
  }
  //#endregion
}
