import { iNavigation } from "src/providers/iNavigation";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { CommonService, SearchRequest } from "../../providers/common-service/common.service";
import { AjaxService } from "../../providers/ajax.service";
import * as $ from "jquery";
import { PageCache } from "src/providers/PageCache";
import { BillingPage } from "../../providers/constants";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { NgForm, FormGroup, FormBuilder, FormArray, FormControl, Validators } from "@angular/forms";

const MasterPageDetail = "MasterDetail";
@Component({
  selector: "app-billing",
  templateUrl: "./billing.component.html",
  styleUrls: ["./billing.component.scss"]
})
export class BillingComponent implements OnInit {
  StockObject: any = null;
  DynamicTableDetail: any;
  PageCachingData: any;
  StockBindingData: Array<any> = [{
    text: "Select Item",
    value: -1
  }];
  FilteredData: any;
  $Qnty: any;
  IGST: any;
  CGST: any;
  SGST: any;
  DescriptValue: string = "";
  IsDataReady: boolean = false;
  OtherTax: any = 0;
  LastKey: string = "";
  GrandAmount: number = 0.0;
  IsNewCustomer: boolean = false;
  CustomerDetail: Array<any> = [{
    text: "Select Customer",
    value: -1
  }];
  CustomerAadharDetail: Array<any> = [{
    text: "Customer by aadhar",
    value: -1
  }];;
  CustomerShopDetail: Array<any> = [{
    text: "Customer by shop detail",
    value: -1
  }];;
  AllowedKey = [8, 9, 32, 46, 42, 43, 45, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 187, 189, 56, 191];
  AllowedArthematicKey = ['*', '/', '+', '-'];
  ItemRows: any = [];
  Type: any = "no-style";
  BillingFormGroup: FormGroup;
  FieldClass: string = "grid-rows";
  IsValiidQuantity: boolean = false;
  FinalQuantity: number = 0;
  IsDeleted: boolean = false;
  SelectedStocks: Array<{}> = [];
  CurrentDescriptionTag: any = null;
  CurrentQuantityTag: any = null;
  CurrentAvailableQuantityTag: any = null;
  CurrentEventTag: any = null;
  AutoFillDropdownMode: string;
  PaidAmount: any;
  DueAmount: any;
  Grid: any;

  stockData: Array<any> = [];

  constructor(
    private commonService: CommonService,
    private http: AjaxService,
    private cache: PageCache,
    private storage: ApplicationStorage,
    private fb: FormBuilder,
    private nav: iNavigation
  ) {
    this.AutoFillDropdownMode = "on";
    this.BillingFormGroup = this.fb.group({
      VendorUid: new FormControl(""),
      Address: new FormControl(""),
      AadaharNo: new FormControl(""),
      GSTNo: new FormControl(""),
      Mobile: new FormControl(""),
      FullName: new FormControl(""),
      billingRows: this.InitBillingRows(10)
    });
  }

  get billingRows(): FormArray {
    let data = this.BillingFormGroup.get("billingRows") as FormArray;
    return data;
  }

  ngOnInit() {
    this.ReLoadMasterData();
  }

  ngAfterViewInit() {
    this.PaidAmount = $("#paidamount");
    this.DueAmount = $("#dueamount");
  }

  ReLoadMasterData() {
    this.IsDataReady = true;
    let data: SearchRequest = new SearchRequest();
    data.SearchString = "1=1";
    this.http.post("itemandgoods/GetStocks", data).then(
      response => {
        if (response.responseBody) {
          this.stockData = response.responseBody.rows;
          if (this.stockData) {
            this.StockBindingData = [{
              value: 0,
              text: "Stock Item"
            }];
            let index = 0;
            while (index < this.stockData.length) {
              this.StockBindingData.push({
                value: this.stockData[index]["StockUid"],
                text: this.stockData[index]["ItemName"]
              });
              index++;
            }
          }
        }

        this.loadInitData(response.responseBody["customers"]);
        this.GetTaxDetail();
        this.IsDataReady = true;
      },
      error => {
        this.commonService.ShowToast(
          "Unable to get master data. Your session is expired."
        );
      }
    );
  }

  AddMoreRows() {
    let BillingRow = this.BillingFormGroup.get("billingRows") as FormArray;
    BillingRow.push(this.GetRow());
  }

  DeleteRow() {
    alert("delete");
  }

  EditRow() {
    alert("edit");
  }

  GetRow(): FormGroup {
    let Row: FormGroup = this.fb.group({
      Quantity: new FormControl(""),
      Price: new FormControl(""),
      IGSTTax: new FormControl(""),
      SGSTTax: new FormControl(""),
      CGSTTax: new FormControl(""),
      Description: new FormControl(""),
      Product: new FormControl({ text: "Select Item", value: -1 }),
      TotalPrice: new FormControl("")
    });
    return Row;
  }

  InitBillingRows(RowCount: number): FormArray {
    let Row = [];
    let index = 0;
    while (index < RowCount) {
      Row.push(this.GetRow());
      index++;
    }
    return this.fb.array(Row);
  }

  loadInitData(customers: Array<any>) {
    if (customers) {
      let index = 0;
      while (index < customers.length) {
        this.CustomerDetail = [{
          text: `${customers[index].FirstName} ${customers[index].LastName}`,
          value: customers[index].CustomerUid
        }];
        index++
      }
    }

    this.IsDataReady = true;
    setTimeout(() => {
      this.Grid = $("#billing-body");
    }, 1000);
  }

  GetTaxDetail() {
    let MasterDetailData = this.storage.get("", MasterPageDetail);
    if (
      this.commonService.IsValid(MasterDetailData) &&
      MasterDetailData.length > 0
    ) {
      MasterDetailData.forEach(element => {
        if (element.TypeName === "igst") {
          this.IGST = element.TypeValue;
        } else if (element.TypeName === "cgst") {
          this.CGST = element.TypeValue;
        } else if (element.TypeName === "sgst") {
          this.SGST = element.TypeValue;
        }
      });
    }
  }

  PrepareDropdownData() {
    this.http.get("Master/PageMasterData").then(
      data => {
        this.storage.clear();
        this.storage.set(data);
        // this.StockBindingData = {
        //   data: [],
        //   placeholder: ""
        // };
        let BindingData = [];
        let index = 0;
        while (index < this.PageCachingData.length) {
          BindingData.push({
            value:
              this.PageCachingData[index].ItemName +
              " @[" +
              this.PageCachingData[index].BrandName +
              "]",
            data: {
              uid: this.PageCachingData[index].StockUid,
              quantity: this.PageCachingData[index].AvailableQuantity
            }
          });
          index++;
        }
        //this.StockBindingData["data"] = BindingData;
      },
      error => {
        this.commonService.ShowToast("Unable to fetch Master Data");
      }
    );
  }

  GetGstDetail(StockUid: string) {
    let MasterDetailData = this.storage.get("", "MasterDetail");
    let StockDetail = this.storage.get("", "Stocks");
    if (StockDetail !== null && StockDetail.length > 0) {
      let CurrentStock = StockDetail.filter(x => x.StockUid === StockUid);
      if (CurrentStock.length > 0) {
        CurrentStock = CurrentStock[0];
        if (this.commonService.IsValid(MasterDetailData)) {
          let CurrentAppliedTaxObject = MasterDetailData.filter(
            x => x.CatagoryUid === CurrentStock.CatagoryUid
          );
          if (CurrentAppliedTaxObject.length > 0) {
            let CurrentTaxRows = [];
            let CurrentTaxObject = {};
            CurrentTaxRows = CurrentAppliedTaxObject.filter(
              x => x.TypeName === "IGST"
            );
            if (CurrentTaxRows.length > 0) {
              CurrentTaxObject = CurrentTaxRows[0];
              this.CurrentEventTag.find('div[name="igst-col"]')
                .find("input")
                .val(CurrentTaxObject["TypeValue"]);
            }

            CurrentTaxRows = [];
            CurrentTaxObject = {};
            CurrentTaxRows = CurrentAppliedTaxObject.filter(
              x => x.TypeName === "SGST"
            );
            if (CurrentTaxRows.length > 0) {
              CurrentTaxObject = CurrentTaxRows[0];
              this.CurrentEventTag.find('div[name="sgst-col"]')
                .find("input")
                .val(CurrentTaxObject["TypeValue"]);
            }

            CurrentTaxRows = [];
            CurrentTaxObject = {};
            CurrentTaxRows = CurrentAppliedTaxObject.filter(
              x => x.TypeName === "CGST"
            );
            if (CurrentTaxRows.length > 0) {
              CurrentTaxObject = CurrentTaxRows[0];
              this.CurrentEventTag.find('div[name="cgst-col"]')
                .find("input")
                .val(CurrentTaxObject["TypeValue"]);
            }
          }
        }
      }
    }
  }

  GetCurrentItemQuantity(): number {
    let AvailabeItems: number = -1;
    let CurrentAvailableQuantity = this.CurrentEventTag.attr("qt");
    if (CurrentAvailableQuantity !== null && CurrentAvailableQuantity !== "") {
      try {
        AvailabeItems = parseInt(CurrentAvailableQuantity);
        if (isNaN(AvailabeItems)) {
          AvailabeItems = -1;
        }
      } catch (e) {
        AvailabeItems = -1;
      }
    }
    return AvailabeItems;
  }

  DeepCalculation(TotalQuantityAvailable: number) {
    let Quantity: number = this.FinalQuantity;
    let RemaningQuantity: number = 0;
    if (this.IsDeleted) {
      if (this.FinalQuantity >= 0) {
        RemaningQuantity = TotalQuantityAvailable - this.FinalQuantity;
        if (RemaningQuantity < 0) {
          this.commonService.ShowToast(
            "Stock availability and user input is not matching. Please contact to admin."
          );
          return null;
        }
      }
    } else {
      if (this.FinalQuantity <= TotalQuantityAvailable) {
        RemaningQuantity = TotalQuantityAvailable - this.FinalQuantity;
        if (RemaningQuantity < 0) {
          this.commonService.ShowToast(
            "Stock availability and user input is not matching. Please contact to admin."
          );
          return null;
        }
      }
    }

    this.CurrentAvailableQuantityTag.text(RemaningQuantity);
    let TotalPrice = Quantity * this.StockObject.SellingPrice;
    this.CalculateAllGstTaxes(TotalPrice);
    this.CalculateTotalAmount();
  }

  CalculateTotalAmount() {
    this.GrandAmount = 0;
    let $TotalItems = this.Grid.find('tr[active="true"]').find(
      'div[name="grandprice"] > input'
    );
    let index = 0;
    let CurrentAmount = 0;
    while (index < $TotalItems.length) {
      CurrentAmount = parseFloat($TotalItems[index].value);
      if (isNaN(CurrentAmount)) CurrentAmount = 0;
      this.GrandAmount += CurrentAmount;
      index++;
    }
    this.PaidAmount.val("");
    this.DueAmount.val("");
  }

  CalculateAllGstTaxes(TotalAmount: any) {
    try {
      let Amount = parseFloat(parseFloat(TotalAmount).toFixed(2));
      let IGSTValue = 0;
      let SGSTValue = 0;
      let CGSTValue = 0;

      if (this.CurrentEventTag !== null) {
        let CurrentIGST = this.CurrentEventTag.find(
          'div[name="igst-col"] > input'
        ).val();
        let CurrentSGST = this.CurrentEventTag.find(
          'div[name="sgst-col"] > input'
        ).val();
        let CurrentCGST = this.CurrentEventTag.find(
          'div[name="cgst-col"] > input'
        ).val();

        this.CurrentEventTag.find('div[name="taxamount"] > input').val(Amount);
        let $CurrentGrandAmount = this.CurrentEventTag.find(
          'div[name="grandprice"] > input'
        );

        try {
          IGSTValue = parseFloat(parseFloat(CurrentIGST).toFixed(2));
          SGSTValue = parseFloat(parseFloat(CurrentSGST).toFixed(2));
          CGSTValue = parseFloat(parseFloat(CurrentCGST).toFixed(2));

          let TaxAmount = 0;
          if (IGSTValue > 0) {
            TaxAmount += parseFloat(
              parseFloat(((Amount * IGSTValue) / 100).toFixed(2)).toFixed(2)
            );
          }

          if (SGSTValue > 0) {
            TaxAmount += parseFloat(
              parseFloat(((Amount * SGSTValue) / 100).toFixed(2)).toFixed(2)
            );
          }

          if (CGSTValue > 0) {
            TaxAmount += parseFloat(
              parseFloat(((Amount * CGSTValue) / 100).toFixed(2)).toFixed(2)
            );
          }

          this.CurrentEventTag.find('div[name="taxamount"] > input').val(
            TaxAmount
          );
          if (TaxAmount > 0) {
            $CurrentGrandAmount.val(TaxAmount + Amount);
          } else {
            $CurrentGrandAmount.val(Amount);
          }
        } catch (e) {
          this.commonService.ShowToast(
            "Getting error on tax calculation. Please contact to admin."
          );
        }
      }
    } catch (e) {
      this.commonService.ShowToast(
        "Getting error on tax calculation. Please contact to admin."
      );
    }
  }

  CleanupDisSelected($elem: any) {
    $elem.closest("td").attr("uid", "");
  }

  ScrollToAvailableRow(Record: any) {
    let SelectedRow = $(this.Grid).find(
      'td[uid="' + Record["data"]["uid"] + '"]'
    );
    if (
      this.commonService.IsValid(Record) &&
      this.commonService.IsValidString(Record["index"]) &&
      this.commonService.IsValid(SelectedRow)
    ) {
      let CurrentRowIndex = SelectedRow.closest("tr").attr("index");
      if (this.commonService.IsValidString(CurrentRowIndex)) {
        if (Record.index === CurrentRowIndex) {
          SelectedRow.closest("tr")
            .find('div[name="quantity"] > input')
            .focus();
        } else {
          let $workingcell = $(event.currentTarget)
            .closest("td")
            .find('input[name="iautofill-textfield"]');

          this.commonService.Scrollto("content-body", SelectedRow);
          $workingcell.val("");
          $workingcell.attr("data", "");
          SelectedRow.closest("tr")
            .find('div[name="quantity"] > input')
            .focus();
          SelectedRow.closest("tr").addClass("marked-active");
          this.commonService.ShowToast("Already selected.");
          setTimeout(() => {
            SelectedRow.closest("tr").removeClass("marked-active");
          }, 2000);
        }
      }
    }
  }

  HandleCurrentEvent(Record: any) {
    let $Row = this.CurrentEventTag.attr("uid", Record["data"]["uid"]);
    $Row.find('div[name="quantity"] > input').val("");
    $Row.find('input[name="Description"]').val("");
    this.CurrentEventTag.attr("active", "true");
    let Text = Record.value;
    let Uid = Record["data"]["uid"];
    this.GetGstDetail(Uid);
    this.InitOtherFileds(Text, Uid);
  }

  HandleAutofillData($event: any) {
    this.CurrentEventTag = $(event.currentTarget).closest("tr");
    if (this.CurrentEventTag !== null && this.commonService.IsValid($event)) {
      this.CurrentAvailableQuantityTag = this.CurrentEventTag.find(
        'small[name="availablequantity"]'
      );
      this.CurrentDescriptionTag = this.CurrentEventTag.find(
        'input[name="Description"]'
      );
      this.CurrentQuantityTag = this.CurrentEventTag.find(
        'input[name="QuantityField"]'
      );
      this.PageCachingData = this.cache.get("Stocks");
      let Record = $event;
      Record = JSON.parse(Record);
      //let CurrentRowIndex = this.CurrentEventTag.attr("index");
      let CurrentItemQuantity = 0;
      if (
        Record["data"]["quantity"] !== null &&
        Record["data"]["quantity"] !== ""
      )
        CurrentItemQuantity = Record["data"]["quantity"];
      this.CurrentEventTag.attr("qt", CurrentItemQuantity);
      if (this.commonService.IsValid(Record)) {
        if (Record !== null && this.commonService.IsValid(Record["data"])) {
          this.HandleCurrentEvent(Record);
        } else {
          this.commonService.ShowToast(
            "Selected stock is invalid. Please contact to admin."
          );
        }
      } else {
        this.CleanupDisSelected($(event.currentTarget));
      }
    } else {
      this.commonService.ShowToast("Item not selected properly.");
    }
  }

  InitOtherFileds(Text: string, Uid: string) {
    let CurrentAvailableQuantity = this.GetCurrentItemQuantity();
    if (Uid !== null && Uid !== "" && CurrentAvailableQuantity !== -1) {
      this.StockObject = null;
      if (
        $(event.currentTarget)
          .closest("td")
          .next("td").length > 0
      ) {
        $(event.currentTarget)
          .closest("td")
          .next("td")
          .find("input")
          .focus();
      }
      this.CurrentEventTag.find('input[name="Catagory"]').val(Uid);
      if (this.PageCachingData.length > 0) {
        let index = 0;
        while (index < this.PageCachingData.length) {
          if (this.PageCachingData[index].StockUid == Uid) {
            this.StockObject = this.PageCachingData[index];
            this.GetTaxes(this.PageCachingData[index].CatagoryUid);
            this.CurrentEventTag.find('div[name="price"] > input').val(
              this.StockObject.SellingPrice
            );

            this.CurrentAvailableQuantityTag.text(CurrentAvailableQuantity);
            this.CurrentEventTag.find('div[name="taxamount"] > input').val("");
            this.CurrentQuantityTag.val("");
            break;
          }
          index++;
        }
      } else {
        this.EmptryOtherFields();
      }
    } else {
      this.commonService.ShowToast(
        "Selected Stock is not available. Please contact admin"
      );
    }
  }

  GetTaxes(CatagoryUid: string) {
    let MasterDetailData = this.storage.get("", "MasterDetail");
    if (this.commonService.IsValid(MasterDetailData)) {
      let CurrentAppliedTaxObject = MasterDetailData.filter(
        x => x.CatagoryUid === CatagoryUid
      );
      if (CurrentAppliedTaxObject.length > 0) {
      }
    }
  }

  EmptryOtherFields() {
    this.CurrentEventTag.find('div[name="discount"] > input').val("");
    this.CurrentEventTag.find('div[name="price"] > input').val("");
    this.CurrentEventTag.find('div[name="taxamount"] > input').val("");
    this.CurrentAvailableQuantityTag.text("");
    this.CurrentQuantityTag.val("");
  }

  AllowMoney(e: any) {
    if (!this.commonService.IsMoney(e.key) && e.key !== "Backspace") {
      event.preventDefault();
    } else {
      let EnteredAmount = 0;
      if (e.key === "Backspace") {
        let AmountLeft = $(event.currentTarget).val();
        if (AmountLeft != null && AmountLeft !== "") {
          if (AmountLeft.length === 1) {
            EnteredAmount = 0;
          } else {
            EnteredAmount = parseFloat(
              AmountLeft.substr(0, AmountLeft.length - 1)
            );
          }
        }
      } else {
        EnteredAmount = parseFloat($(event.currentTarget).val() + e.key);
      }
      try {
        let Price = parseFloat(this.GrandAmount.toString());
        let DueAmount = parseFloat((Price - EnteredAmount).toFixed(2));
        if (EnteredAmount > Price) {
          event.preventDefault();
        } else {
          $("#dueamount").val(DueAmount);
        }
      } catch (e) {
        this.commonService.ShowToast("Invalid grand amount.");
      }
    }
  }

  CalculateOtherAmount() {
    let AmountCalculation = {};
    let PaidAmount = this.PaidAmount.val();
    let DueAmount = this.DueAmount.val();
    if (
      PaidAmount != null &&
      PaidAmount != "" &&
      DueAmount != null &&
      DueAmount != ""
    ) {
      PaidAmount = parseFloat(PaidAmount);
      DueAmount = parseFloat(DueAmount);
      let Total = parseFloat((PaidAmount + DueAmount).toFixed(2));
      if (this.GrandAmount != null && this.GrandAmount != 0) {
        let GrandCalculatedAmount = parseFloat(this.GrandAmount.toString());
        if (Total == GrandCalculatedAmount) {
          AmountCalculation["PaidAmount"] = PaidAmount;
          AmountCalculation["DueAmount"] = DueAmount;
          AmountCalculation["GrandAmount"] = GrandCalculatedAmount;
        } else {
          AmountCalculation = null;
          this.commonService.ShowToast(
            "Grand total amount not equal to Paid amount + Due amount"
          );
        }
      } else {
        AmountCalculation = null;
        this.commonService.ShowToast(
          "Grand total amount is 0. Please contact to Admin."
        );
      }
    } else {
      AmountCalculation = null;
      this.commonService.ShowToast("Paid amount and Due amount is missing.");
    }
    return AmountCalculation;
  }

  HandleTabs() {
    let Type = $(event.currentTarget).attr("name");
    $("#newcustomer").hide();
    $("#existingcustomer").hide();
    if (Type === "customer") {
      this.IsNewCustomer = false;
      $("#newcustomer").fadeIn();
    } else {
      this.IsNewCustomer = true;
      $("#existingcustomer").fadeIn();
    }
  }

  EnableField() {
    $(event.currentTarget).removeAttr("style");
  }

  SubmitSoldItems() {
    let ErrorMessage = "";
    let StorageStocks = this.storage.get(null, "Stocks");
    let StorageCatagory = this.storage.get(null, "Catagory");
    let BillingObject = [];
    let elem = null;
    let price = "";
    let quantity = "";
    let discount = "";
    let totalprice = "";
    let itemuid = null;
    let itemtext = null;
    let taxAmount = 0;
    let desc = "";
    let igst = 0;
    let cgst = 0;
    let sgst = 0;
    let Customer = null;
    let IsValidData = false;
    let ServerCustomerDetail = {};
    let CalculatedDetail = this.CalculateOtherAmount();
    if (CalculatedDetail != null) {
      if (!this.IsNewCustomer) {
        let $CustomerByName = $("#CustomerByName");
        if ($CustomerByName !== null) {
          Customer = $CustomerByName
            .find('input[name="iautofill-textfield"]')
            .attr("data");
          if (this.commonService.IsValid(Customer)) {
            Customer = JSON.parse(Customer);
            ServerCustomerDetail["CustomerUid"] = Customer;
            IsValidData = true;
          } else {
            this.commonService.ShowToast(
              "Please select customer detail in customer tab."
            );
            $("#content-body").animate({ scrollTop: 0 }, "slow");
          }
        }
      } else {
        IsValidData = true;
        let ErrorNames = [];
        if ($("#FullName").val() !== null && $("#FullName").val() !== "")
          ServerCustomerDetail["FullName"] = $("#FullName").val();
        else ErrorNames.push("FullName");

        if ($("#MobileNo").val() !== null && $("#MobileNo").val() !== "")
          ServerCustomerDetail["MobileNo"] = $("#MobileNo").val();
        ServerCustomerDetail["GSTNo"] = $("#GSTNo").val();
        ServerCustomerDetail["AadaharNo"] = $("#AadaharNo").val();
        ServerCustomerDetail["Address"] = $("#Address").val();
        if (ErrorNames.length > 0) {
          IsValidData = false;
          ErrorNames.forEach((value, index) => {
            $("#" + value).css({ border: "1px solid red" });
          });
          this.commonService.ShowToast(
            "Please fill the red bordered detail of customer."
          );
          $("#content-body").animate({ scrollTop: 0 }, "slow");
        } else {
          this.commonService.ShowToast(
            "Please fill customer detail in customer tab."
          );
        }
      }

      if (IsValidData) {
        let CurrentCatagoryItem = null;
        let Rows = document
          .getElementById("billtable")
          .querySelectorAll('tr[name="item-record"]');
        if (Rows.length > 0) {
          let RowIndex = 0;
          let ItemIndex = 0;
          while (RowIndex < Rows.length) {
            elem = Rows[RowIndex];
            price = $(elem)
              .find('div[name="price"] > input')
              .val();
            quantity = $(elem)
              .find('div[name="quantity"] > input')
              .val();
            discount = "0";
            totalprice = $(elem)
              .find('div[name="grandprice"] > input')
              .val();
            igst = $(elem)
              .find('div[name="igst-col"] > input')
              .val();
            sgst = $(elem)
              .find('div[name="sgst-col"] > input')
              .val();
            cgst = $(elem)
              .find('div[name="cgst-col"] > input')
              .val();
            itemuid = $(elem)
              .find('input[name="iautofill-textfield"]')
              .attr("data");
            if (this.commonService.IsValid(itemuid)) {
              itemuid = JSON.parse(itemuid);
              if (StorageStocks !== null) {
                let CurrentStockItem = StorageStocks.filter(
                  x => x.StockUid === itemuid.uid
                );
                if (CurrentStockItem.length > 0) {
                  CurrentStockItem = CurrentStockItem[0];
                  if (StorageCatagory !== null) {
                    CurrentCatagoryItem = StorageCatagory.filter(
                      x => x.CatagoryUid === CurrentStockItem.CatagoryUid
                    );
                    if (CurrentCatagoryItem.length > 0) {
                      CurrentCatagoryItem = CurrentCatagoryItem[0];
                    }
                  }
                }
              }
            }
            taxAmount = $(elem)
              .find('div[name="taxamount"] > input')
              .val();
            itemtext = $(elem)
              .find('input[name="iautofill-textfield"]')
              .val();
            desc = $(elem)
              .find('input[name="Description"]')
              .val();

            if (itemtext !== "") {
              let qty = parseInt(quantity);
              if (isNaN(qty) || qty === 0) {
                ErrorMessage = `Invalid quantity for item [${itemtext}]`;
                this.commonService.ShowToast(ErrorMessage);
                return;
              }
            }
            if (
              price != null &&
              price !== "" &&
              discount != null &&
              discount !== "" &&
              totalprice != null &&
              totalprice !== "" &&
              itemuid != null &&
              itemuid !== undefined &&
              itemuid !== null &&
              itemuid.uid !== null &&
              itemtext !== null &&
              itemtext !== "" &&
              CurrentCatagoryItem !== null
            ) {
              BillingObject.push({
                Index: ItemIndex,
                Item: itemtext,
                StockUid: itemuid.uid,
                InVoiceNo: "",
                Quantity: quantity,
                Price: price,
                Dicsount: discount,
                TotalPrice: totalprice,
                TaxAmount: taxAmount,
                AmountPaid: CalculatedDetail["PaidAmount"],
                AmountDue: CalculatedDetail["DueAmount"],
                IGST: igst,
                SGST: sgst,
                CGST: cgst,
                Description: desc,
                CatagoryName: CurrentCatagoryItem.CatagoryName,
                CatagoryDescription: CurrentCatagoryItem.Description
              });
            }

            elem = null;
            price = "";
            quantity = "";
            discount = "";
            totalprice = "";
            itemuid = { uid: "", quantity: 0 };
            itemtext = "";
            RowIndex++;
            ItemIndex++;
            desc = "";
            CurrentCatagoryItem = null;
          }

          if (BillingObject.length > 0) {
            let FinalSubmitingData = {
              soldItemRecords: BillingObject,
              registrationModel: ServerCustomerDetail
            };

            this.http.post("Goods/InsertMultiItems", FinalSubmitingData).then(
              response => {
                if (this.commonService.IsValid(response)) {
                  let BillingDetail = response;
                  this.commonService.ShowToast(
                    "Successfully done & Bill generated."
                  );
                  this.nav.navigate(BillingPage, BillingDetail);
                } else {
                  this.commonService.ShowToast(
                    "Fail to insert data. Please contact admin."
                  );
                }
              },
              error => {
                this.commonService.ShowToast(
                  "Server error. Please contact admin."
                );
              }
            );
          }
        }
      }
    }
  }

  ShowDescription($target: any) {
    let Uid = $target.attr("uid");
    let $workingObject = this.PageCachingData.filter(x => x.StockUid == Uid);
    if ($workingObject.length > 0) {
      $workingObject = $workingObject[0];
      $("#description").text("NA");
      $("#brand").text($workingObject.BrandName);
      $("#serialno").text($workingObject.SerialNumber);
    }
  }

  // HandleAutoClose() {
  //   window.addEventListener("click", (e: any) => {
  //     let AutoFillDropdown = document.querySelectorAll(
  //       'div[name="parent-select"]'
  //     );
  //     let index = 0;
  //     while (index < AutoFillDropdown.length) {
  //       if (!AutoFillDropdown[index].contains(e.target)) {
  //         $(AutoFillDropdown[index])
  //           .find('div[name="dropdown"]')
  //           .addClass("d-none");
  //       }
  //       index++;
  //     }
  //   });
  // }

  CalculateDescription(DescValue: string): number {
    let ActualValue: number = 0;
    if (DescValue != null) {
      let Items = DescValue.split("+");
      if (Items.length > 0) {
        let index = 0;
        let multipledData = 0;
        try {
          while (index < Items.length) {
            multipledData = 0;
            if (Items[index].indexOf("*") !== -1) {
              let values = Items[index].split("*");
              if (values.length > 1) {
                let innerIndex = 0;
                multipledData = 1;
                while (innerIndex < values.length) {
                  if (values[innerIndex] !== "")
                    multipledData *= parseInt(values[innerIndex]);
                  innerIndex++;
                }
              }
            }
            if (multipledData == 0 && Items[index] !== "")
              ActualValue += parseInt(Items[index]);
            else ActualValue += multipledData;
            index++;
          }
        } catch (e) {
          this.commonService.ShowToast("Description is not in correct format.");
        }
      }
    }
    if (!isNaN(ActualValue)) {
      this.$Qnty.val(ActualValue);
      this.CalculateTotalAmount();
    } else {
      ActualValue = 0;
    }
    return ActualValue;
  }

  BindStockData(e: any) {
    if (e) {
      let currentItem = this.stockData.find(x => x.StockUid == e.value);
      if (currentItem) {

      }
    }
  }

  AllowDescription(e: any) {
    if (this.AllowedKey.indexOf(e.which) == -1) {
      e.preventDefault();
    }
  }

  VerifyDescription(e: any) {
    let value = e.target.value + e.key;
    if (this.AllowedArthematicKey.indexOf(value) != -1) {
      e.preventDefault();
    } else {

    }
    // if (e.which < 58) {
    //   if (e.which === 32 || e.which === 43) {
    //     value = "+";
    //     if (this.LastKey === "*" || this.LastKey === "+") {
    //       event.preventDefault();
    //       return false;
    //     }
    //     this.LastKey = "+";
    //   } else if (e.which === 42 || e.which === 46) {
    //     value = "*";
    //     if (this.LastKey === "*" || this.LastKey === "+") {
    //       event.preventDefault();
    //       return false;
    //     }
    //     this.LastKey = "*";
    //   }

    //   if (value !== "") {
    //     if (
    //       $(event.currentTarget)
    //         .val()
    //         .trim().length > 0
    //     ) {
    //       this.DescriptValue = $(event.currentTarget).val() + value;
    //     } else {
    //       event.preventDefault();
    //       return false;
    //     }
    //   } else if (e.which % 48 >= 0 && e.which % 48 <= 9) {
    //     this.LastKey = e.key;
    //     this.DescriptValue = $(event.currentTarget).val() + e.key;
    //     ActualAmount = this.CalculateDescription(this.DescriptValue);
    //   }

    //   $(event.currentTarget).val(this.DescriptValue);
    //   if (
    //     ActualAmount !== 0 &&
    //     this.DescriptValue !== null &&
    //     this.DescriptValue !== ""
    //   ) {
    //     this.IsValiidQuantity = true;
    //     this.CalculateRate();
    //   }
    // }
    return true;
  }

  // --------------------------------------------------------   OLD CODE -------------------------------------

  VerifyDescriptionInput(e: any) {
    if (!this.commonService.IsNumeric(e.key)) {
      this.IsValiidQuantity = false;
      this.IsDeleted = false;
      if (this.AllowedKey.indexOf(e.which) !== -1) {
        if ($(event.currentTarget).val() !== "") {
          if (this.LastKey === "*" || this.LastKey === "+") {
            this.LastKey = "";
          }
          let LeftItem = $(event.currentTarget)
            .val()
            .substr(0, $(event.currentTarget).val().length - 1);
        }
        if (e.which === 8 || e.which === 46) {
          this.IsValiidQuantity = true;
          this.IsDeleted = true;
        }
      }
    } else {
      try {
        let TotalQuantity = parseInt($(event.currentTarget).val() + e.key);
        let CurrentAvailableQuantity = this.GetCurrentItemQuantity();
        if (TotalQuantity <= CurrentAvailableQuantity) {
          this.IsDeleted = true;
          if (e.which !== 8 && e.which !== 46) this.IsDeleted = false;
          this.IsValiidQuantity = true;
        } else {
          this.IsValiidQuantity = false;
          this.commonService.ShowToast(
            "Your requested quantity is more than the available quantity."
          );
          event.preventDefault();
        }
      } catch (e) {
        console.log("Getting error for ParseInt() in VerifyInput");
        this.IsValiidQuantity = false;
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }
  }

  HandleDescription(e: any) {
    let value = "";
    let ActualAmount: number = 0;
    event.preventDefault();
    if (e.which < 58) {
      if (e.which === 32 || e.which === 43) {
        value = "+";
        if (this.LastKey === "*" || this.LastKey === "+") {
          event.preventDefault();
          return false;
        }
        this.LastKey = "+";
      } else if (e.which === 42 || e.which === 46) {
        value = "*";
        if (this.LastKey === "*" || this.LastKey === "+") {
          event.preventDefault();
          return false;
        }
        this.LastKey = "*";
      }

      if (value !== "") {
        if (
          $(event.currentTarget)
            .val()
            .trim().length > 0
        ) {
          this.DescriptValue = $(event.currentTarget).val() + value;
        } else {
          event.preventDefault();
          return false;
        }
      } else if (e.which % 48 >= 0 && e.which % 48 <= 9) {
        this.LastKey = e.key;
        this.DescriptValue = $(event.currentTarget).val() + e.key;
        ActualAmount = this.CalculateDescription(this.DescriptValue);
      }

      $(event.currentTarget).val(this.DescriptValue);
      if (
        ActualAmount !== 0 &&
        this.DescriptValue !== null &&
        this.DescriptValue !== ""
      ) {
        this.IsValiidQuantity = true;
        this.CalculateRate();
      }
    }
    return true;
  }

  ManageDescription(e: any) {
    if (e.which === 8 || e.which === 46) {
      let ActualAmount: number = 0;
      if (this.LastKey === "*" || this.LastKey === "+") {
        this.LastKey = "";
      }
      ActualAmount = this.CalculateDescription($(event.currentTarget).val());
      this.CalculateRate();
    }
  }

  // PrepareBinding() {
  //   this.CurrentEventTag = $(event.currentTarget).closest("tr");
  //   this.CurrentQuantityTag = this.CurrentEventTag.find(
  //     'input[name="QuantityField"]'
  //   );
  //   this.$Qnty = $(event.currentTarget)
  //     .closest("tr")
  //     .find('div[name="quantity"]')
  //     .find('input[type="text"]');
  // }

  CalculateRate() {
    let CurrentAvailableQuantity: number = this.GetCurrentItemQuantity();
    if (CurrentAvailableQuantity !== -1) {
      try {
        if (this.IsValiidQuantity && this.FinalQuantity >= 0) {
          if (
            this.CurrentQuantityTag != null &&
            this.CurrentQuantityTag.val() !== ""
          ) {
            try {
              this.FinalQuantity = parseInt(this.CurrentQuantityTag.val());
              this.DeepCalculation(CurrentAvailableQuantity);
            } catch (e) {
              this.commonService.ShowToast(
                "CalculateRate(): parseInt() throws error."
              );
            }
          } else {
            this.FinalQuantity = 0;
            this.DeepCalculation(CurrentAvailableQuantity);
            event.preventDefault();
          }
        }
      } catch (e) {
        this.commonService.ShowToast(
          "Available quantity is not enough. Please select item properly."
        );
      }
    } else {
      this.commonService.ShowToast("Invalid available quantity.");
    }
  }

  // EnableCurrentRow() {
  //   this.CurrentEventTag = $(event.currentTarget).closest("tr");
  //   this.CurrentQuantityTag = this.CurrentEventTag.find(
  //     'input[name="QuantityField"]'
  //   );
  // }

  VerifyInput(e: any) {
    if (!this.commonService.IsNumeric(e.key)) {
      this.IsValiidQuantity = false;
      this.IsDeleted = false;
      if (this.AllowedKey.indexOf(e.which) !== -1) {
        if (e.which === 8 || e.which === 46) {
          this.IsValiidQuantity = true;
          this.IsDeleted = true;
        }
      } else {
        event.preventDefault();
      }
    } else {
      try {
        let TotalQuantity = parseInt($(event.currentTarget).val() + e.key);
        let CurrentAvailableQuantity = this.GetCurrentItemQuantity();
        if (TotalQuantity <= CurrentAvailableQuantity) {
          this.IsDeleted = true;
          if (e.which !== 8 && e.which !== 46) this.IsDeleted = false;
          this.IsValiidQuantity = true;
        } else {
          this.IsValiidQuantity = false;
          this.commonService.ShowToast(
            "Your requested quantity is more than the available quantity."
          );
          event.preventDefault();
        }
      } catch (e) {
        console.log("Getting error for ParseInt() in VerifyInput");
        this.IsValiidQuantity = false;
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }
  }
}
