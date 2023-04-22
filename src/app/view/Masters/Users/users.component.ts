import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from 'src/app/Class/Common/ApiResponse';
import { TooltipDirective } from 'src/app/Directive/tooltip.directive';
import { ErrorDialogueService } from 'src/app/Services/Common/ErrorDiag.service';
import { MastersService } from 'src/app/Services/Masters/Master.service';
import { DefaultImage, Helper, MessageType } from 'src/environments/Helper';
import * as _ from 'underscore';
declare var $: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  //#region Declaration
  @ViewChild(TooltipDirective) ToolTip;
  public userId: number = 0;
  public mode: string = "Add";
  public firstName: string;
  public lastName: string;
  public email: string;
  public username: string;
  public mobileNo: string;
  public extNo: string;
  public ddlRole: string[] = ['Approval Authority', 'Developer', 'Task Incharge', 'Manager'];
  public ddlProjectList: object[] = [];

  public selectedRole: string;
  public selectedProjectList: object[] = [];
  public profileImg: string = DefaultImage.UserProfile;

  public dropdownSettings: object = {
    singleSelection: false,
    badgeShowLimit: 1,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: "myclass custom-class"
  };

  public tblGridData: object[] = [];
  public gridOptions: GridOptions = {};
  private gridApi: any;
  private gridcolumnDefs: any;
  //#endregion

  constructor(private Service: MastersService,
    private spinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private errorService: ErrorDialogueService,
    private helper: Helper) { }

  async ngOnInit() {
    await this.FillCombo();
  }

  //#region API Methods
  private async FillCombo() {
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'FILLCOMBO'
      }
      let response: ApiResponse = await this.Service.Data(paraList);
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['tblProject'].length > 0) {
            this.ddlProjectList = response.dataList['tblProject'].map(f => {
              let obj: object = {}
              obj['id'] = f['srNo'];
              obj['itemName'] = f['projectName'];
              return obj
            })
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
  private async Crud(mode: string): Promise<ApiResponse> {
    let res: ApiResponse = new ApiResponse();
    try {
      this.spinnerService.show();
      let paraList = {
        Type: 'USERSCRUD',
        Mode: mode,
        SrNo: this.helper.getInt(this.userId),
        FirstName: this.helper.getString(this.firstName),
        LastName: this.helper.getString(this.lastName),
        Email: this.helper.getString(this.email),
        UserName: this.helper.getString(this.username),
        Password: "",
        MobileNo: this.helper.getString(this.mobileNo),
        ExtNo: this.helper.getString(this.extNo),
        Role: this.helper.getString(this.selectedRole),
        Projects: this.selectedProjectList.map(f => f['id']).join(","),
        profileImg: this.profileImg
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
  //#endregion

  //#region AG-Grid Methods
  async setGrid(event: any) {
    this.gridApi = await event;
    await this.GetGrid();
    this.gridOptions.suppressRowClickSelection = true;
    this.gridOptions.onCellClicked = (params) => {
      if (params.column.getColId().toUpperCase() == "DELETE") {
        this.userId = params.data['userId'];
        $("#openModal")[0].click();
      }
    }
    this.gridOptions.onCellDoubleClicked = async (params) => {
      if (params.column.getColId().toUpperCase() != "DELETE") {
        this.userId = params.data['userId'];
        this.mode = "Update";
        this.firstName = params.data['firstName'];
        this.lastName = params.data['lastName'];
        this.email = params.data['email'];
        this.username = params.data['userName'];
        this.mobileNo = params.data['mobileNo'];
        this.extNo = params.data['extNo'];
        this.selectedRole = params.data['role'];
        let projects: object[] = [];
        params.data['projects'].split(",").forEach(element => {
          if (this.ddlProjectList.find(f => f['id'] == element))
            projects.push(this.ddlProjectList.find(f => f['id'] == element));
        });
        this.selectedProjectList = projects;
        await this.GetImageById();
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
      if (_.indexOf(["PROJECTS"], columns[i].toUpperCase()) > -1)
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
  public Clear() {
    this.userId = 0
    this.mode = "Add";
    this.firstName = null;
    this.lastName = null;
    this.email = null;
    this.username = null;
    this.mobileNo = null;
    this.extNo = null;
    this.selectedRole = null;
    this.selectedProjectList = [];
    this.profileImg = DefaultImage.UserProfile;
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
  public async upload(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      this.errorService.warning('You must select an image');
      return;
    }
    if (event.target.files[0].size > 500000) {
      this.errorService.warning('Upload Image with Size less than 500KB..!');
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (_event) => {
      this.profileImg = reader.result.toString().substring(reader.result.toString().indexOf(",") + 1);
    }
  }
  private async GetImageById() {
    try {
      this.spinnerService.show();
      let response: ApiResponse = await this.Crud("GETIMAGEBYID");
      if (response.isValidUser) {
        if (response.messageType == MessageType.success) {
          if (response.dataList['tblData'].length > 0)
            this.profileImg = response.dataList['tblData'][0]['profileImg'];
          else
            this.profileImg = DefaultImage.UserProfile;
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
    if (this.helper.getStringOrEmpty(this.firstName) == "") {
      this.ToolTip.show(document.getElementById("fname"), "Enter FirstName");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.lastName) == "") {
      this.ToolTip.show(document.getElementById("lname"), "Enter LastName");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.email) == "") {
      this.ToolTip.show(document.getElementById("email"), "Enter Email");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.username) == "") {
      this.ToolTip.show(document.getElementById("Username"), "Enter Username");
      return false;
    }
    if (this.helper.getStringOrEmpty(this.selectedRole) == "") {
      this.ToolTip.show(document.getElementById("role"), "Select Role");
      return false;
    }
    if (this.selectedProjectList == null || this.selectedProjectList == undefined || this.selectedProjectList.length == 0) {
      this.ToolTip.show(document.getElementById("ProjectList"), "Select atleast one project");
      return false;
    }
    return true;
  }
  //#endregion
}
