import { iNavigation } from "src/providers/iNavigation";
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import * as $ from "jquery";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { CommonService } from "../../providers/common-service/common.service";
import { AjaxService } from "src/providers/ajax.service";
import { PageCache } from "src/providers/PageCache";
import { ItemReport } from "src/providers/constants";

@Component({
  selector: "app-catagory",
  templateUrl: "./catagory.component.html",
  styleUrls: ["./catagory.component.scss"]
})
export class CatagoryComponent implements OnInit {
  @ViewChild("form") CatagoryData: NgForm;
  private IsEditPage: boolean = false;
  private PageObject: any = null;
  ExistingCatagory: any = null;
  ExistingVendor: any = null;
  ExistingBrand: any = null;
  EditCurrentItem: any = null;
  AutoFillDropdownData: any = {
    data: [],
    placeholder: "Brand Name"
  };
  AutoFillCatagory: any = {
    data: [],
    placeholder: "Catagory"
  };

  AutoFillVendor: any = {
    data: [],
    placeholder: "Vendor"
  };
  IsBlurEnabled: any = "";
  Item: any = {
    ItemName: "",
    SerialNumber: "",
    Quantity: "",
    MRP: "",
    ActualPrice: "",
    SellingPrice: "",
    StockUid: "",
    VendorUid: ""
  };
  ItemCount: any;
  constructor(
    private storage: ApplicationStorage,
    private commonService: CommonService,
    private http: AjaxService,
    private cache: PageCache,
    private nav: iNavigation
  ) {}

  ngOnInit() {
    let Data = this.commonService.GetCurrentPageStorageValue();
    if (Data !== null) {
      this.PageObject = Data;
      if (typeof this.PageObject["HiddenFields"] !== "undefined") {
        let StockUid = this.PageObject.HiddenFields[0].value;
        if (StockUid !== null && StockUid !== "") {
          this.IsEditPage = true;
        }
      }
    }
    this.IsBlurEnabled = "true";
    this.InitPageData();
  }

  InitPageData() {
    let CatagoryDetail = this.storage.get("master", "Catagory");
    let VendorDetail = this.storage.get("master", "Vendor");
    if (this.commonService.IsValid(CatagoryDetail)) {
      CatagoryDetail = this.GetCatagory(CatagoryDetail);
      this.AutoFillCatagory["data"] = CatagoryDetail;
      this.AutoFillCatagory["placeholder"] = "Catagory";

      CatagoryDetail = this.GetVendor(VendorDetail);
      this.AutoFillVendor["data"] = CatagoryDetail;
      this.AutoFillVendor["placeholder"] = "Vendor";
    } else {
      this.commonService.ShowToast("No stocks available. Please add new.");
    }

    if (this.IsEditPage) {
      let StockUid = this.PageObject.HiddenFields[0].value;
      this.http
        .get("ItemAndGoods/GetStockDetailByUid?StockUid=" + StockUid)
        .then(
          data => {
            if (this.commonService.IsValid(data)) {
              this.EditCurrentItem = data["Record"];
              if (
                this.EditCurrentItem !== null &&
                this.EditCurrentItem.length > 0
              ) {
                this.EditCurrentItem = this.EditCurrentItem[0];
                this.ExistingCatagory = this.AutoFillCatagory["data"].filter(
                  x => x.data === this.EditCurrentItem.CatagoryUid
                );
                if (this.ExistingCatagory.length > 0) {
                  this.ExistingCatagory = this.ExistingCatagory[0];
                }

                this.ExistingVendor = this.AutoFillVendor["data"].filter(
                  x => x.data === this.EditCurrentItem.VendorUid
                );
                if (this.ExistingVendor.length > 0) {
                  this.ExistingVendor = this.ExistingVendor[0];
                }

                this.VerifyCatagory(JSON.stringify(this.ExistingCatagory));

                this.Item = {
                  ItemName: this.EditCurrentItem.ItemName,
                  SerialNumber: this.EditCurrentItem.SerialNumber,
                  Quantity: this.EditCurrentItem.AvailableQuantity,
                  MRP: this.EditCurrentItem.MRP,
                  ActualPrice: this.EditCurrentItem.ActualPrice,
                  SellingPrice: this.EditCurrentItem.SellingPrice,
                  StockUid: this.EditCurrentItem.StockUid,
                  VendorUid: this.EditCurrentItem.VendorUid
                };
              }
            }
          },
          error => {}
        );
    }
  }

  VerifyCatagory(e: any) {
    let CatagoryData = JSON.parse(e);
    if (
      this.commonService.IsValid(CatagoryData) ||
      !this.commonService.IsValidString(CatagoryData.data)
    ) {
      if (CatagoryData["data"] === "") {
        this.commonService.ShowToast(
          "Please add catagory first. Go to setting page.",
          10
        );
        this.ClearAllFields();
      } else {
        let CatagoryUid = CatagoryData["data"];
        let BrandDetail = this.storage.get("master", "Brands");
        this.OnBlurFieldValidation();
        let FilteredBrands = BrandDetail.filter(
          x => x.CatagoryUid === CatagoryUid
        );
        if (FilteredBrands.length > 0) {
          FilteredBrands = this.GetBrands(FilteredBrands);
          this.AutoFillDropdownData["data"] = FilteredBrands;
          this.AutoFillDropdownData["placeholder"] = "Brand Name";
          if (this.IsEditPage) {
            this.ExistingBrand = this.AutoFillDropdownData["data"].filter(
              x => x.data === this.EditCurrentItem.BrandUid
            );
            if (this.ExistingBrand.length > 0) {
              this.ExistingBrand = this.ExistingBrand[0];
            }
          }
        } else {
          this.AutoFillDropdownData["data"] = [];
          this.commonService.ShowToast("No stocks available. Please add new.");
        }
      }
    }
  }

  OnBlurFieldValidation() {
    $("#catagory-form")
      .find("*[required]")
      .blur(($event: any) => {
        if ($($event.target).is("input")) {
          if (this.commonService.IsValidField($(event.currentTarget).val())) {
            $(event.currentTarget)
              .removeClass("error-field")
              .addClass("success-field");
          } else {
            $(event.currentTarget)
              .removeClass("success-field")
              .addClass("error-field");
          }
        }
      });
  }

  GetBrands(BrandDetail: any) {
    let ValidBrands = [];
    if (this.commonService.IsValid(BrandDetail)) {
      let index = 0;
      while (index < BrandDetail.length) {
        ValidBrands.push({
          value: BrandDetail[index].BrandName,
          data: BrandDetail[index].BrandUid
        });
        index++;
      }
    }
    return ValidBrands;
  }

  GetCatagory(CatagoryDetail: any) {
    let ValidCatagory = [];
    if (this.commonService.IsValid(CatagoryDetail)) {
      let index = 0;
      while (index < CatagoryDetail.length) {
        ValidCatagory.push({
          value: CatagoryDetail[index].CatagoryName,
          data: CatagoryDetail[index].CatagoryUid
        });
        index++;
      }
    }
    return ValidCatagory;
  }

  GetVendor(VendorDetail: any) {
    let ValidVendors = [];
    if (this.commonService.IsValid(VendorDetail)) {
      let index = 0;
      while (index < VendorDetail.length) {
        ValidVendors.push({
          value:
            VendorDetail[index].FirstName + " " + VendorDetail[index].LastName,
          data: VendorDetail[index].CustomerUid
        });
        index++;
      }
    }
    return ValidVendors;
  }

  ClearAllFields() {
    let $Fields = document
      .getElementById("catagory-dv")
      .querySelectorAll('input[type="text"]');
    let $current = null;
    if ($Fields.length > 0) {
      let index = 0;
      while (index < $Fields.length) {
        $current = null;
        $current = $Fields[index];
        $current.value = "";
        index++;
      }
    }

    $("#Brand")
      .find('input[name="main-input"]')
      .val("");
    $("#Catagory")
      .find('input[name="main-input"]')
      .val("");
  }

  ValidateStocksForm(StockData) {
    let flag = true;
    let Errors = [];
    if (this.commonService.IsValid(StockData)) {
      if (!this.commonService.IsValidString(StockData["VendorUid"])) {
        flag = false;
        $("#Vendor")
          .find('input[name="iautofill-textfield"]')
          .css({
            border: "1px solid red !important",
            "border-right": "4px solid red  !important"
          });
      } else {
        $("#Vendor")
          .find('input[name="iautofill-textfield"]')
          .removeAttr("style");
      }

      if (!this.commonService.IsValidString(StockData["Brand"])) {
        flag = false;
        $("#Brand")
          .find('input[name="iautofill-textfield"]')
          .css({
            border: "1px solid red !important",
            "border-right": "4px solid red  !important"
          });
      } else {
        $("#Brand")
          .find('input[name="iautofill-textfield"]')
          .removeAttr("style");
      }

      if (!this.commonService.IsValidString(StockData["CatagoryUid"])) {
        flag = false;
        $("#Catagory")
          .find('input[name="iautofill-textfield"]')
          .css({
            border: "1px solid red !important",
            "border-right": "4px solid red  !important"
          });
      } else {
        $("#Catagory")
          .find('input[name="iautofill-textfield"]')
          .removeAttr("style");
      }

      if (!this.commonService.IsValidString(StockData["ItemName"])) {
        flag = false;
        $("#ItemName").removeClass("success-field");
      } else {
        $("#ItemName").addClass("success-field");
      }

      if (!this.commonService.IsValidString(StockData["Quantity"])) {
        flag = false;
        $("#Quantity").removeClass("success-field");
      } else {
        $("#Quantity").addClass("success-field");
      }

      if (!this.commonService.IsValidString(StockData["MRP"])) {
        flag = false;
        $("#MRP").removeClass("success-field");
      } else {
        $("#MRP").addClass("success-field");
      }
    }
  }

  AddCatagory() {
    let StockData = this.CatagoryData.value;
    if (this.commonService.IsValid(StockData)) {
      let VendorInfo = this.commonService.ReadAutoCompleteObject($("#Vendor"));
      if (VendorInfo.value !== "") {
        StockData["VendorUid"] = VendorInfo["data"];
      }

      let Brand = this.commonService.ReadAutoCompleteObject($("#Brand"));
      if (Brand.value !== "") {
        StockData["BrandUid"] = Brand["data"];
        StockData["Brand"] = Brand["value"];
      }

      let Catagory = this.commonService.ReadAutoCompleteObject($("#Catagory"));
      if (Catagory.value !== "") {
        StockData["CatagoryUid"] = Catagory["data"];
        StockData["Catagory"] = Catagory["value"];
      }

      StockData["StockUid"] = $("#StockUid")
        .val()
        .trim();

      let Keys = Object.keys(StockData);
      let IsValidForm = this.commonService.ValidateForm(Keys);
      this.ValidateStocksForm(StockData);
      if (IsValidForm == 0) {
        this.http.post("ItemAndGoods/AddEditStockItem", StockData).then(
          data => {
            if (this.commonService.IsValid(data)) {
              this.ClearAllFields();
              let Tables = Object.keys(data);
              if (
                Tables.indexOf("Catagory") !== -1 &&
                Tables.indexOf("Brands") !== -1 &&
                Tables.indexOf("Stocks") !== -1
              ) {
                this.storage.setByKey("Catagory", data["Catagory"]);
                this.storage.setByKey("Brands", data["Brands"]);
                this.storage.setByKey("Stocks", data["Stocks"]);
                this.commonService.ShowToast("Record inserted successfully");
                this.nav.navigate(ItemReport, null);
              } else {
                this.commonService.ShowToast(
                  "Data got inserted successfully but getting some problem. To resolve this please login again."
                );
              }
            } else {
              this.commonService.ShowToast(
                "Fail to insert data or getting some server error. Please contact to admin."
              );
            }
          },
          error => {
            console.log(JSON.stringify(error));
          }
        );
      }
    }
  }

  EnableCurrentFileterDiv() {
    let TargetEvent: any = event.currentTarget;
    $(TargetEvent)
      .closest("div")
      .find('div[name="dropdown"]')
      .removeClass("d-none");
    let width = $(TargetEvent).innerWidth() + "px";
    TargetEvent.closest("div").style.setProperty("--filter-width", width);
    $(TargetEvent)
      .closest("div")
      .find('input[name="search"]')
      .focus();
  }

  AllowNumber(e: any) {
    if (e.key === "." || e.key === "e" || e.key === "E") {
      event.preventDefault();
    }
  }
}
