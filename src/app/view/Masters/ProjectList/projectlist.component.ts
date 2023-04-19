import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { TooltipDirective } from 'src/app/Directive/tooltip.directive';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { MastersService } from 'src/app/Services/Masters/Master.service';
import { Helper, MessageType } from 'src/environments/Helper';
import * as _ from 'underscore';
declare var $: any;

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent implements OnInit {

  //#region Declaration
  @ViewChild(TooltipDirective) ToolTip;
  public srNo: number = 0;
  public mode: string = "Add";
  public projectName: string;
  public headPerson: string;

  public ddlImpact: object[] = [{ "id": 0, "itemName": "Surat" }, { "id": 1, "itemName": "Mumbai" }, { "id": 2, "itemName": "Abroad" }];

  public selectedImpact: object[] = [];
  public description: string;

  public dropdownSettings = {
    singleSelection: false,
    badgeShowLimit: 2,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: "myclass custom-class"
  };

  public tblGridData: object[] = [];
  public gridOptionsProj: GridOptions = {};
  private gridApi: any;
  private gridcolumnDefs: any;
  //#endregion

  constructor(private Service: MastersService,
    private spinnerService: NgxSpinnerService,
    private errorService: ErrorDialogueService,
    private toastr: ToastrService,
    private helper: Helper) {
  }

  async ngOnInit() {
  }

  //#region API Methods
  private async Crud(mode: string): Promise<ApiResponse> {
    let res: ApiResponse = new ApiResponse();
    try {
      let paraList = {
        Type: 'PROJECTLISTCRUD',
        Mode: mode,
        SrNo: this.helper.getInt(this.srNo),
        ProjectName: this.helper.getString(this.projectName),
        HeadPerson: this.helper.getString(this.headPerson),
        Impact: this.selectedImpact.map(f => f['itemName']).join(","),
        Description: this.helper.getString(this.description)
      }
      res = await this.Service.Data(paraList);
    }
    catch (error) {
      // this.errorService.show(error);
    }
    return res;
  }
  //#endregion

  //#region AG-Grid Methods
  async setGridproj(event: any) {
    this.gridApi = await event;
    this.gridOptionsProj.suppressRowClickSelection = true;
    await this.GetGrid();
    this.gridOptionsProj.onCellClicked = (params) => {
      if (params.column.getColId().toUpperCase() == "DELETE") {
        this.srNo = params.data['srNo'];
        $("#openModal")[0].click();
      }
    }
    this.gridOptionsProj.onCellDoubleClicked = (params) => {
      if (params.column.getColId().toUpperCase() != "DELETE") {
        this.Clear();
        this.srNo = params.data['srNo'];
        this.projectName = this.helper.getString(params.data['projectName']);
        this.headPerson = this.helper.getString(params.data['headPerson']);
        this.description = this.helper.getString(params.data['description']);
        let impact: object[] = [];
        params.data['impact'].split(",").forEach(element => {
          if (this.ddlImpact.find(f => f['itemName'] == element))
            impact.push(this.ddlImpact.find(f => f['itemName'] == element));
        });
        this.selectedImpact = impact;
        this.mode = "Update";
      }
    }
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
          field: columns[i],
          type: 'text',
          cellClass: (params: any) => {
          }
        }
      }
      if (_.indexOf(["DELETE"], columns[i].toUpperCase()) > -1) {
        colObj['cellRenderer'] = params => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned) {
            return `<i style="color: #5773ff;" class="ri-delete-bin-line mr-0"></i>`;
          }
        }
        colObj['type'] = [''];
      }
      // if (_.indexOf(["REMOVE", "MANAGER", "MANAGERNAME", "CODE", "EXTNO", "ITEMNAME"], columns[i].toUpperCase()) > -1)
      //   colObj['pinned'] = 'left';
      // if (_.indexOf(["REQUESTDATE", "APPROVEDDATE", "STOREAPPROVEDDATE"], columns[i].toUpperCase()) > -1)
      //   colObj['type'] = ['dateOnly', 'text'];
      // if (_.indexOf(["PDATE"], columns[i].toUpperCase()) > -1)
      //   colObj['type'] = ['date', 'text'];
      // if (_.indexOf(["ORDERPLACEDATE", "ORDERRECEIVEDATE"], columns[i].toUpperCase()) > -1)
      //   colObj['type'] = ['dateType', 'text'];
      if (_.indexOf(["SRNO", "CRDATE"], columns[i].toUpperCase()) > -1)
        colObj['hide'] = true;
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
  private async GetGrid() {
    this.tblGridData = [];
    try {
      this.spinnerService.show();
      let response: ApiResponse = await this.Crud("GET");
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['tblData'].length > 0) {
            this.tblGridData = response.dataList['tblData'];
            this.tblGridData.map(f => { f['Delete'] = ""; return f })
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
    this.setRowData(this.tblGridData);
  }
  public async Insert() {
    try {
      this.spinnerService.show();
      if (await this.Validate()) {
        let response: ApiResponse = await this.Crud(this.mode);
        if (response.isValidUser) {
          if (response.messageType == MessageType.success) {
            if (response.dataList['tblData'].length > 0) {
              if (this.helper.getString(response.dataList['tblData'][0]['result']).toUpperCase() == "SUCCESS") {
                this.toastr.success("Successfully Saved..!");
                this.Clear();
                await this.GetGrid();
              }
              else
                this.toastr.error(response.dataList['tblData'][0]['result']);
            }
          }
          else if (response.messageType == MessageType.error)
            this.errorService.warning(response.message);
          else
            this.errorService.warning('Something Went Wrong');
        }
      }
      this.spinnerService.hide();
    }
    catch (error) {
      this.spinnerService.hide();
      this.errorService.error(error);
    }
  }
  public Clear() {
    this.projectName = null;
    this.headPerson = null;
    this.selectedImpact = [];
    this.description = null;
    this.srNo = 0;
    this.mode = "Add";
  }
  public async Delete() {
    try {
      this.spinnerService.show();
      let response: ApiResponse = await this.Crud("DELETE");
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (this.helper.getString(response.dataList['tblData'][0]['result']).toUpperCase() == "SUCCESS") {
            this.toastr.success("Successfully Deleted..!");
            this.Clear();
            await this.GetGrid();
          }
          else
            this.toastr.error(response.dataList['tblData'][0]['result']);
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
  private async Validate(): Promise<boolean> {
    if (this.helper.getStringOrEmpty(this.projectName) == "") {
      this.ToolTip.show(document.getElementById("ProjectName"), "Enter Project Name");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.headPerson) == "") {
      this.ToolTip.show(document.getElementById("HeadPerson"), "Enter Head Person");
      return false;
    }
    if (this.selectedImpact == null || this.selectedImpact == undefined || this.selectedImpact.length == 0) {
      this.ToolTip.show(document.getElementById("Impact"), "Select atleast one Value");
      return false;
    }
    return true;
  }
  //#endregion
}
