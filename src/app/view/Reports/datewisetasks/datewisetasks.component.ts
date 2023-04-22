import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { UserInfo } from 'src/app/Class/Common/UserInfo';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { HeaderNameService } from 'src/app/Services/Common/HeaderName';
import { DatewiseTasksReportService } from 'src/app/Services/Reports/DatewiseTasksReport.service';
import { Helper, MessageType } from 'src/environments/Helper';
import * as _ from 'underscore';

@Component({
  selector: 'app-datewisetasks',
  templateUrl: './datewisetasks.component.html',
  styleUrls: ['./datewisetasks.component.css']
})
export class DatewisetasksComponent implements OnInit {

  //#region Declaration
  public SDate: string;
  public EDate: string;
  public pending: boolean = false;

  // public totalHours: string = "0";
  // public totalTasks: string = "0";
  // public inProgress: string = "0";
  // public completedTasks: string = "0";
  // public pendingTasks: string = "0";
  // public individualProgess: string = "0";
  // public individualCompletedTasks: string = "0";

  public tblGridData: object[] = [];
  public gridOptions: GridOptions = {};
  private gridApi: any;
  private gridcolumnDefs: any;

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
  }

  //#region API Methods
  public async Find() {
    this.tblGridData = [];
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
          this.tblGridData = response.dataList['ds']['table'];
          // console.log(response.dataList);
          // this.totalHours = response.dataList['ds']['table'][0]['totalHours'];
          // this.totalTasks = response.dataList['ds']['table'][0]['totalTasks'];
          // this.inProgress = response.dataList['ds']['table'][0]['inProgress'];
          // this.completedTasks = response.dataList['ds']['table'][0]['completedTasks'];
          // this.pendingTasks = response.dataList['ds']['table'][0]['pendingTasks'];
          // this.individualProgess = response.dataList['ds']['table'][0]['individualProgess'];
          // this.individualCompletedTasks = response.dataList['ds']['table'][0]['individualCompletedTasks'];
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
    this.setRowData(this.tblGridData);
  }
  //#endregion

  //#region AG-Grid Methods
  async setGrid(event: any) {
    this.gridApi = await event;
    this.UserInfo = JSON.parse(sessionStorage.getItem("UserInfo"));
    this.SDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
    this.EDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
    await this.Find();
  }
  private async setRowData(data: object[]) {
    if (!data || data.length == 0) {
      this.gridApi.setRowData([]);
      this.gridApi.setColumnDefs([]);
      this.gridApi.setPinnedTopRowData([]);
      return;
    }
    var columns = Object.keys(data[0]);
    var colObj = {};
    this.gridcolumnDefs = [];
    for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
        default: colObj = {
          field: columns[i]
        }
      }
      if (_.indexOf(["RATIO"], columns[i].toUpperCase()) > -1)
        colObj['cellRenderer'] = params => {
          if (params.value != null && params.value != undefined) {
            return '<div class="parent"> <div class="progress1" style="border-radius: 0px;box-shadow: none;background-color: transparent;"><div class="progress-bar active" role = "progressbar" aria - valuenow="40" aria - valuemin="0" aria - valuemax="100" style = "color:white;width:' + (this.helper.getInt(params.value) > 100 ? 100 : this.helper.getInt(params.value)) + '%;font-weight:600;background-color:' + (this.helper.getInt(params.value) > 100 ? (params.data['isComplete'] == false ? 'Red' : 'Orange') : 'Green') + ';" >' + this.helper.getInt(params.value) + '%</div></div></div>';
          }
        }
      if (_.indexOf(["TASKTYPE"], columns[i].toUpperCase()) > -1)
        colObj['cellClass'] = (params: any) => {
          if (params.data != undefined && params.data != null && params.value != null && params.value != undefined) {
            if (params.value == "Change")
              return 'typechange';
            else if (params.value == "New")
              return 'typenew';
            else if (params.value == "Bug")
              return 'typebug';
          }
        }
      if (_.indexOf(["PRIORITY"], columns[i].toUpperCase()) > -1)
        colObj['cellClass'] = (params: any) => {
          if (params.data != undefined && params.data != null && params.value != null && params.value != undefined) {
            if (params.value == "HIGH")
              return 'priorityhigh';
            else if (params.value == "MEDIUM")
              return 'prioritymedium';
            else if (params.value == "LOW")
              return 'prioritylow';
          }
        }
      if (_.indexOf(["COMMENT"], columns[i].toUpperCase()) > -1)
        colObj['type'] = ['text']
      if (_.indexOf(["ISCOMPLETE"], columns[i].toUpperCase()) > -1)
        colObj['type'] = ['chkBoxWithImage']
      if (colObj != undefined)
        this.gridcolumnDefs.push(colObj);
    }
    this.gridApi.setColumnDefs(this.gridcolumnDefs);
    this.gridApi.setRowData(data);
    await this.gridApi.sizeColumnsToFit();
    await this.gridApi.columnController.autoSizeAllColumns(false);
  }
  //#endregion

  //#region Other Methods
  //#endregion

}
