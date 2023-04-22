import { Component, OnInit, Input, Output, EventEmitter, Inject, LOCALE_ID } from '@angular/core';
import { CellClassParams, ColDef, ExcelCell, ExcelExportParams, GridOptions, ICellRendererParams, ProcessRowGroupForExportParams, RowNode, ShouldRowBeSkippedParams, ValueGetterParams } from 'ag-grid-community'
import 'ag-grid-enterprise';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { formatDate } from '@angular/common';
import * as _ from 'underscore';
@Component({
  selector: 'app-ag-grid',
  templateUrl: './ag-grid.component.html',
  styleUrls: ['./ag-grid.component.scss']
})
export class AgGridComponent implements OnInit {

  @Output() _gridApi = new EventEmitter<any>();
  @Output() filterchange = new EventEmitter<any>();
  @Output() CellValueChange = new EventEmitter<any>();
  @Output() rowDoubleClicked = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() cellClicked = new EventEmitter<any>();

  isRefresh: Boolean = true;
  isFilter: Boolean = false;
  public selectionFlag: boolean = true;
  public gridApi: any;
  public gridColumnApi: any;
  public columnDefs: ColDef[];
  public defaultColDef: ColDef;
  public autoGroupColumnDef: ColDef;
  public rowData: any;
  public DefaultData: any;
  public statusBar: any;
  public sideBar: any;
  public rowSelection;

  @Input() filterShow: boolean = true;
  @Input() masterDetail: boolean = false;
  @Input() rowHeight: number = 28;
  @Input() _gridOptions: GridOptions = {};
  @Input() _suppressRowClickSelection: boolean = false;
  @Input() rowGroupPanelShow: string = 'always';
  @Input() excelTitle: string = "Report";


  checked: boolean = false;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    // private helper: Helper,
  ) {
    this.sideBar = {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressColumnFilter: true,
            suppressColumnSelectAll: true,
            suppressColumnExpandAll: true,
          },
        },
      ],
      defaultToolPanel: 'columns',

    };

    this.defaultColDef = {
      flex: 1,
      // minWidth: 200,
      filter: true,
      sortable: true,
      resizable: true,
      editable: false,
      menuTabs: ['filterMenuTab', 'generalMenuTab'],
      enableRowGroup: true,
      cellClassRules: {
        PinColumn: (params: CellClassParams) => {
          return (params.node.rowPinned);
        },
        'indent-1': (params) => {
          if (params.node.group == true) {
            return (params.node.level == 0)
          }
        },
        'indent-2': (params) => {
          if (params.node.group == true) {
            return (params.node.level == 1)
          }
        },
        'indent-3': (params) => {
          if (params.node.group == true) {
            return (params.node.level == 2)
          }
        }
      },
    };
    this.autoGroupColumnDef = {
      headerName: 'My Group',
      cellClass: getIndentClass,
      minWidth: 200,
      flex: 1,
      sortable: true,
      pinned: 'left',
      sort: 'asc',
      // cellRenderer: MyGroupCellRenderer,

      //  groupRowRendererParams: MyGroupRowRendererParams,

      // filterValueGetter: (params) => {
      //   const colId = params.column.getColId();
      //   debugger
      //   if (colId.includes('country')) {
      //     return params.data.country;
      //   }
      // },

      cellRendererParams: {
        suppressCount: false,
        innerRenderer: (params) => this.MyGroupCellRenderer(params)
      },

      // GroupCellRenderer: (params) => {
      //   debugger
      //   params.suppressCount = false;
      //   params.innerRenderer = params.value;
      // },

      // cellRenderer: (params) => {
      //   debugger
      //   params.groupHideOpenParents = true;
      //   params.value = "123";
      // },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
        return initialGroupOrderComparator(nodeA, nodeB);
      }
    };


    this.statusBar = {
      statusPanels: [{ statusPanel: 'agAggregationComponent' }],
    };

  }

  ngOnInit() {
    this.rowSelection = 'multiple'
  }

  onCellKeyPress(e: any) {
    // if (e.event.key.toString().toLocaleLowerCase() == 'e' && e.event.shiftKey==true)
    //     this.excel();
  }

  onCellValueChanged(params: any) {
    this.CellValueChange.emit(params);
  }

  onFilterChanged(params: any) {
    if (params.columnApi.columnController.columnDefs.length > 0)
      this.filterchange.emit(params);
  }

  oncellEditingStarted() {
    this.isRefresh = false;
  }
  oncellEditingStopped() {
    this.isRefresh = true;
  }
  onRowDataChanged() {
    this.mymodel = "";
    this.gridColumnApi.applyColumnState({ defaultState: { sort: null } });
    this.gridApi.setQuickFilter("");
    // console.log('refresh grid')
    //  this.gridApi.closeToolPanel()

    // setTimeout(() => {
    //   this.gridApi.columnController.autoSizeAllColumns(false, "contextMenu");
    // }, 1000)

    // interval(700).pipe(take(3)).subscribe(x => {
    //this.gridApi.columnController.autoSizeAllColumns(false, "contextMenu");
    this.gridColumnApi.autoSizeColumns();
    //this.gridColumnApi.sizeColumnsToFit();
    // this.gridApi.columnController.sizeColumnsToFit();
    // }
    // );

  }
  onRowDataUpdated() {
    // console.log('RowDataUpdated')

  }
  onSortChanged() {
    this.valuechange(this.mymodel.toString().trim().toLowerCase());
    // console.log('Sort Change')
  }
  onModelUpdated(params: any) {
    // console.log('ModelUpdated', params)
  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this._gridOptions.rowHeight = 24;
    // this._gridOptions.api.onRowHeightChanged();
    // this._gridOptions.api.applyTransaction();
    this.gridApi.setRowData([])
    this.DefaultData = [];
    this._gridApi.emit(this.gridApi);
    this._gridOptions.onCellKeyDown = params => this.onCellKeyDown(params);
    this._gridOptions.context = {
      skipPinnedTop: true,
      skipColumnGroupHeaders: true,
      excelSelectionColumn: null
    }
    this._gridOptions.groupHideOpenParents = false;
    this._gridOptions.suppressAggFuncInHeader = true
    this._gridOptions.suppressRowTransform = false;
    this._gridOptions.api.setGroupHeaderHeight(35);
    this._gridOptions.api.setHeaderHeight(35);
    this._gridOptions.columnTypes = {
      intOnly: {
        aggFunc: (params) => {
          if (_.indexOf(["PACKETNO", "REFNO", "REFERENCENO", "LOTNO", "SRNO", "PROCESSNO", "REFSR", "SEQNO", "ONUMBER", "PRONO", "EXTNO", "REFSRNO", "PROCESS", "INVOICENO"], params.column.getColId().toUpperCase()) == -1) {
            let sum: number = 0;
            params.values.forEach((value) => { sum += Number(value) });
            return sum;
          }
        },
        cellStyle: () => { return { "text-align": "right" } }
      },
      text: {
        cellStyle: () => { return { "text-align": "left" } }
      },
      numeric0: {
        aggFunc: (params) => {
          var sum: number = 0;
          params.values.forEach((value) => { sum += Number(value) });
          return sum.toFixed(0);
        },
        cellStyle: () => { return { "text-align": "right" } },
        cellRenderer: (params) => {
          if (!isNaN(parseFloat(params.value)))
            return parseFloat(params.value).toFixed(0);
          else
            return params.value;
        }
      },
      numeric02: {
        aggFunc: (params) => {
          var sum: number = 0;
          params.values.forEach((value) => { sum += Number(value) });
          return sum.toFixed(2);
        },
        cellStyle: () => { return { "text-align": "right" } },
        cellRenderer: (params) => {
          if (!isNaN(parseFloat(params.value)))
            return parseFloat(params.value).toFixed(2);
          else
            return params.value;
        }
      },
      numeric03: {
        cellStyle: () => { return { "text-align": "right" } },
        cellRenderer: (params) => {
          if (!isNaN(parseFloat(params.value)))
            return parseFloat(params.value).toFixed(3);
          else
            return params.value;
        },
        aggFunc: (params) => {
          var sum: number = 0;
          params.values.forEach((value) => { sum += Number(value) });
          return sum.toFixed(3);
        }
      },
      alignRight: {
        cellStyle: () => { return { "text-align": "right" } }
      },
      dateType: {
        cellRenderer: (params) => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned && params.value) {
            return formatDate(params.value, 'dd/MM/yyyy hh:mm a', this.locale)
          }
        }
      },
      dateTime: {
        cellRenderer: (params) => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned && params.value) {
            return formatDate(params.value, 'dd/MM/yyyy hh:mm:ss a', this.locale)
          }
        }
      },
      date: {
        cellRenderer: (params) => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned && params.value) {
            return formatDate(params.value, 'dd/MM/yyyy', this.locale)
          }
        }
      },
      dateOnly: {
        cellRenderer: (params) => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned && params.value && !params.node.rowGroupColumn) {
            if (params.value.dateTime != null && params.value.dateTime != undefined)
              return formatDate(params.value['dateTime'], 'dd/MM/yyyy hh:mm a', this.locale)
          }
        },
        valueGetter: (params) => {
          if (!params.node.rowGroupColumn) {
            return {
              date: params.data[params.column.getColId()] ? formatDate(params.data[params.column.getColId()], 'dd/MM/yyyy', this.locale) : "",
              dateTime: params.data[params.column.getColId()]
            }
          }
        },
        comparator: (val1, val2) => {
          if (val1 === undefined && val2 === undefined) {
            return 0;
          }
          else if ((val1['dateTime']) == (val2['dateTime']))
            return 0;
          else if ((val1['dateTime']) > (val2['dateTime']))
            return 1;
          else
            return -1;
        },
        keyCreator: (params) => { return params.value['date'] }
      },
      select: {
        cellRenderer: params => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned) {
            var input = document.createElement("input");
            input.type = "checkbox";
            input.value = params.value === true || params.value === 'true' ? 'true' : 'false';
            input.checked = params.value === true || params.value === 'true' ? true : false;
            return input;
          }
        }
      },
      chkBox: {
        cellRenderer: params => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned) {
            var input = document.createElement("input");
            input.type = "checkbox";
            input.value = params.value === true || params.value === 'true' ? 'true' : 'false';
            input.checked = params.value === true || params.value === 'true' ? true : false;
            input.onclick = async () => {
              let column: string = params.column.colId
              params.node.setDataValue(column, params.node.data[column] == true ? false : true);
              this.gridApi.redrawRows();
            }
            return input;
          }
        }
      },
      chkBoxWithImage: {
        cellRenderer: params => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned) {
            if (params.value == true)
              return `<i style="font-size: 22px;color: green;" class="las la-check"></i>`;
            else if (params.value == false)
              return `<i style="font-size: 22px;color: red;" class="las la-times"></i>`;
          }
        }
      },
      chkWithLockImage: {
        cellRenderer: params => {
          if (params.data != undefined && params.data != null && !params.node.rowPinned) {
            if (params.value == true)
              return `<i style="color: green; opacity: 0.6" class="k-icon k-i-unlock pr-0"></i>`;
            else if (params.value == false)
              return `<i style="color: red; opacity: 0.6" class="icon-icon_lock pr-0"></i>`;
          }
        }
      }
    }

    this._gridOptions.onColumnRowGroupChanged = params => {
      this.autoSize();
    }
    this._gridOptions.excelStyles = [
      // {
      //   id: 'dateType',
      //   dataType: 'DateTime',
      //   numberFormat: {
      //     format: 'dd/MM/yyyy hh:mm am/pm'
      //   },
      // },
      // {
      //   id: 'Date',
      //   dataType: 'DateTime',
      //   numberFormat: {
      //     format: 'dd/MM/yyyy'
      //   },
      // },
      {
        id: 'ORow',
        interior: {
          color: '#FFFFFF',
          pattern: 'Solid',
          patternColor: undefined,
        },
        borders: {
          borderTop: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderBottom: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderLeft: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderRight: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          }
        },
      },
      {
        id: 'ERow',
        interior: {
          color: '#F2F2F2',
          pattern: 'Solid',
          patternColor: undefined,
        },
        borders: {
          borderTop: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderBottom: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderLeft: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderRight: {
            color: '#000000',
            lineStyle: 'Continuous',
            weight: 1,
          }
        },
      },
      // {
      //   id: 'borderTop',
      //   borders: {
      //     borderTop: {
      //       color: '#4A4A4A',
      //       lineStyle: 'Continuous',
      //       weight: 2,
      //     },
      //   },
      // },
      {
        id: 'LightPink',
        interior: {
          color: '#FFB6C1',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'txtRed',
        font: {
          color: '#FF0000',
          bold: true
        }
      },
      {
        id: 'txtGreen',
        font: {
          color: '#008000',
          bold: true
        }
      },
      {
        id: 'DharmColor',
        interior: {
          color: '#E6CF77',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'date',
        numberFormat: {
          format: 'dd/MM/yyyy hh:mm am/pm'
        },
        alignment: {
          horizontal: 'Center'
        },
        font: {
          bold: true,
        },
        borders: {
          borderBottom: {
            color: '',
            lineStyle: 'None',
            weight: 2,
          },
          borderLeft: {
            color: '',
            lineStyle: 'None',
            weight: 2,
          },
          borderRight: {
            color: '',
            lineStyle: 'None',
            weight: 2,
          },
          borderTop: {
            color: '',
            lineStyle: 'None',
            weight: 2,
          },
        },
      },
      {
        id: 'GSLowPriority',
        interior: {
          color: '#FFC6AA',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'GSOCodePriority',
        interior: {
          color: '#CCFF99',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'GSKapanRefPriority',
        interior: {
          color: '#FFFFCC',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'darkGreyBackground',
        interior: {
          color: '#fddd7c',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'headerGroup',
        alignment: {
          vertical: 'Center',
          horizontal: 'Center'
        },
        font: {
          bold: true,
        },
        interior: {
          color: '#E6CF77',
          pattern: 'Solid',
          patternColor: undefined,
        },
        borders: {
          borderBottom: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderLeft: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderRight: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderTop: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
        },
      },
      {
        id: 'header',
        alignment: {
          vertical: 'Center',
          horizontal: 'Center'
        },
        font: {
          bold: true,

        },
        interior: {
          color: '#BFBBBC',
          pattern: 'Solid',
          patternColor: undefined,
        },
        borders: {
          borderBottom: {
            color: '#babfc7',
            lineStyle: 'Continuous',
            weight: 2,
          },
        },
      },
      {
        id: 'redFont',
        font: {
          color: '#ff0000',
        },
      },
      {
        id: 'greenFont',
        font: {
          color: '#008000',
        },
      },
      {
        id: 'PinColumn',
        alignment: {
          horizontal: 'Center'
        },
        interior: {
          color: '#eddbba',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'backGroundcell',
        interior: {
          color: '#f1b850',
          pattern: 'Solid',
          patternColor: undefined,
        },
      },
      {
        id: 'indent-1',
        alignment: {
          indent: 1,
        },
        font: {
          color: '#3F3F76',
        },
        interior: {
          color: '#FFCC99',
          pattern: 'Solid',
          patternColor: undefined,
        },
        borders: {
          borderBottom: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderLeft: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderRight: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderTop: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
        },
        // note, dataType: 'string' required to ensure that numeric values aren't right-aligned
        dataType: 'String',
      },
      {
        id: 'indent-2',
        alignment: {
          indent: 2,
        },
        font: {
          color: '#9C6500',
        },
        interior: {
          color: '#FFEB9C',
          pattern: 'Solid',
          patternColor: undefined,
        },
        borders: {
          borderBottom: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderLeft: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderRight: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderTop: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
        },
        dataType: 'String',
      },
      {
        id: 'indent-3',
        alignment: {
          indent: 3,
        },
        font: {
          color: '#000000',
        },
        interior: {
          color: '#FFFFCC',
          pattern: 'Solid',
          patternColor: undefined,
        },
        borders: {
          borderBottom: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderLeft: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderRight: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
          borderTop: {
            color: '#7F7F7F',
            lineStyle: 'Continuous',
            weight: 1,
          },
        },
        dataType: 'String',
      }
    ];
    this.toolPanel();
    this._gridOptions.getRowClass = params => {
      if (params.data != undefined && params.data != null) {
        if (params.node.rowPinned) {
          return ["PinColumn"]
        }
      }

    };
    this._gridOptions.getRowStyle = params => {
      if (params.node.group == true) {
        if (params.node.level == 0)
          return {
            'background-color': '#ffcc99',
            'color': '#3F3F76',
            'font-weight': '700',
          }
        if (params.node.level == 1)
          return {
            'background-color': '#ffeb9c',
            'color': '#9C6500',
            'font-weight': '700',
          }
        if (params.node.level == 2)
          return {
            'background-color': '#ffffcc',
            'color': '#000000',
            'font-weight': '700',
          }
      }
    }

    this._gridOptions.getContextMenuItems = () => {
      var result = [
        'copy',
        'copyWithHeaders',
        'paste',
        //'export',
        {
          // custom item
          name: 'Export',
          subMenu: [
            {
              name: 'CSV ',
              action: () => {
                params.api.exportDataAsCsv();
              },
              icon:
                '<i class="k-icon k-i-csv"></i>',
            },
            {
              name: 'Excel',
              action: () => {
                params.api.exportDataAsExcel(this.getParams());
              },
              icon:
                '<i class="ag-icon ag-icon-excel"></i>',
            },
          ],
          icon:
            '<i class="ag-icon ag-icon-save"></i>',
        }
      ];
      return result;
    }
  }

  toolPanel() {

    if (this.gridApi.getOpenedToolPanel() != null)
      this.gridApi.closeToolPanel()
    else
      this.gridApi.openToolPanel('columns')
  }

  sAll() {
    this.selectionFlag = true;
    this.gridApi.selectAll()
  }
  dAll() {
    this.selectionFlag = true;
    this.gridApi.deselectAll()
  }
  expand() {
    this.gridApi.expandAll()
  }
  collapse() {
    this.gridApi.collapseAll()
  }

  isFilterChange(event: Event) {
    // console.log('isFilterChange')
    this.valuechange(this.mymodel.toString().trim().toLowerCase());
  }
  onRowDoubleClicked(param: Event) {
    this.rowDoubleClicked.emit(param)
  }

  getRowClass(params: any) {

    if (params.api.selectionController.lastSelectedNode == null)
      return null;

    if (params.node.id == params.api.selectionController.lastSelectedNode.id) {

      // console.log(params.node.id,'call',params.api.selectionController.lastSelectedNode.id)
      if (params.api.selectionController.getSelectedRows().length > 2)
        return ['lastrowselect'];

    }
    return null;
  };


  inverseAll() {
    // console.log('inverseAll')
    if (this.gridApi.getSelectedNodes().length > 0) {

      for (let i = 0; i < this.gridApi.rowModel.rowsToDisplay.length; i++) {
        this.gridApi.rowModel.rowsToDisplay[i].selectThisNode(!this.gridApi.rowModel.rowsToDisplay[i].isSelected());
      }
    }

  }


  mymodel: string = "";
  searchItem: SearchModel[] = [];


  valuechange(newValue: string) {
    // console.log('valuechange', newValue)
    this.mymodel = newValue;
    const allrow = Array();
    const allcolm = this.gridApi.getColumnDefs()


    if (!this.isFilter && this.mymodel.toString().trim() != '') {
      this.gridApi.setQuickFilter(this.mymodel.toString().trim().toLowerCase());
    }
    else
      this.gridApi.setQuickFilter("");

    this.searchItem = [];
    var tmp = this.gridApi.rowModel.rowsToDisplay;

    if (this.mymodel.toString().trim() != '') {
      for (const { index, value } of tmp.map((value: any, index: any) => ({ index, value }))) {
        var alreadyExist = false;
        for (var key of allcolm) {

          if (value.data != undefined && value.data[key.field] != null && value.data[key.field].toString().toLowerCase().includes(this.mymodel.toLowerCase())) {
            this.searchItem.push({ 'id': index, 'value': key.field })

          }
        }
      }
    }
    // console.log(this.searchItem)
    this.Check = 0;
    this.isNext = ''
    for (const index of this.gridColumnApi.columnController.getDisplayedColumns()) {
      // debugger
      if (this.mymodel.toString().trim() != '') {
        // index.colDef.cellClassRules = {
        //   'txtred': "(x).toString().toLocaleLowerCase().includes('" + this.mymodel.toString().trim().toLocaleLowerCase() + "') && '" + this.mymodel.toString().trim() + "'!='' "
        // }

        index.colDef.cellStyle = (param) => {
          if (param.value)
            if (param.value.toString().toUpperCase().includes(this.mymodel.toString().trim().toUpperCase()))
              return { color: 'red' }
          // if((param.value).toString().toLocaleLowerCase().includes('" + this.mymodel.toString().trim().toLocaleLowerCase() + "') && '" + this.mymodel.toString().trim() + "' != '' )
          // return ['']
        }
      }
      else {
        index.colDef.cellStyle = { color: 'black' }
      }
    }

    this.gridApi.redrawRows();
  }

  next() {
    if (this.isNext == "")
      this.isNext = "TRUE";

    if (this.isNext == "FALSE") {
      this.Check++;
      this.isNext = "TRUE";
    }
    if (this.Check < 0 || this.Check + 1 > this.searchItem.length)
      this.Check = 0;

    if (this.searchItem.length == 0)
      return;

    this.gridApi.ensureIndexVisible(this.searchItem[this.Check].id);
    this.gridApi.ensureColumnVisible(this.searchItem[this.Check].value);
    this.gridApi.setFocusedCell(this.searchItem[this.Check].id, this.searchItem[this.Check].value);

    this.Check++;

  }
  isNext: string = ''
  prev() {

    if (this.isNext == "")
      this.isNext = "FALSE";

    if (this.isNext == "TRUE") {
      this.Check--;
      this.isNext = "FALSE";
    }

    if (this.Check - 1 < 0)
      this.Check = this.searchItem.length;

    if (this.searchItem.length == 0)
      return;

    this.Check--;
    this.gridApi.ensureIndexVisible(this.searchItem[this.Check].id);
    this.gridApi.ensureColumnVisible(this.searchItem[this.Check].value);
    this.gridApi.setFocusedCell(this.searchItem[this.Check].id, this.searchItem[this.Check].value);

    if (this.Check < 0)
      this.Check = 0

  }

  excel() {
    //Pass Grid Selection Column if you want to download only selected row's excel
    //pass column name in this._gridOptions.context['excelSelectionColumn'] in your component in set grid method
    if (this._gridOptions.context['excelSelectionColumn'] != null) {
      let column: string = this._gridOptions.context['excelSelectionColumn'];
      this._gridOptions.api.forEachNodeAfterFilter(f => {
        if (f.data[column] == true)
          f.setSelected(true);
      })
      if (this._gridOptions.api.getSelectedNodes().length == 0)
        this._gridOptions.api.selectAll();
    }
    this.gridApi.exportDataAsExcel(this.getParams());
    if (this._gridOptions.context['excelSelectionColumn'] != null) {
      this.selectionFlag = false;
      this._gridOptions.api.forEachNodeAfterFilter(f => {
        if (f.isSelected() == true) {
          f.setSelected(false);
        }
      })
    }
  }
  getParams: () => ExcelExportParams = () => ({
    prependContent: this.getRows(),
    skipPinnedTop: this._gridOptions.context['skipPinnedTop'],
    sheetName: this.excelTitle,
    fileName: this.excelTitle,
    onlySelected: this._gridOptions.context['excelSelectionColumn'] == null ? false : true,
    autoConvertFormulas: true,
    processRowGroupCallback: rowGroupCallback,
    shouldRowBeSkipped: rowSkip,
    processCellCallback: (params) => {
      // if (params.column.getColDef().cellClass) {
      //   let columns: string[] = params.column.getColDef().cellClass.toString().toUpperCase().split(",");
      //   if (_.indexOf(columns, "DATETYPE") > -1)
      //     return params.value == null ? " " : (formatDate(params.value, 'dd/MM/yyyy hh:mm a', this.locale));
      //   if (_.indexOf(columns, "DATEONLY") > -1)
      //     return params.value == null ? " " : (formatDate(params.value['dateTime'], 'dd/MM/yyyy hh:mm a', this.locale));
      //   if (_.indexOf(columns, "DATE") > -1)
      //     return params.value == null ? " " : (formatDate(params.value, 'dd/MM/yyyy', this.locale));
      // }
      if (params.column.getColDef().type) {
        let columns: string[] = params.column.getColDef().type.toString().toUpperCase().split(",");
        if (_.indexOf(columns, "DATETYPE") > -1)
          return params.value == null ? " " : (formatDate(params.value, 'dd/MM/yyyy hh:mm a', this.locale));
        if (_.indexOf(columns, "DATETIME") > -1)
          return params.value == null ? " " : (formatDate(params.value, 'dd/MM/yyyy hh:mm:ss a', this.locale));
        if (_.indexOf(columns, "DATEONLY") > -1) {
          if (params.value)
            return params.value['dateTime'] == null ? " " : (formatDate(params.value['dateTime'], 'dd/MM/yyyy hh:mm a', this.locale));
        }
        if (_.indexOf(columns, "DATE") > -1)
          return params.value == null ? " " : (formatDate(params.value, 'dd/MM/yyyy', this.locale));
      }
      // if (params.column.getColId().toUpperCase().includes("DATE")) {
      //   console.log(params.column.getColId().toUpperCase().includes("DATE"));
      //   return params.value == null ? " " : (formatDate(params.value, 'dd/MM/yyyy hh:mm a', this.locale));
      // }
      return (params.value == null || (params.value == "" && parseInt(params.value) != 0 && params.value.toString().toUpperCase() != "FALSE")) ? " " : params.value;
    },
    skipColumnGroupHeaders: this._gridOptions.context['skipColumnGroupHeaders']
  })
  getRows: () => ExcelCell[][] = () => [
    [],
    [
      // {
      //   styleId: 'date',
      //   data: { value: this.excelTitle, type: 'String' }, mergeAcross: this.gridApi.columnApi.getAllDisplayedColumns()

      // },
      {
        styleId: 'date',
        data: { value: this.excelTitle, type: 'String' }, mergeAcross: this.gridApi.columnController.displayedColumns.length - 1
      },
    ],
    [
      {
        styleId: 'date',
        data: {
          value:
            formatDate(new Date(), 'dd/MM/yyyy h:mm:ss a', this.locale),
          type: 'String',
        }, mergeAcross: this.gridApi.columnController.displayedColumns.length - 1
      },
    ],
    []]
  Check: number = 0;

  autoSize() {
    if (this.isRefresh)
      this.gridColumnApi.autoSizeAllColumns(false, "contextMenu");
  }

  //autoSaveInterval = setInterval(() => { this.autoSize() }, 2500);

  ngOnChanges(changes: any) {
    if (this.columnDefs) {
      if (this.columnDefs.length > 0) {
        this.gridColumnApi.resetColumnState()
        this.autoSize()
      }
    }

  }
  onSelectionChanged(params: any) {
    var selectedRows = params.api.getSelectedRows();
    if (this.selectionFlag)
      this.rowSelect.emit(selectedRows[0]);
  }
  onCellClicked(params: any) {
    this.cellClicked.emit(params);
  }
  setPrinterFriendly(api) {
    const eGridDiv = document.querySelector('#myGrid');
    api.setDomLayout('print');
  }

  Print() {
    this.setPrinterFriendly(this.gridApi)
    setTimeout(function () {
      print();
    }, 2000);
  }

  // setNormal(api) {
  //   const eGridDiv = document.querySelector('#myGrid');
  //   eGridDiv.style.width = '700px';
  //   eGridDiv.style.height = '200px';

  //   api.setDomLayout();
  // }
  copyObject(obj) {
    var newObj = {};
    for (var key in obj) {
      //copy all the fields
      newObj[key] = obj[key];
    }
    return newObj;
  }

  //#region Delete Selected Range
  private onCellKeyDown(e) {
    let keyPress = e.event.keyCode;
    if (keyPress === 8 || keyPress === 46) {
      let cellRanges = e.api.getCellRanges();

      cellRanges.forEach(cells => {
        // we only need the ids of the columns to set the data
        let colIds = cells.columns.map(col => col.colId);

        // cell range start and end index depends on how you select the ranges, so we ensure that the startRowIndex is always less than the endRowIndex regardless of how the cell range was selected
        let startRowIndex = Math.min(
          cells.startRow.rowIndex,
          cells.endRow.rowIndex
        );

        let endRowIndex = Math.max(
          cells.startRow.rowIndex,
          cells.endRow.rowIndex
        );
        this.clearCells(startRowIndex, endRowIndex, colIds);
      });
    }
  }
  private clearCells(start, end, columns) {
    // iterate through every row
    for (let i = start; i <= end; i++) {
      let rowNode = this._gridOptions.api.getRowNode(i);
      // iterate through each column, inside the row and clear the cell
      columns.forEach(column => {
        if (this._gridOptions.api.getColumnDefs().filter(f => f['colId'] == column).map(f => f['editable'])[0]) {
          // set data to empty string
          rowNode.setDataValue(column, '');
        }
      });
    }
  }
  private MyGroupCellRenderer(params: ICellRendererParams) {
    if (params.node.group) {
      if (params.value === undefined || params.value === null)
        return "";
      else {
        if (params.node.rowGroupColumn.getColDef().type) {
          let columns: string[] = params.node.rowGroupColumn.getColDef().type.toString().toUpperCase().split(",");
          if (_.indexOf(columns, "DATETYPE") > -1)
            return params.value == null ? " " : (formatDate(params.value, 'dd/MM/yyyy hh:mm a', this.locale));
          // if (_.indexOf(columns, "CHKBOXWITHIMAGE") > -1) {
          //   if (this.helper.getString(params.value).toLowerCase() == "true")
          //     return `<i style="color: green; opacity: 0.6" class="icon-check pr-0"></i>`;
          //   else if (this.helper.getString(params.value).toLowerCase() == "false")
          //     return `<i style="color: red; opacity: 0.6" class="icon-delete pr-0"></i>`;
          //   else
          //     return ' ';
          // }
        }
      }
      return params.value
    }
    else
      return " ";
  }
  //#endregion
}
export type SearchModel = {
  id: number;
  value: string;
}

function rowGroupCallback(params: ProcessRowGroupForExportParams) {
  if (params.node.rowGroupColumn.getColDef().cellClass)
    if (params.node.rowGroupColumn.getColDef().cellClass.toString().toUpperCase() == "DATETYPE")
      return new Date(params.node.key).toLocaleString();
  return params.node.key!;
}

function rowSkip(params: ShouldRowBeSkippedParams) {
  if (params.api['columnController'].getRowGroupColumns().length > 0) {
    if (params.node.expanded || params.node.parent.expanded || params.node.level == 0)
      return false;
    else
      return true;
  }
  else
    return false;
}

function getIndentClass(params: CellClassParams) {
  var indent = 0;
  if (params.node['__hasChildren']) {
    indent++;
  }
  // var node = params.node;
  // while (node && node.parent) {
  //   indent++;
  //   node = node.parent;
  // }
  return 'indent-' + indent;
}


//filter on group column
function filtervalueGroup(params: ValueGetterParams) {
  return params.data ? params.data.rDate : null;
}

function initialGroupOrderComparator(nodeA: RowNode, nodeB: RowNode): number {
  // If Type Found
  if (nodeA['columnController'].rowGroupColumns[0].colDef['type']) {
    let columns = nodeA['columnController'].rowGroupColumns[0].colDef['type'].toString().toUpperCase().split(",");
    if (nodeB.key == null && nodeA.key == null) {
      return 0;
    }
    else if (_.indexOf(columns, "DATEONLY") > -1) {
      const date1Number = monthToComparableNumber(nodeA.key);
      const date2Number = monthToComparableNumber(nodeB.key);
      if (date1Number === null && date2Number === null) {
        return 0;
      }
      if (date1Number === null) {
        return -1;
      }
      if (date2Number === null) {
        return 1;
      }
      return (date1Number - date2Number);
    }
    else if (_.indexOf(columns, "TEXT") > -1) {
      return nodeA.key == nodeB.key ? 0 : nodeA.key > nodeB.key ? 1 : -1;
    }
    else if (_.indexOf(columns, "CHKBOXWITHIMAGE") > -1) {
      debugger
      return nodeA.key == nodeB.key ? 0 : nodeA.key > nodeB.key ? 1 : -1;
    }
    else {
      if (nodeA.key === null && nodeB.key === null) {
        return 0;
      }
      if (nodeA.key === null) {
        return -1;
      }
      if (nodeB.key === null) {
        return 1;
      }
      return Number(Number(nodeA.key).toFixed(3)) - Number(Number(nodeB.key).toFixed(3));
    }
  }
  else {
    if (nodeA.key === null) {
      return -1;
    }
    if (nodeB.key === null) {
      return 1;
    }
    if (Number(nodeA.key) && Number(nodeB.key)) {
      return (Number(nodeA.key) - Number(nodeB.key));
    }
    return nodeA.key == nodeB.key ? 0 : nodeA.key > nodeB.key ? 1 : -1;
  }
};

function monthToComparableNumber(date: string): number {
  if (date === undefined || date === null || date.length !== 10) {
    return null;
  }
  const yearNumber = Number.parseInt(date.substring(6, 10));
  const monthNumber = Number.parseInt(date.substring(3, 5));
  const dayNumber = Number.parseInt(date.substring(0, 2));
  return yearNumber * 10000 + monthNumber * 100 + dayNumber;
}
