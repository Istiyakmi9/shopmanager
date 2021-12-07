import { iNavigation } from "src/providers/iNavigation";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as $ from "jquery";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { CommonService, SearchRequest } from "../../providers/common-service/common.service";
import { AjaxService } from "src/providers/ajax.service";
import { ItemReport } from "src/providers/constants";
import { NgbCalendar, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: "app-catagory",
  templateUrl: "./catagory.component.html",
  styleUrls: ["./catagory.component.scss"]
})
export class CatagoryComponent implements OnInit {
  private IsEditPage: boolean = false;
  private PageObject: any = null;

  ExpireOn: NgbDateStruct;

  EditCurrentItem: any = null;

  BrandData: Array<any> = [];
  AutoFillCatagory: Array<any> = [];
  AutoFillVendor: Array<any> = [];
  catagoryForm: FormGroup = null;
  IsSelectMode: boolean = false;

  IsBlurEnabled: any = "";
  Item: any = {
    ItemName: "",
    SerialNumber: "",
    Quantity: "",
    MRP: "",
    ActualPrice: "",
    SellingPrice: "",
    StockUid: "",
    VendorUid: "",
    BrandName: ""
  };
  ItemCount: any;
  constructor(
    private storage: ApplicationStorage,
    private commonService: CommonService,
    private http: AjaxService,
    private nav: iNavigation,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private config: NgbInputDatepickerConfig
  ) {
    this.ExpireOn =  { 'year': 2021, 'month': 10, 'day': 11 };
    this.catagoryForm = this.fb.group({
      CatagoryUid: new FormControl(0, Validators.required),
      BrandUid: new FormControl(0),
      HSNNO: new FormControl(""),
      ItemName: new FormControl("", Validators.required),
      BrandName: new FormControl(""),
      SerialNumber: new FormControl(""),
      Quantity: new FormControl(""),
      MRP: new FormControl(""),
      ActualPrice: new FormControl(""),
      SellingPrice: new FormControl(""),
      StockUid: new FormControl(""),
      VendorUid: new FormControl(0),
      ExpiryDate: new FormControl("")
    });
  }

  ngOnInit() {
    this.InitPageData();
    let prevPageData = this.nav.getValue();
    if(prevPageData) {
      let pageData = JSON.parse(prevPageData.data);
      let form: SearchRequest = new SearchRequest();
      form.SearchString = ` 1=1 AND StockUid = ${pageData.StockUid}`;
      this.http.post("itemandgoods/GetProductByFilter", form).then(res => {
        if(res.responseBody) {
          pageData = res.responseBody[0];
          this.catagoryForm.get("CatagoryUid").setValue(pageData.CatagoryUid);
          this.catagoryForm.get("BrandUid").setValue(pageData.BrandUid);
          this.catagoryForm.get("HSNNO").setValue(pageData.HSNNO);
          this.catagoryForm.get("ItemName").setValue(pageData.ItemName);
          this.catagoryForm.get("BrandName").setValue(pageData.BrandName);
          this.catagoryForm.get("SerialNumber").setValue(pageData.SerialNumber);
          this.catagoryForm.get("Quantity").setValue(pageData.Quantity);
          this.catagoryForm.get("MRP").setValue(pageData.MRP);
          this.catagoryForm.get("ActualPrice").setValue(pageData.ActualPrice);
          this.catagoryForm.get("SellingPrice").setValue(pageData.SellingPrice);
          this.catagoryForm.get("StockUid").setValue(pageData.StockUid);
          this.catagoryForm.get("VendorUid").setValue(pageData.VendorUid);
          this.catagoryForm.get("ExpiryDate").setValue(pageData.ExipredDate);
        }
      });
    } else {
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
    }
    document.getElementById("ItemName").focus();
  }

  InitPageData() {
    this.BrandData = [{
      value: 0,
      text: 'Select Brand'
    }];
    
    this.AutoFillVendor = [{
      value: 0,
      text: 'Select Vendor'
    }];

    let Brands = this.storage.get(null, "brands");
    if(Brands) {
      this.IsSelectMode = true;
      let index = 0;
      while(index < Brands.length) {
        this.BrandData.push({
          text: Brands[index].BrandName,
          value: Brands[index].BrandUid
        });
        index++;
      }
    }

    let catagory = this.storage.get(null, "catagory");
    if(catagory) {
      let index = 0;
      this.AutoFillCatagory = [{ text: 'Catagory', value: 0 }];
      while(index < catagory.length) {
        this.AutoFillCatagory.push({
          text: catagory[index].CatagoryName,
          value: catagory[index].CatagoryUid
        });
        index++;
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

  AddCatagory() {
    let StockData = this.catagoryForm.value;
    if (this.catagoryForm.valid) {
      let errorCount = 0;
      if(this.catagoryForm.controls.CatagoryUid.errors != null){
        errorCount++;
      }

      if(this.catagoryForm.controls.ItemName.errors != null){
        errorCount++;
      } else {
        let data = this.catagoryForm.get("ItemName").value;
        this.catagoryForm.get("ItemName").setValue(data.toUpperCase());
      }

      let ExipredDate = new Date(`${this.ExpireOn.month}/${this.ExpireOn.day}/${this.ExpireOn.year}`);
      this.catagoryForm.get("ExpiryDate").setValue(ExipredDate);
      if (errorCount == 0) {
        this.http.post("itemandgoods/AddEditStockItem", StockData).then(
          data => {
            if (data.responseBody) {
              let Tables = Object.keys(data);
              if (Tables.indexOf("Brands") !== -1 && Tables.indexOf("Stocks") !== -1) {
                this.storage.setByKey("Brands", data["Brands"]);
                this.commonService.ShowToast("Record inserted successfully");
              } else {
                this.commonService.ShowToast(data.responseBody);
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
