import { formatDate, TitleCasePipe } from '@angular/common';
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
import printDoc from '../../../Services/Common/printDoc'

@Component({
  selector: 'app-datewisetasks',
  templateUrl: './datewisetasks.component.html',
  styleUrls: ['./datewisetasks.component.css']
})
export class DatewisetasksComponent implements OnInit {

  //#region Declaration
  public SDate: string;
  public EDate: string;
  public details: boolean = false;
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
    private titleCase: TitleCasePipe,
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
        Pending: this.pending,
        Details: this.details
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
          headerName: this.titleCase.transform(columns[i]),
          field: columns[i]
        }
      }
      if (_.indexOf(["PROGRESS"], columns[i].toUpperCase()) > -1)
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
      if (_.indexOf(["DEVELOPER'S TASK"], columns[i].toUpperCase()) > -1) {
        colObj['type'] = 'text';
        // colObj['maxWidth'] = 200;
        colObj['autoHeight'] = true;
        colObj['valueGetter'] = (params) => {
          if (params.data != undefined && params.data != null) {
            return params.data["developer's Task"].replaceAll("#", "\r\n   ➡️   ");
          }
        }
        colObj['cellStyle'] = { 'white-space': 'pre', 'text-align': 'left' }
      }
      // colObj['cellClass'] = (params: any) => {
      //   if (params.data != undefined && params.data != null && params.value != null && params.value != undefined) {
      //     if (params.value == "HIGH")
      //       return 'priorityhigh';
      //     else if (params.value == "MEDIUM")
      //       return 'prioritymedium';
      //     else if (params.value == "LOW")
      //       return 'prioritylow';
      //   }
      // }
      if (_.indexOf(["ESTIMATE TIME", "DURATION"], columns[i].toUpperCase()) > -1) {
        colObj['pdfExportOptions'] = {
          styles: {
            alignment: "right",
          }
        }
      }
      if (_.indexOf(["PROGRESS"], columns[i].toUpperCase()) > -1) {
        colObj['pdfExportOptions'] = {
          styles: {
            alignment: "center",
          }
        }
      }
      if (_.indexOf(["COMMENT"], columns[i].toUpperCase()) > -1)
        colObj['type'] = ['text'];
      if (_.indexOf(["REFSRNO", "ISCOMPLETE"], columns[i].toUpperCase()) > -1)
        colObj['hide'] = true;
      if (_.indexOf(["ISCOMPLETE"], columns[i].toUpperCase()) > -1)
        colObj['type'] = ['chkBoxWithImage'];
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
  PDF_HEADER_COLOR = "#f8f8f8";
  PDF_INNER_BORDER_COLOR = "#dde2eb";
  PDF_OUTER_BORDER_COLOR = "#babfc7";
  PDF_LOGO =
    "https://raw.githubusercontent.com/AhmedAGadir/ag-grid-todo-list-react-typescript/master/src/assets/new-ag-grid-logo.png";
  PDF_PAGE_ORITENTATION = "landscape";
  PDF_WITH_FOOTER_PAGE_COUNT = true;
  PDF_HEADER_HEIGHT = 25;
  PDF_ROW_HEIGHT = 15;
  PDF_ODD_BKG_COLOR = "#fcfcfc";
  PDF_EVEN_BKG_COLOR = "#ffffff";
  PDF_WITH_CELL_FORMATTING = true;
  PDF_WITH_COLUMNS_AS_LINKS = true;
  PDF_SELECTED_ROWS_ONLY = false;
  public pdfExp() {
    if (this.tblGridData.length > 0) {
      const printParams = {
        PDF_HEADER_COLOR: this.PDF_HEADER_COLOR,
        PDF_INNER_BORDER_COLOR: this.PDF_INNER_BORDER_COLOR,
        PDF_OUTER_BORDER_COLOR: this.PDF_OUTER_BORDER_COLOR,
        PDF_LOGO: this.PDF_LOGO,
        PDF_PAGE_ORITENTATION: this.PDF_PAGE_ORITENTATION,
        PDF_WITH_HEADER_IMAGE: false,
        PDF_WITH_FOOTER_PAGE_COUNT: this.PDF_WITH_FOOTER_PAGE_COUNT,
        PDF_HEADER_HEIGHT: this.PDF_HEADER_HEIGHT,
        PDF_ROW_HEIGHT: this.PDF_ROW_HEIGHT,
        PDF_ODD_BKG_COLOR: this.PDF_ODD_BKG_COLOR,
        PDF_EVEN_BKG_COLOR: this.PDF_EVEN_BKG_COLOR,
        PDF_WITH_CELL_FORMATTING: this.PDF_WITH_CELL_FORMATTING,
        PDF_WITH_COLUMNS_AS_LINKS: this.PDF_WITH_COLUMNS_AS_LINKS,
        PDF_SELECTED_ROWS_ONLY: this.PDF_SELECTED_ROWS_ONLY
      };
      let width: string[] = this.pending ? ['8%', '*', '12%', '15%', '*', '*', '*', '*', '*', '*', '*', '*'] : ['*', '*', '35%', '*', '*', '*', '*', '*', '*', '*', '*'];
      printDoc(printParams, this.gridOptions.api, this.gridOptions.columnApi, width);
    }
    else
      this.toastr.warning('No Data to export');
  }
  public async onPendingChange() {
    this.tblGridData = [];
    await this.setRowData(this.tblGridData);
  }
  //#endregion

}
