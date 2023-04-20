import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';
import { DatewiseTasksReportService } from 'src/app/Services/Reports/DatewiseTasksReport.service';
import { Helper, MessageType } from 'src/environments/Helper';

@Component({
  selector: 'app-datewisetasks',
  templateUrl: './datewisetasks.component.html',
  styleUrls: ['./datewisetasks.component.css']
})
export class DatewisetasksComponent implements OnInit {

  //#region Declaration
  public SDate: string;
  public EDate: string;

  public ddlProjects: object[] = [];
  public ddlUsers: object[] = [];

  public selectedProjects: object;
  public selectedUsers: object;

  public UserInfo: UserInfo;
  //#endregion

  constructor(private header: HeaderNameService,
    private errorService: ErrorDialogueService,
    private Service: DatewiseTasksReportService,
    private spinnerService: NgxSpinnerService,
    @Inject(LOCALE_ID) private locale: string,
    private toastr: ToastrService,
    private router: Router,
    private helper: Helper) { header.NewHeaderName("Datewise Tasks Report"); }

  async ngOnInit() {
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    this.SDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
    this.EDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
  }

  //#region API Methods
  public async Find() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'GetData',
        SDate: this.SDate,
        EDate: this.EDate,
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          console.log(response.dataList)
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
  //#endregion

}
