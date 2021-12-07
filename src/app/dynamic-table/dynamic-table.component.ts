import { PurchaseItems, Product } from "./../../providers/constants";
import { Component, OnInit, Input, SimpleChange } from "@angular/core";
import { AjaxService } from "src/providers/ajax.service";
import { CommonService } from "../../providers/common-service/common.service";
import * as $ from "jquery";
import { iNavigation } from "src/providers/iNavigation";
import { AdvanceFilterModalComponent } from "../advance-filter-modal/advance-filter-modal.component";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { MappedActionPage } from "./../../providers/MappedActionPage";
import { ITable } from "./../../providers/Generic/Interface/ITable";
import {
  ItemReport,
  CustomerReport,
  Sales,
  PurchaseCredit,
  SalesInvestmentReport,
  VendorReport,
  BillingPage,
  Credit
} from "../../providers/constants";
import { PageEvent } from "@angular/material/paginator";

const ZerothIndex = 0;

@Component({
  selector: "app-dynamic-table",
  templateUrl: "./dynamic-table.component.html",
  styleUrls: ["./dynamic-table.component.scss"]
})
export class DynamicTableComponent implements OnInit {
  TableResultSet: any;
  Columns: any;
  ServerData: any;
  ItemCount: any;
  Header: any = [];
  BindingHeader: any = [];
  HeaderColumn: any = [];
  pageEvent: PageEvent;
  PageSize: any = 15;
  PageOptions: any = [10, 15, 20, 25, 50, 100];
  IsStriped: boolean = true;
  autosearch: string;
  PageType: string;
  CurrentSessionPageSize: any;
  CurrentSessionPageIndex: any;
  FilterQueryResult: string;
  IsLocalSearch: boolean;
  GlobalSearchQueryTemplate: string;
  IsEmptyRow: boolean = false;
  CurrentItemTotalPrice: number;
  CurrentItemDueAmount: number;
  TotalHeaders: number = 0;
  UpdateModel: any = {};
  CreditItems: [];
  CurrentPageName: string;
  EditCustomerName: string;
  mappedActionPage: MappedActionPage;
  EditMode: boolean = false;
  Grid: string;
  CanceledItems: Array<any> = [];
  NonGridItem: Array<string> = [];
  CurrentItem: any = null;
  EditCount: number = 0;
  EnableMultiSelect: boolean = true;
  @Input() pageData: ITable;
  @Input() Pagination: any;
  @Input() CurrentPageIndex: any;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: iNavigation,
    public dialog: MatDialog,
    private storage: ApplicationStorage
  ) {
    this.InitIds();
    this.CurrentPageName = this.commonService.GetCurrentPageName();
    this.mappedActionPage = this.commonService.GetPageActionDetail(
      this.CurrentPageName
    );
    this.autosearch = "eanblesearch";
    this.CurrentSessionPageSize = this.PageSize;
    this.CurrentSessionPageIndex = 0;
    this.IsLocalSearch = false;
    this.IsEmptyRow = false;
  }

  FilterLocaldata($event: any) {
    let e = $(event.currentTarget).val();
    switch (this.CurrentPageName) {
      case ItemReport:
        this.PrepareLocalFilterQuery("Stocks", e.toLocaleLowerCase());
        break;
      case CustomerReport:
        this.PrepareLocalFilterQuery("Customer", e.toLocaleLowerCase());
        break;
      case Sales:
        this.PrepareLocalFilterQuery("", e.toLocaleLowerCase());
        break;
      case PurchaseCredit:
        this.PrepareLocalFilterQuery("", e.toLocaleLowerCase());
        break;
      case SalesInvestmentReport:
        this.PrepareLocalFilterQuery("", e.toLocaleLowerCase());
        break;
      case VendorReport:
        this.PrepareLocalFilterQuery("Vendor", e.toLocaleLowerCase());
        break;
      case BillingPage:
        this.PrepareLocalFilterQuery("", e.toLocaleLowerCase());
        break;
      case Credit:
        this.PrepareLocalFilterQuery("", e.toLocaleLowerCase());
        break;
      default:
        alert("No page found");
    }
  }

  GenerateGlobalQueryTemplate() {
    let index = 0;
    let SearchStr = "{{REPLACABLE_QUERY}}";
    let Query = " ";
    while (index < this.HeaderColumn.length) {
      if (index === 0) {
        Query +=
          this.HeaderColumn[index] + " like '__@__" + SearchStr + "__@__'";
      } else {
        Query +=
          " or " +
          this.HeaderColumn[index] +
          " like '__@__" +
          SearchStr +
          "__@__'";
      }
      index++;
    }
    this.GlobalSearchQueryTemplate = Query;
  }

  GetGlocalQuery(SearchKey: string): string {
    let FinalQuery = this.GlobalSearchQueryTemplate.replace(
      /{{REPLACABLE_QUERY}}/g,
      SearchKey
    );
    return FinalQuery;
  }

  PrepareLocalFilterQuery(Name: string, Key: string) {
    if (Key !== null && Key !== "" && Key.length >= 3) {
      if (this.IsLocalSearch) {
        if (this.commonService.IsValidString(Name)) {
          let Data = this.storage.get(null, Name);
          if (this.commonService.IsValid(Data)) {
            this.FilterLocalTable(Data, Key);
          } else {
          }
        } else {
        }
      } else {
        let Uri = this.GetUrl(
          this.pageData.url,
          this.GetGlocalQuery(Key),
          "0",
          this.PageSize
        );
        this.LoadPageDataWithoutLoader(Uri);
      }
    } else {
      if (Key.length === 0) {
        let Uri = this.GetUrl(
          this.pageData.url,
          " 1=1 ",
          "0",
          this.PageSize
        );
        this.LoadPageDataWithoutLoader(Uri);
      }
    }
  }

  FilterLocalTable(Data: any, SearchString: string) {
    let SortedData = [];
    let index = 0;
    let innerindex = 0;
    let value = "";
    let LocalPageIndex =
      this.CurrentSessionPageIndex + this.CurrentSessionPageSize;
    while (index < Data.length && index < LocalPageIndex) {
      innerindex = 0;
      while (innerindex < this.HeaderColumn.length) {
        value = Data[index][this.HeaderColumn[innerindex]];
        if (value !== null && typeof value === "string") {
          if (
            value
              .toString()
              .toLocaleLowerCase()
              .indexOf(SearchString) !== -1
          ) {
            SortedData.push(Data[index]);
            break;
          }
        }
        innerindex++;
      }
      index++;
    }
    this.ServerData = SortedData;
    this.ItemCount = SortedData.length;
    this.GetTableData();
  }

  ResetFilter() {
    this.FilterQueryResult = "";
    let Uri = this.GetUrl(
      this.pageData.url,
      "1=1",
      "0",
      this.PageSize
    );
    this.LoadPageData(Uri);
  }

  GetAdvanceFilter() {
    const config = new MatDialogConfig();
    config.width = "60%";
    //config.position = { top: "20px" };
    config.data = { page: this.CurrentPageName };
    config.disableClose = true;
    const dialogRef = this.dialog.open(AdvanceFilterModalComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (this.commonService.IsValidString(result)) {
        this.FilterQueryResult = result;
        let Uri = this.GetUrl(
          this.pageData.url,
          result,
          "0",
          this.PageSize
        );
        this.LoadPageData(Uri);
      }
    });
  }

  LoadPageDataWithoutLoader(Uri: string) {
    this.ajax.get(Uri, false).then(
      data => {
        if (this.commonService.IsValidFilterResponse(data)) {
          this.ServerData = data["Record"];
          this.ItemCount = data["RecordCount"][0].Total;
          this.GetTableData();
        }
      },
      error => {
        console.log("Getting server error.");
      }
    );
  }

  changePage(event: any): any {
    let PageIndex = event.pageIndex.toString();
    let PageSize = event.pageSize.toString();
    this.CurrentSessionPageIndex = PageIndex;
    this.CurrentSessionPageSize = PageSize;
    let Uri = this.GetUrl(
      this.pageData.url,
      "1=1",
      PageIndex,
      PageSize
    );
    this.LoadPageData(Uri);
  }

  DeleteCurrentRecord() {}

  GetTableData() {
    if (
      this.commonService.IsValid(this.pageData) &&
      this.commonService.IsValid(this.ServerData)
    ) {
      let Keys = Object.keys(this.pageData);
      if (Keys.indexOf("rows") != -1) {
        this.IsEmptyRow = false;
        this.BuildGrid(this.ServerData);
      }
    } else {
      this.IsEmptyRow = true;
    }
  }

  BuildGrid(TableData: any) {
    this.TableResultSet = [];
    this.CloseEdit();
    let HiddenFields = [];
    let Row = {};
    if (
      this.commonService.IsValid(TableData) &&
      this.commonService.IsValid(this.pageData.rows)
    ) {
      this.Columns = this.pageData.rows;
      let index = 0;
      this.TotalHeaders = 0;
      while (index < TableData.length) {
        let innerIndex = 0;
        Row = {};
        while (innerIndex < this.Columns.length) {
          if (this.Columns[innerIndex]["type"] === "hidden") {
            HiddenFields.push({
              name: this.Columns[innerIndex].column,
              value: TableData[index][this.Columns[innerIndex].column]
            });
          } else if (this.Columns[innerIndex]["type"] === "checkbox") {
            if (this.HeaderColumn.indexOf("BH_Build_Checkbox") === -1) {
              this.HeaderColumn.push("BH_Build_Checkbox");
              this.BindingHeader.push("BH_Build_Checkbox");
            }
          } else {
            if (
              this.HeaderColumn.indexOf(this.Columns[innerIndex].column) === -1
            ) {
              this.HeaderColumn.push(this.Columns[innerIndex].column);
              this.BindingHeader.push(this.Columns[innerIndex].header);
            }
            if (!this.IsEmptyRow) {
              if (
                !this.commonService.IsValidString(
                  TableData[index][this.Columns[innerIndex].column]
                )
              ) {
                Row[this.Columns[innerIndex].column] = "NA";
              } else {
                Row[this.Columns[innerIndex].column] =
                  TableData[index][this.Columns[innerIndex].column];
              }
            }
          }
          innerIndex++;
        }

        if (this.TotalHeaders === 0)
          this.TotalHeaders = this.HeaderColumn.length + 1;
        this.TableResultSet.push({
          Record: Row,
          HiddenFields: HiddenFields
        });
        HiddenFields = [];
        index++;
      }
    }
    this.GenerateGlobalQueryTemplate();
  }

  GetCurrentRecord() {
    let ParsedObject = null;
    let JsonObject = $(event.currentTarget)
      .closest("td")
      .find('input[name="currentObject"]')
      .val();
    if (this.commonService.IsValidString(JsonObject)) {
      let ParsedData = JSON.parse(JsonObject);
      let Keys = Object.keys(ParsedData);
      if (
        Keys.indexOf("Record") !== -1 &&
        Keys.indexOf("HiddenFields") !== -1
      ) {
        ParsedObject = ParsedData;
      }
    }
    return ParsedObject;
  }

  GetUrl(
    Path: string,
    SearchStr: string,
    PageIndex: string,
    PageSize: string
  ): string {
    let Uri = `${Path}?SearchStr=${SearchStr}&SortBy=''&PageIndex=${PageIndex}&PageSize=${PageSize}`;
    return Uri;
  }

  LoadPageData(Uri: string) {
    this.ajax.get(Uri).then(
      data => {
        if (this.commonService.IsValidFilterResponse(data)) {
          this.ServerData = data["Record"];
          this.ItemCount = data["RecordCount"][0].Total;
          this.IsEmptyRow = false;
          this.GetTableData();
        } else {
          this.IsEmptyRow = true;
          this.ServerData = [{}];
          this.ItemCount = 0;
          this.GetTableData();
        }
      },
      error => {
        console.log("Getting server error.");
      }
    );
  }

  ngOnInit() {
    if (this.commonService.IsValid(this.pageData)) {
      if (
        this.commonService.IsValid(this.pageData.url) &&
        this.commonService.IsValid("1=1") !== undefined
      ) {
        let Uri = this.GetUrl(
          this.pageData.url,
          "1=1", "0",
          this.PageSize
        );
        this.LoadPageData(Uri);
      }
    }
  }

  BindCreditDetail(CurrentStock: any, ParsedData: any) {
    CurrentStock = CurrentStock[0];
    if (this.commonService.IsValid(CurrentStock)) {
      let Uri =
        `${this.mappedActionPage.GetUrl}?${this.mappedActionPage.PrimaryId}=` +
        CurrentStock.value;
      this.ajax.get(Uri).then(result => {
        if (this.commonService.IsValid(result)) {
          if (result.Table.length > 0) {
            this.EditCustomerName = ParsedData.Record.CustomerName;
            this.CreditItems = result.Table;
          }
          this.UpdateModel = {
            ItemUid: CurrentStock.value
          };
          this.EnableGrid();
        } else {
          this.UpdateModel = {
            ItemUid: CurrentStock.value
          };
          this.EnableGrid();
        }
      });
    } else {
      this.commonService.ShowToast(
        "Unable to get record. Please contact to admin."
      );
    }
  }

  BindPurchaseCreditDetail(CurrentStock: any, ParsedData: any) {
    CurrentStock = CurrentStock[0];
    if (this.commonService.IsValid(CurrentStock)) {
      if (
        this.mappedActionPage.GetUrl != "" &&
        this.mappedActionPage.PrimaryId != ""
      ) {
        let Uri =
          `${this.mappedActionPage.GetUrl}?${this.mappedActionPage.PrimaryId}=` +
          CurrentStock.value;
        this.ajax.get(Uri).then(result => {
          if (this.commonService.IsValid(result)) {
            if (result.Table.length > 0) {
              this.EditCustomerName = ParsedData.Record.Name;
              this.CreditItems = result.Table;
            }
            this.UpdateModel = {
              ItemUid: CurrentStock.value
            };
            this.EnableGrid();
          } else {
            this.UpdateModel = {
              ItemUid: CurrentStock.value
            };
            this.EnableGrid();
          }
        });
      } else {
        this.commonService.ShowToast(
          "Page url is not set properly. Please contact to admin."
        );
      }
    } else {
      this.commonService.ShowToast(
        "Unable to get record. Please contact to admin."
      );
    }
  }

  BindCurrentRowDetail() {
    this.UpdateModel = {};
    if (this.mappedActionPage !== null) {
      this.SetTotalAmount();
      let ParsedData = this.GetCurrentRecord();
      if (ParsedData !== null) {
        this.SetEditRow(ParsedData, null, null);
        let CurrentStock = ParsedData["HiddenFields"].filter(
          x => x.name === this.mappedActionPage.PrimaryId
        );
        if (CurrentStock.length > 0) {
          if (this.CurrentPageName === Credit)
            this.BindCreditDetail(CurrentStock, ParsedData);
          else if (this.CurrentPageName === PurchaseCredit)
            this.BindPurchaseCreditDetail(CurrentStock, ParsedData);
        } else {
          this.commonService.ShowToast(
            "Unable to get record. Please contact to admin."
          );
        }
      } else {
        this.commonService.ShowToast(
          "Unable to get record. Please contact to admin."
        );
      }
    }
  }

  EditCurrent() {
    this.EditMode = true;
    let EditPageUrl = "";
    switch (this.CurrentPageName) {
      case PurchaseCredit:
        $("#mNewAmount").val("");
        this.BindCurrentRowDetail();
        break;
      case Credit:
        $("#mNewAmount").val("");
        this.BindCurrentRowDetail();
        break;
      case Sales:
        this.EditCurrentSoldItem();
        break;
      case PurchaseItems:
        this.EditCurrentPurchaseItem();
        break;
      case ItemReport:
        {
        let $CurrentRow = JSON.parse(
          $(event.currentTarget)
            .closest("td")
            .find('input[name="currentObject"]')
            .val()
        );
        if (this.commonService.IsValid($CurrentRow)) {
          this.router.navigate(Product, $CurrentRow);
        } else {
          this.commonService.ShowToast("Getting error to edit current record.");
        }
      }
      break;
      default:
        if (
          EditPageUrl !== undefined &&
          EditPageUrl !== null &&
          EditPageUrl !== ""
        ) {
          let PageUrl = "";
          let NavigationData = null;
          if (this.commonService.IsValid(EditPageUrl)) {
            let UrlValue = EditPageUrl.split("/");
            PageUrl = UrlValue[0];
            NavigationData = $(event.currentTarget)
              .closest("td")
              .find('input[name="currentObject"]')
              .val();
            this.router.navigate(PageUrl, JSON.parse(NavigationData));
          }
        }
    }
  }

  SetTotalAmount() {
    this.CurrentItemTotalPrice = 0;
    this.CurrentItemDueAmount = 0;
    let CurrentRow = this.GetCurrentRecord();
    let TotalAmount = 0;
    if (CurrentRow !== null) {
      let PaidAmount = 0;
      try {
        if (this.commonService.IsValidString(CurrentRow["Record"].AmountPaid))
          PaidAmount = parseFloat(CurrentRow["Record"].AmountPaid);
        else throw "Invalid value";
        if (this.commonService.IsValidString(CurrentRow["Record"].AmountDue))
          this.CurrentItemDueAmount = parseFloat(
            CurrentRow["Record"].AmountDue
          );
        else throw "Invalid value";
        TotalAmount = parseFloat(
          (PaidAmount + this.CurrentItemDueAmount).toFixed(2)
        );
        this.CurrentItemTotalPrice = TotalAmount;
      } catch (e) {
        this.commonService.ShowToast(
          "Unable to fetch current row detail. Please contact to admin."
        );
      }
    } else {
      this.commonService.ShowToast(
        "Unable to fetch current row detail. Please contact to admin."
      );
    }
    return TotalAmount;
  }

  DeleteRecord() {
    $("#mNewAmount").val("");
    if (this.CurrentPageName === Credit) {
      this.UpdateModel = {};
      this.ShowAddEditSection("single-record");
      this.SetTotalAmount();
      let $RowDetail = $(event.currentTarget)
        .closest("td")
        .find('input[name="currentObject"]')
        .val();
      if (this.commonService.IsValid($RowDetail)) {
        $RowDetail = JSON.parse($RowDetail);
        let CurrentRow = this.GetCurrentRecord();
        if (CurrentRow !== null) {
          let CurrentStock = CurrentRow["HiddenFields"].filter(
            x => x.name === "ItemUid"
          );
          if (CurrentStock.length > 0) {
            CurrentStock = CurrentStock[0];
            this.UpdateModel = {
              ItemUid: CurrentStock.value
            };
            this.SetEditRow(CurrentRow, this.CurrentItemTotalPrice, 0);
            this.EnableGrid();
          }
        }
      } else {
        this.commonService.ShowToast(
          "Unable to fetch current row detail. Please contact to admin."
        );
      }
    } else {
      this.BindCurrentRowDetail();
      let EditSection = $("#single-record");
      let $DueAmount = EditSection.find('input[name="mDueAmount"]');
      EditSection.find('input[name="mNewAmount"]').val($DueAmount.val());
      $DueAmount.val("0");
      EditSection.find('input[name="mNewAmount"]').attr("disabled", true);
    }
  }

  SetEditRow(ParsedData: any, PaidAmount: number, DueAmount: number) {
    let EditSection = $("#single-record");
    if (PaidAmount === null)
      PaidAmount = parseFloat(ParsedData["Record"].AmountPaid);
    if (DueAmount === null)
      DueAmount = parseFloat(ParsedData["Record"].AmountDue);

    EditSection.find('input[name="mPaidAmount"]').val(PaidAmount);
    EditSection.find('input[name="mDueAmount"]').val(DueAmount);
    if (ParsedData !== null) {
      EditSection.find('span[name="ctx-name"]').text(
        ParsedData["Record"].CustomerName
      );

      let SoldDate = ParsedData.Record.CreatedOn;
      if (this.commonService.IsValid(SoldDate)) {
        EditSection.find('span[name="purchase-date"]').text(
          new Date(SoldDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        );
      }

      EditSection.find('span[name="ctx-name"]').text(ParsedData.Record.Name);
    }
  }

  ManageAmount() {
    let NewAmountGiven = parseFloat($(event.currentTarget).val());
    if (!isNaN(NewAmountGiven)) {
      let AmountLeft = this.CurrentItemDueAmount - NewAmountGiven;
      let CurrentPaidAmount = this.CurrentItemTotalPrice - AmountLeft;
      let ParseObject = this.GetCurrentRecord();
      if (
        !isNaN(CurrentPaidAmount) &&
        CurrentPaidAmount > 0 &&
        CurrentPaidAmount <= this.CurrentItemTotalPrice &&
        AmountLeft >= 0
      ) {
        this.SetEditRow(ParseObject, CurrentPaidAmount, AmountLeft);
      } else {
        if ($(event.currentTarget).val().length > 0)
          $(event.currentTarget).val(
            $(event.currentTarget)
              .val()
              .substr(0, $(event.currentTarget).val().length - 1)
          );
        this.commonService.ShowToast(
          "Paid amount is greater than total amount. Please verify it carefully."
        );
      }
    } else {
      this.SetEditRow(
        null,
        this.CurrentItemTotalPrice - this.CurrentItemDueAmount,
        this.CurrentItemDueAmount
      );
    }
  }

  UpdateRecord() {
    if (this.UpdateModel != null && this.UpdateModel != "") {
      if (Object.keys(this.UpdateModel).length > 0) {
        let $CurrentTag = $("#single-record");
        this.UpdateModel["AmountPaid"] = parseFloat(
          $CurrentTag.find('input[name="mPaidAmount"]').val()
        );
        this.UpdateModel["AmountDue"] = parseFloat(
          $CurrentTag.find('input[name="mDueAmount"]').val()
        );
        this.ajax
          .post(this.mappedActionPage.PostEditUrl, this.UpdateModel)
          .then(
            data => {
              if (this.commonService.IsValidFilterResponse(data)) {
                if (this.commonService.IsValidFilterResponse(data)) {
                  this.ServerData = data["Record"];
                  this.ItemCount = data["RecordCount"][0].Total;
                  this.GetTableData();
                  this.commonService.ShowToast("Record updated successfully");
                } else {
                  this.commonService.ShowToast(
                    "Fail to Update. Please contact to admin."
                  );
                }
              } else {
                this.commonService.ShowToast(
                  "Unable to get result. Please contact to admin."
                );
              }
            },
            err => {
              this.UpdateModel = {};
              this.commonService.ShowToast(
                "Unable to get result. Please contact to admin."
              );
            }
          );
      } else {
        this.commonService.ShowToast(
          "Invalid data update fail. Please contact to admin. Or try again later."
        );
      }
    }
  }

  EditCurrentPurchaseItem() {
    let $Row = $("#dynamic-grid-table").find(
      'tbody input[type="checkbox"]:checked'
    );
    if ($Row.length === 0) {
      $Row = $(event.currentTarget)
        .closest("tr")
        .find('input[type="checkbox"]');
    }
    this.CanceledItems = [];
    let index = 0;
    while (index < $Row.length) {
      let $CurrentRecord = $($Row[index])
        .closest("tr")
        .find('input[name="currentObject"]');
      if ($CurrentRecord !== null) {
        let CurrentDetail = JSON.parse($CurrentRecord.val());
        if (this.commonService.IsValid(CurrentDetail)) {
          let Item = CurrentDetail.HiddenFields.filter(
            x => x.name === "ItemUid"
          );
          if (Item.length > 0) {
            let PurchaseUid = Item[ZerothIndex].value;
            if (this.commonService.IsValid(PurchaseUid)) {
              let CurrentItem = this.ServerData.filter(
                x => x.ItemUid === PurchaseUid
              );
              if (CurrentItem.length > 0) {
                this.CanceledItems.push(CurrentItem[ZerothIndex]);
              }
            }
          }
        }
      }
      index++;
    }
    this.ShowAddEditSection("debitnote-section");
  }

  EditCurrentSoldItem() {
    this.CurrentItem = null;
    let $ctx = $("#manage-record");
    let BillNum = $(event.currentTarget)
      .closest("tr")
      .attr("billno");
    if (BillNum !== null) {
      let CurrentItem = this.ServerData.filter(x => x.BillNum === BillNum);
      if (CurrentItem.length > 0) {
        this.CanceledItems = [];
        this.CanceledItems = CurrentItem;
      }
    }
    this.ShowAddEditSection("manage-record");
  }

  CalculateRefundAmount() {
    let ReturnedQuantityString = $(event.currentTarget).val();
    let $SoldQuantity = $(event.currentTarget)
      .closest('div[name="cancel-section"]')
      .find('input[name="quantity"]');
    if (ReturnedQuantityString !== "" && $SoldQuantity !== null) {
      try {
        let SoldQuantity = parseInt($SoldQuantity.val());
        let ReturnedQuantity: number = parseFloat(ReturnedQuantityString);

        if (ReturnedQuantity > SoldQuantity) {
          $(event.currentTarget).val(
            ReturnedQuantityString.substr(0, ReturnedQuantityString.length - 1)
          );
          this.commonService.ShowToast(
            "Quantity should be less then sold quantity."
          );
        }
      } catch (e) {
        $SoldQuantity.val("");
        this.commonService.ShowToast("Invalid quantity supplied.");
      }
    }
  }

  HandleRefundAmount() {
    let Amount = $(event.currentTarget).val();
    try {
      let RefundAmount = parseFloat(Amount);
      let $PaidAmount = $(event.currentTarget)
        .closest('div[name="cancel-section"]')
        .find('input[name="mPaidAmount"]');
      if ($PaidAmount !== null) {
        if ($PaidAmount.val() !== "") {
          let PaidAmount = parseFloat($PaidAmount.val());
          if (RefundAmount > PaidAmount) {
            $(event.currentTarget).val("");
            this.commonService.ShowToast(
              "Refund amount is greater than paid amount."
            );
          }
        }
      }
    } catch (e) {
      this.commonService.ShowToast("Invalid amound supplied.");
    }
  }

  CancelItemAndRefund() {
    let $ctx = null;
    let UserUid = null;
    let UnregisteredUserUid = null;
    let CancelingItemData = [];
    let $items = $("#manage-record").find('input[name="canceledRecord"]');
    if ($items !== null && $items.length > 0) {
      let index = 0;
      let Item = null;
      while (index < $items.length) {
        $ctx = $items.closest("div");
        Item = JSON.parse($items[index].value);
        let PaidAmount = Item.AmountPaid;
        let RefundAmountGiven = parseFloat(
          $ctx.find('input[name="refundAmount"]').val()
        );
        let ReturnedQuantity = parseInt(
          $ctx.find('input[name="quantity"]').val()
        );
        let Resion = $ctx.find('textarea[name="resion"]').val();
        if (!isNaN(ReturnedQuantity) && !isNaN(RefundAmountGiven)) {
          try {
            UserUid = null;
            UnregisteredUserUid = null;
            if (Item.CustomerUid !== null && Item.CustomerUid !== "") {
              UserUid = Item.CustomerUid;
            } else if (
              Item.UnregisteredCustomerUid !== null &&
              Item.UnregisteredCustomerUid !== ""
            ) {
              UnregisteredUserUid = Item.UnregisteredCustomerUid;
            }
            CancelingItemData.push({
              ItemUid: Item.ItemUid,
              UserUid: UserUid,
              UnregisteredUserUid: UnregisteredUserUid,
              RefundAmount: RefundAmountGiven,
              ReturnedQuantity: ReturnedQuantity,
              BillNum: Item.BillNum,
              Resion: Resion
            });
          } catch (e) {
            this.commonService.ShowToast("Invalid qunatity or refund amount.");
            break;
          }
        }
        index++;
      }
    }

    if (CancelingItemData.length > 0) {
      this.ajax
        .post("Goods/CancelItem", CancelingItemData)
        .then(result => {
          if (result === "Record insert successfully") {
            this.commonService.ShowToast(
              "Selectect item canceled successfully."
            );
            this.ShowGrid();
          }
        })
        .catch(er => {
          this.commonService.ShowToast(
            "Unable to cancel or refund item(s). Please contact admin."
          );
        });
    } else {
      this.commonService.ShowToast("Refund amount is not valid.");
    }
  }

  DisableArea() {
    let $elem = $(event.currentTarget);
    if ($elem.val().trim().length === 0) {
      $elem.val("Enter resion for return and refund.");
      $elem.addClass("text-muted");
    }
  }

  EnableArea() {
    let $elem = $(event.currentTarget);
    $elem.removeClass("text-muted");
    if ($elem.val().trim() === "Enter resion for return and refund.") {
      $elem.val("");
    }
  }

  //--------------------------------------- Handling show hide sections --------------------------------------------

  CloseEdit() {
    this.EditMode = false;
    this.ShowGrid();
  }

  EnableGrid() {
    this.ShowAddEditSection("single-record");
  }

  InitIds() {
    this.Grid = "dynamic-grid-table";
    this.NonGridItem = ["single-record", "manage-record", "debitnote-section"];
  }

  ShowAddEditSection(SectionId: string) {
    let index = 0;
    $("#" + this.Grid).hide();
    while (index < this.NonGridItem.length) {
      $("#" + this.NonGridItem[index]).hide();
      index++;
    }

    $("#" + SectionId).fadeIn();
  }

  ShowGrid() {
    let index = 0;
    while (index < this.NonGridItem.length) {
      $("#" + this.NonGridItem[index]).hide();
      index++;
    }

    $("#" + this.Grid).fadeIn();
  }

  HandleAllCheckBoxex($e: any) {
    let flag = false;
    if ($e.currentTarget.checked) flag = true;
    $("#dynamic-grid-table")
      .find("tbody")
      .find('input[type="checkbox"]')
      .prop("checked", flag);

    this.EnableDisableEditDeleteOption(flag ? 2 : 0);
  }

  ManageCancelation($event: any) {
    if ($event.currentTarget.checked) {
      this.EditCount++;
    } else {
      this.EditCount--;
    }

    this.EnableDisableEditDeleteOption(this.EditCount);
  }

  EnableDisableEditDeleteOption(EditCount: number) {
    if (EditCount > 1) {
      let Items = $("#dynamic-grid-table").find('div[name="editdelete"]');
      let index = 0;
      while (index < Items.length) {
        if (index > 0) $(Items[index]).addClass("d-none");
        index++;
      }
    } else if (EditCount < 2) {
      $("#dynamic-grid-table")
        .find('div[name="editdelete"]')
        .removeClass("d-none");
    }
  }
}
