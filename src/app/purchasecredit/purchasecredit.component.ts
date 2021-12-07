import { Component, OnInit } from "@angular/core";
import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { AjaxService } from "./../../providers/ajax.service";
import { CommonService } from "./../../providers/common-service/common.service";
import * as $ from "jquery";
import { PurchaseCreditColumn } from "./../../providers/constants";
import { ITable } from "./../../providers/Generic/Interface/ITable";

@Component({
  selector: "app-purchasecredit",
  templateUrl: "./purchasecredit.component.html",
  styleUrls: ["./purchasecredit.component.scss"]
})
export class PurchasecreditComponent implements OnInit {
  // IsNewCustomer: boolean = true;
  // CustomerDetail: any = {};
  // CustomerAadharDetail: any = {};
  // CustomerShopDetail: any = {};
  // UnregisteredCustomer: any = {};
  // TableDetail: any;
  // UpdateModel: any = {};
  // RowsCount: any;
  // PageOptions: any = [];
  // PageSize: number;
  // PageIndex: number;
  // SearchString: string;
  // SortBy: string;
  // Url: string;
  //CurrentEditRow: any;
  constructor(
    private local: ApplicationStorage,
    private http: AjaxService,
    private common: CommonService
  ) {
    // this.SearchString = " 1=1";
    // this.SortBy = " PurchaseItemUid";
    // this.Url = "GetPurchaseItemsByFilter";
    this.BindDynamicTableDetail();
  }

  BindDynamicTableDetail() {

  }

  FilterPageData(data: any) {}

  ngOnInit() {
    // let Data = this.local.get("master", "Customer");
    // $("#cust-tab").removeClass("d-none");
    // let NamedData = [];
    // let index = 0;
    // while (index < Data.length) {
    //   if (
    //     Data[index]["FirstName"] !== null &&
    //     Data[index]["FirstName"] !== ""
    //   ) {
    //     NamedData.push({
    //       Name: Data[index]["FirstName"] + " " + Data[index]["LastName"],
    //       Uid: Data[index]["CustomerUid"]
    //     });
    //   }
    //   index++;
    // }
    // this.CustomerDetail["data"] = NamedData;
    // this.CustomerDetail["PlaceholderText"] = "Customer Name";
    // let UnregisteredNamedData = [];
    // index = 0;
    // while (index < Data.length) {
    //   if (
    //     Data[index]["FirstName"] !== null &&
    //     Data[index]["FirstName"] !== ""
    //   ) {
    //     UnregisteredNamedData.push({
    //       Name: Data[index]["FirstName"] + " " + Data[index]["LastName"],
    //       Uid: Data[index]["CustomerUid"]
    //     });
    //   }
    //   index++;
    // }
    // this.UnregisteredCustomer["data"] = UnregisteredNamedData;
    // this.UnregisteredCustomer["PlaceholderText"] = "Unregistered Customer Name";
    // let DataByMobile = [];
    // index = 0;
    // while (index < Data.length) {
    //   if (Data[index]["ShopName"] !== null && Data[index]["ShopName"] !== "") {
    //     DataByMobile.push({
    //       Name: Data[index]["MobileNo"],
    //       Uid: Data[index]["CustomerUid"]
    //     });
    //   }
    //   index++;
    // }
    // this.CustomerAadharDetail["data"] = DataByMobile;
    // this.CustomerAadharDetail["PlaceholderText"] = "Customer By Aadhar No #";
    // let DataByShopName = [];
    // index = 0;
    // while (index < Data.length) {
    //   if (Data[index]["ShopName"] !== null && Data[index]["ShopName"] !== "") {
    //     DataByShopName.push({
    //       Name: Data[index]["ShopName"],
    //       Uid: Data[index]["CustomerUid"]
    //     });
    //   }
    //   index++;
    // }
    // this.PageSize = 10;
    // this.PageIndex = 0;
    // this.PageOptions = [5, 10, 25, 100];
    // this.CustomerShopDetail["data"] = DataByShopName;
    // this.CustomerShopDetail["PlaceholderText"] = "Customer By ShopName";
    // let PageUrl = this.GetUrl(
    //   this.Url,
    //   this.SearchString,
    //   this.SortBy,
    //   this.PageIndex,
    //   this.PageSize
    // );
    // this.LoadData(PageUrl);
  }

  // GetUrl(
  //   Url: string,
  //   SearchStr: string,
  //   SortBy: string,
  //   Index: number,
  //   Size: number
  // ) {
  //   let URI = "";
  //   if (
  //     SearchStr !== null &&
  //     SearchStr !== "" &&
  //     SortBy !== null &&
  //     SortBy !== ""
  //   ) {
  //     URI = `${Url}?SearchStr=${SearchStr}&SortBy=${SortBy}&PageIndex=${Index}&PageSize=${Size}`;
  //   }
  //   return URI;
  // }

  // ChangePage(event: any) {
  //   this.PageIndex = event.pageIndex.toString();
  //   this.PageSize = event.pageSize.toString();
  //   let PageUrl = this.GetUrl(
  //     this.Url,
  //     this.SearchString,
  //     this.SortBy,
  //     this.PageIndex,
  //     this.PageSize
  //   );
  //   this.LoadData(PageUrl);
  // }

  // FilterTable() {
  //   let CustomerUid = $("#CustomerByName")
  //     .find('input[name="main-input"]')
  //     .attr("uid");
  //   let CustomerName = $("#CustomerByName")
  //     .find('input[name="main-input"]')
  //     .val();
  //   if (CustomerUid == null || CustomerUid == "") {
  //     if (CustomerName !== null && CustomerName !== "") {
  //       this.SearchString = ` 1=1 and c.FirstName like '%${CustomerName}%'
  //       or c.LastName like '%${CustomerName}%'
  //       or uc.CustomerName like '%${CustomerName}%'`;
  //     } else {
  //       this.SearchString = " 1=1 ";
  //     }
  //   } else {
  //     this.SearchString = " 1=1 and si.CustomerUid='" + CustomerUid + "'";
  //   }
  //   let PageUrl = this.GetUrl(
  //     this.Url,
  //     this.SearchString,
  //     this.SortBy,
  //     this.PageIndex,
  //     this.PageSize
  //   );
  //   this.LoadData(PageUrl);
  // }

  // LoadData(Uri: string) {
  //   let PageUri = Uri;
  //   this.http.get(PageUri).then(data => {
  //     if (this.common.IsValidFilterResponse(data)) {
  //       this.TableDetail = data["Record"];
  //       this.RowsCount = data["RecordCount"];
  //       if (this.RowsCount !== null && this.RowsCount !== "") {
  //         this.RowsCount = this.RowsCount[0].Total;
  //       }
  //     } else {
  //       this.common.ShowToast("No credit data available.");
  //     }
  //   });
  // }

  // HandleNav(Type: string) {
  //   $("#cust-tab").removeClass("d-none");
  //   if (Type === "ExistingCustomer") {
  //     this.IsNewCustomer = true;
  //     $("#cust-tab").fadeIn();
  //   } else {
  //     this.IsNewCustomer = false;
  //     $("#cust-tab").fadeIn();
  //   }
  // }

  // Clearbox() {
  //   $("#CustomerByName")
  //     .find('input[name="main-input"]')
  //     .val("");
  //   $("#CustomerByAadahrNo")
  //     .find('input[name="main-input"]')
  //     .val("");
  //   $("#CustomerByShopName")
  //     .find('input[name="main-input"]')
  //     .val("");
  // }

  // HandlerEdit() {
  //   $("#grid-table").fadeOut();
  //   $("#single-record").removeClass("d-none");
  //   $("#single-record").fadeIn();
  // }

  // EnableGrid() {
  //   $("#grid-table").fadeIn();
  //   $("#single-record").fadeOut();
  // }

  // CloseEdit() {
  //   $("#grid-table").fadeIn();
  //   $("#single-record").fadeOut();
  // }

  // CloseAccount() {
  //   this.HandlerEdit();
  //   let $RowDetail = $(event.currentTarget)
  //     .closest("td")
  //     .find('input[name="row_detail"]')
  //     .val();
  //   if (this.common.IsValid($RowDetail)) {
  //     $RowDetail = JSON.parse($RowDetail);
  //     this.UpdateModel = {
  //       SoldItemUid: $RowDetail.SoldItemUid
  //     };

  //     $("#ctx-name").text($RowDetail.CustomerName);
  //     $("#purchase-date").text($RowDetail.CreatedOn);

  //     $("#mDueAmount").attr("disabled");
  //     $("#mDueAmount").val("0");

  //     $("#mPaidAmount").attr("disabled");
  //     $("#mPaidAmount").val($RowDetail.TotalPrice);
  //   } else {
  //     this.common.ShowToast(
  //       "Unable to fetch current row detail. Please contact to admin."
  //     );
  //   }
  // }

  // ManageAmount() {
  //   let Amount = parseFloat($("#mPaidAmount").val());
  //   if (Amount <= this.CurrentEditRow.TotalPrice) {
  //     let AmountLeft = this.CurrentEditRow.TotalPrice - Amount;
  //     $("#mDueAmount").val(AmountLeft);
  //   } else {
  //     this.common.ShowToast(
  //       "Paid amount is greater than total amount. Please verify it carefully."
  //     );
  //   }
  // }

  // UpdateRecord() {
  //   if (this.UpdateModel != null && this.UpdateModel != "") {
  //     if (Object.keys(this.UpdateModel).length > 0) {
  //       this.UpdateModel["AmountPaid"] = parseFloat($("#mPaidAmount").val());
  //       this.UpdateModel["AmountDue"] = parseFloat($("#mDueAmount").val());
  //       this.http.post("UpdateSoldItemDetail", this.UpdateModel).then(
  //         data => {
  //           if (this.common.IsValidFilterResponse(data)) {
  //             this.TableDetail = data["Record"];
  //             this.RowsCount = data["RecordCount"];
  //             this.UpdateModel = {};
  //             this.EnableGrid();
  //             this.common.ShowToast("Record updated successfully");
  //           } else {
  //             this.common.ShowToast(
  //               "Unable to get result. Please contact to admin."
  //             );
  //           }
  //         },
  //         err => {
  //           this.UpdateModel = {};
  //           this.common.ShowToast(
  //             "Unable to get result. Please contact to admin."
  //           );
  //         }
  //       );
  //     } else {
  //       this.common.ShowToast(
  //         "Invalid data update fail. Please contact to admin. Or try again later."
  //       );
  //     }
  //   }
  // }
}
