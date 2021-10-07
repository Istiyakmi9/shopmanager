import { Component, OnInit, Inject } from "@angular/core";
import { CommonService } from "./../../providers/common-service/common.service";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import * as $ from "jquery";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import {
  Billing,
  Dashboard,
  Product,
  Uploadexcel,
  ItemReport,
  Users,
  Customer,
  CustomerReport,
  Roles,
  Sales,
  Purchases,
  SalesInvestmentReport,
  Vendor,
  VendorReport,
  BillingPage,
  Credit,
  Setting
} from "../../providers/constants";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: "app-advance-filter-modal",
  templateUrl: "./advance-filter-modal.component.html",
  styleUrls: ["./advance-filter-modal.component.scss"]
})
export class AdvanceFilterModalComponent implements OnInit {
  ProductDetail: any;
  componentFilterName: string = "none";
  StocksDetail: any = {};
  BrandDetail: any = {};
  CatagoryDetail: any = {};
  InitStocksDetail: any = {};
  InitBrandDetail: any = {};
  InitCatagoryDetail: any = {};
  FilteringMasterData: any;
  LiveFilter: boolean = true;
  salesAndPurchasesForm: FormGroup;
  customerReportForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<AdvanceFilterModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private commonService: CommonService,
    private storage: ApplicationStorage,
    private fb: FormBuilder
  ) {
    this.ProductDetail = [];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.commonService.IsValid(this.data)) {
      this.componentFilterName = this.data["page"];
      this.ManageFormBuilder();
    }
    //this.BindInitialData();
  }

  ManageFormBuilder() {
    if (
      this.componentFilterName === Sales ||
      this.componentFilterName === Purchases
    ) {
      this.salesAndPurchasesForm = this.fb.group({
        customer: [""],
        serialno: [""],
        catagory: [""],
        brandName: [""],
        productName: [""],
        price: [""],
        quantity: [""]
      });
    } else if (this.componentFilterName === Customer) {
      this.customerReportForm = this.fb.group({
        customer: [""],
        gstinno: [""],
        catagory: [""],
        brandName: [""],
        productName: [""],
        mobileno: [""],
        emailId: [""],
        shopname: [""],
        price: [""],
        quantity: [""]
      });
    }
  }

  PurchasedQueryData() {
    let Query = "1=1 ";
    let CustomerName = this.customerReportForm.get("customer").value;
    if (this.commonService.IsValidString(CustomerName)) {
      CustomerName = CustomerName.trim();
      Query += " and CustomerName like '__@__" + CustomerName + "__@__'";
    }

    let GSTINNo = this.customerReportForm.get("gstinno").value;
    if (this.commonService.IsValidString(GSTINNo)) {
      GSTINNo = GSTINNo.trim();
      Query += " and GSTNo like '__@__" + GSTINNo + "__@__'";
    }

    let MobileNo = this.customerReportForm.get("mobileno").value;
    if (this.commonService.IsValidString(MobileNo)) {
      MobileNo = MobileNo.trim();
      Query += " and MobileNo like '__@__" + MobileNo + "__@__'";
    }

    let EmailId = this.customerReportForm.get("emailId").value;
    if (this.commonService.IsValidString(EmailId)) {
      EmailId = EmailId.trim();
      Query += " and EmailId like '__@__" + EmailId + "__@__'";
    }

    let ShopName = this.customerReportForm.get("shopname").value;
    if (this.commonService.IsValidString(ShopName)) {
      ShopName = ShopName.trim();
      Query += " and ShopName like '__@__" + ShopName + "__@__'";
    }

    let Catagory = this.customerReportForm.get("catagory").value;
    if (this.commonService.IsValidString(Catagory)) {
      Catagory = Catagory.trim();
      Query += " and Catagory like '__@__" + Catagory + "__@__'";
    }

    let BrandName = this.customerReportForm.get("brandName").value;
    if (this.commonService.IsValidString(BrandName)) {
      BrandName = BrandName.trim();
      Query += " and Brand like '__@__" + BrandName + "__@__'";
    }

    let ProductName = this.customerReportForm.get("productName").value;
    if (this.commonService.IsValidString(ProductName)) {
      ProductName = ProductName.trim();
      Query += " and ProductName '__@__" + ProductName + "__@__'";
    }

    return Query;
  }

  CreateSalesFilterQuery() {
    let Query = "1=1 ";
    let Catagory = this.salesAndPurchasesForm.get("catagory").value;
    if (Catagory !== null && Catagory !== "") {
      Query += " and CatagoryName like '__@__" + Catagory + "__@__'";
    }

    let Brand = this.salesAndPurchasesForm.get("brandName").value;
    if (Brand !== null && Brand !== "") {
      Query += " and BrandName like '__@__" + Brand + "__@__'";
    }

    let Product = this.salesAndPurchasesForm.get("productName").value;
    if (Product !== null && Product !== "") {
      Query += " and ItemName like '__@__" + Product + "__@__'";
    }

    let CustomerName = this.salesAndPurchasesForm.get("customer").value;
    if (this.commonService.IsValidString(CustomerName)) {
      CustomerName = CustomerName.trim();
      Query += " and CustomerName like '__@__" + CustomerName + "__@__'";
    }

    let SerialNo = this.salesAndPurchasesForm.get("serialno").value;
    if (this.commonService.IsValidString(SerialNo)) {
      SerialNo = SerialNo.trim();
      Query += " and SerialNumber like '__@__" + SerialNo + "__@__'";
    }

    let Price = this.salesAndPurchasesForm.get("price").value;
    if (this.commonService.IsValidString(Price)) {
      Price = Price.trim();
      Query += " and AmountPaid > " + Price;
    }

    let Quantity = this.salesAndPurchasesForm.get("quantity").value;
    if (this.commonService.IsValidString(Quantity)) {
      Quantity = Quantity.trim();
      Query += " and Quantity = " + Quantity;
    }

    return Query;
  }

  onSubmitClick(): void {
    let FilterQuery = null;
    if (
      this.componentFilterName === Sales ||
      this.componentFilterName === Purchases
    ) {
      FilterQuery = this.CreateSalesFilterQuery();
    } else if (this.componentFilterName == CustomerReport) {
      FilterQuery = this.PurchasedQueryData();
    }
    this.dialogRef.close(FilterQuery);
  }

  ManageDropmenuEvent() {
    let $CurrentObject = $(event.currentTarget);
    let Value = $CurrentObject.attr("name");
    $CurrentObject
      .closest('div[name="popupmenu"]')
      .find('button[name="queryevent"]')
      .text(Value)
      .attr("value", Value);
  }

  AllowNumber($e: any) {
    if (!this.commonService.IsNumeric($e.key)) {
      event.preventDefault();
    }
  }

  FilterRecord(key: string, Type: string) {
    let Data = this.FilteringMasterData;
    let StocksData = [];
    let BrandData = [];
    let CatagoryData = [];
    key = key.toLocaleLowerCase();
    Type = "Catagory";
    if (Data !== null && Data.length > 0) {
      let index = 0;
      while (index < Data.length) {
        if (Type === "Catagory") {
          if (Data[index].CatagoryName.toLocaleLowerCase().indexOf(key) === 0) {
            if (
              CatagoryData.filter(x => x.data.Uid === Data[index].CatagoryUid)
                .length === 0
            ) {
              CatagoryData.push({
                value: Data[index].CatagoryName,
                data: {
                  Uid: Data[index].CatagoryUid,
                  Type: "Catagory"
                }
              });
            }
          }
        } else if (Type === "Brand") {
          if (Data[index].BrandName.toLocaleLowerCase().indexOf(key) === 0) {
            if (
              BrandData.filter(x => x.data.Uid === Data[index].BrandUid)
                .length === 0
            ) {
              BrandData.push({
                value: Data[index].BrandName,
                data: {
                  Uid: Data[index].BrandUid,
                  Type: "Brand"
                }
              });
            }
          }
        } else {
          if (Data[index].ItemName.toLocaleLowerCase().indexOf(key) === 0) {
            if (
              StocksData.filter(x => x.data.Uid === Data[index].StockUid)
                .length === 0
            ) {
              StocksData.push({
                value: Data[index].ItemName,
                data: {
                  Uid: Data[index].StockUid,
                  Type: "Stock"
                }
              });
            }
          }
        }
        index++;
      }

      if (Type === "Catagory") {
        this.CatagoryDetail = {};
        this.CatagoryDetail["data"] = CatagoryData;
        this.CatagoryDetail["placeholder"] = "Item Catagory";
      } else if (Type === "Brand") {
        this.BrandDetail["data"] = BrandData;
        this.BrandDetail["placeholder"] = "Brand name";
      } else {
        this.StocksDetail["data"] = StocksData;
        this.StocksDetail["placeholder"] = "Product name";
      }
    }
  }

  BindAdjecentData(CurrentData: any) {
    if (this.commonService.IsValidString(CurrentData)) {
      let CurrentObject = JSON.parse(CurrentData);
      let Uid = CurrentObject.data.Uid;
      let Type = CurrentObject.data.Type;
      this.FilterByUid(Uid, Type);
    }
  }

  FilterByUid(Uid: string, Type: string) {
    let Data = this.FilteringMasterData;
    let StocksData = [];
    let BrandData = [];
    let CatagoryData = [];
    let CurrentUid = "";
    if (Data !== null && Data.length > 0) {
      let index = 0;
      while (index < Data.length) {
        if (Type === "Catagory") {
          CurrentUid = Data[index].CatagoryUid;
          if (CurrentUid === Uid) {
            if (
              BrandData.filter(x => x.value.Uid === Data[index].BrandUid)
                .length === 0
            ) {
              BrandData.push({
                value: Data[index].BrandName,
                data: {
                  Uid: Data[index].BrandUid,
                  Type: "Brand"
                }
              });
            }

            if (
              StocksData.filter(x => x.value.Uid === Data[index].StockUid)
                .length === 0
            ) {
              StocksData.push({
                value: Data[index].ItemName,
                data: {
                  Uid: Data[index].StockUid,
                  Type: "Stock"
                }
              });
            }
          }
        } else if (Type === "Brand") {
          CurrentUid = Data[index].BrandUid;
          if (CurrentUid === Uid) {
            if (
              CatagoryData.filter(x => x.value.Uid === Data[index].CatagoryUid)
                .length === 0
            ) {
              CatagoryData.push({
                value: Data[index].CatagoryName,
                data: {
                  Uid: Data[index].CatagoryUid,
                  Type: "Catagory"
                }
              });
            }

            if (
              StocksData.filter(x => x.value.Uid === Data[index].StockUid)
                .length === 0
            ) {
              StocksData.push({
                value: Data[index].ItemName,
                data: {
                  Uid: Data[index].StockUid,
                  Type: "Stock"
                }
              });
            }
          }
        } else {
          CurrentUid = Data[index].StockUid;
          if (CurrentUid === Uid) {
            if (
              CatagoryData.filter(x => x.value.Uid === Data[index].CatagoryUid)
                .length === 0
            ) {
              CatagoryData.push({
                value: Data[index].CatagoryName,
                data: {
                  Uid: Data[index].CatagoryUid,
                  Type: "Catagory"
                }
              });
            }

            if (
              BrandData.filter(x => x.value.Uid === Data[index].BrandUid)
                .length === 0
            ) {
              BrandData.push({
                value: Data[index].BrandName,
                data: {
                  Uid: Data[index].BrandUid,
                  Type: "Brand"
                }
              });
            }
          }
        }
        index++;
      }

      if (Type === "Catagory") {
        this.BrandDetail = {};
        this.StocksDetail = {};
        this.BrandDetail["data"] = BrandData;
        this.BrandDetail["placeholder"] = "Brand name";

        this.StocksDetail["data"] = StocksData;
        this.StocksDetail["placeholder"] = "Product name";

        this.HandleOtherAutoCompleteFields("BrandName", BrandData);
        this.HandleOtherAutoCompleteFields("ProductName", StocksData);
      } else if (Type === "Brand") {
        this.CatagoryDetail = {};
        this.StocksDetail;

        this.CatagoryDetail["data"] = CatagoryData;
        this.CatagoryDetail["placeholder"] = "Item Catagory";

        this.StocksDetail["data"] = StocksData;
        this.StocksDetail["placeholder"] = "Product name";

        this.HandleOtherAutoCompleteFields("Catagory", CatagoryData);
        this.HandleOtherAutoCompleteFields("ProductName", StocksData);
      } else {
        this.BrandDetail;
        this.CatagoryDetail;

        this.BrandDetail["data"] = BrandData;
        this.BrandDetail["placeholder"] = "Brand name";

        this.CatagoryDetail["data"] = CatagoryData;
        this.CatagoryDetail["placeholder"] = "Item Catagory";

        this.HandleOtherAutoCompleteFields("Brand", BrandData);
        this.HandleOtherAutoCompleteFields("Catagory", CatagoryData);
      }
    }
  }

  HandleOtherAutoCompleteFields(FieldId: string, DataObject: any) {
    let $ActiveAutoField = $("#" + FieldId).find(
      'input[name="iautofill-textfield"]'
    );
    if (
      $ActiveAutoField !== null &&
      DataObject.length > 0 &&
      typeof $ActiveAutoField.attr("data") !== "undefined"
    ) {
      let CurrentUid = JSON.parse($ActiveAutoField.attr("data")).Uid;
      if (DataObject.filter(x => x.data.Uid == CurrentUid).length === 0) {
        $ActiveAutoField.val("").attr("data", "");
      }
    }
  }

  ToggleDropdownMenu() {
    $(event.currentTarget)
      .closest("div")
      .find('div[name="dropdown-menu"]')
      .toggleClass("d-none");
  }

  BindInitialData() {
    if (
      this.componentFilterName === Sales ||
      this.componentFilterName === Purchases
    ) {
      this.FilteringMasterData = this.storage.get(null, "Stocks");
      let Data = this.FilteringMasterData;
      let StocksData = [];
      let BrandData = [];
      let CatagoryData = [];
      if (Data !== null && Data.length > 0) {
        let index = 0;
        while (index < Data.length) {
          if (
            BrandData.filter(x => x.value.Uid === Data[index].BrandUid)
              .length === 0
          ) {
            BrandData.push({
              value: Data[index].BrandName,
              data: {
                Uid: Data[index].BrandUid,
                Type: "Brand"
              }
            });
          }

          if (
            StocksData.filter(x => x.value.Uid === Data[index].StockUid)
              .length === 0
          ) {
            StocksData.push({
              value: Data[index].ItemName,
              data: {
                Uid: Data[index].StockUid,
                Type: "Stock"
              }
            });
          }

          if (
            CatagoryData.filter(x => x.value.Uid === Data[index].CatagoryUid)
              .length === 0
          ) {
            CatagoryData.push({
              value: Data[index].CatagoryName,
              data: {
                Uid: Data[index].CatagoryUid,
                Type: "Catagory"
              }
            });
          }
          index++;
        }
        this.StocksDetail["data"] = StocksData;
        this.InitStocksDetail = StocksData;
        this.StocksDetail["placeholder"] = "Product name";

        this.BrandDetail["data"] = BrandData;
        this.InitBrandDetail = BrandData;
        this.BrandDetail["placeholder"] = "Brand name";

        this.CatagoryDetail["data"] = CatagoryData;
        this.InitCatagoryDetail = CatagoryData;
        this.CatagoryDetail["placeholder"] = "Item Catagory";
      }
    }
  }
}
