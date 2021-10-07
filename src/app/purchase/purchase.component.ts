import { Purchases, AddItems } from "./../../providers/constants";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { CommonService } from "../../providers/common-service/common.service";
import { AjaxService } from "../../providers/ajax.service";
import { PageCache } from "src/providers/PageCache";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { Dictionary } from "./../../providers/Generic/Code/Dictionary";
import { iNavigation } from "./../../providers/iNavigation";
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl
} from "@angular/forms";

declare var $:any;

@Component({
  selector: "app-purchase",
  templateUrl: "./purchase.component.html",
  styleUrls: ["./purchase.component.scss"]
})
export class PurchaseComponent implements OnInit {
  PageCachingData: any;
  PurchasedTotalPrice: number = 0.0;
  StockBindingData: any = {
    data: [],
    placeholder: "No data available"
  };
  IsDataReady: boolean = false;
  OtherTax: any = 0;
  GrandAmount: number = 0.0;
  CustomerDefaultSelection: any;
  TaxField: any;
  TotalAmountField: any;
  CustomerDetail: any = {
    data: [],
    placeholder: "No data available"
  };
  AllowedKey = [8, 46, 9];
  ItemRows: any = [];
  Type: any = "no-style";
  BillingFormGroup: any;
  FieldClass: string = "noStyle";
  Grid: any;
  DescriptValue: string = "";
  LastKey: string = "";

  purchaseFormGroup: FormGroup = this.fb.group({});
  itemDetail: FormArray;
  $Qnty: any;
  Items: Dictionary<string, number>;
  IsPurchasePage: boolean = false;
  NoOfRows: number;
  CurrentIGSTTax: number = 0;
  CurrentSGSTTax: number = 0;
  CurrentCGSTTax: number = 0;
  CurrentItemActualPrice: number = 0;

  constructor(
    private commonService: CommonService,
    private http: AjaxService,
    private cache: PageCache,
    private nav: iNavigation,
    private storage: ApplicationStorage,
    private fb: FormBuilder
  ) {
    this.NoOfRows = 15;
    if (this.commonService.GetCurrentPageName() === Purchases) {
      this.IsPurchasePage = true;
      this.NoOfRows = 10;
    }
    this.ReLoadMasterData();
    this.Items = new Dictionary<string, number>();
  }

  BindDynamicGrid() {
    this.purchaseFormGroup = this.fb.group({
      OtherDetail: this.fb.group({
        TransportName: new FormControl(""),
        VehicleNo: new FormControl(""),
        PaidAmount: new FormControl(""),
        DueAmount: new FormControl("")
      }),
      CustomerDetail: this.fb.group({
        CustomerUid: new FormControl(""),
        ShopName: new FormControl(""),
        BillNo: new FormControl("", Validators.required)
      }),
      GridDetail: this.fb.array(
        this.BillingFormGroup.map((x, index) =>
          this.fb.group({
            ItemName: new FormControl(""),
            Description: new FormControl(""),
            Quantity: new FormControl(""),
            TaxAmount: new FormControl(""),
            TotalAmount: new FormControl(""),
            BrandName: new FormControl(""),
            Price: new FormControl(""),
            SellingPrice: new FormControl(""),
            ActualPrice: new FormControl(""),
            Qty: new FormControl("")
          })
        )
      )
    });
  }

  HighlightErrorRow($rows) {
    if ($rows !== null) {
      $($rows)
        .find('td[name="table-index"]')
        .addClass("highlight-row");
      $($rows)
        .find('input[name="Price"]')
        .closest("td")
        .addClass("highlight-cell");

      $($rows)
        .find('input[name="Quantity"]')
        .focus();
    }
  }

  RemoveErrorHighlight($rows) {
    if ($rows !== null) {
      $($rows)
        .find('td[name="table-index"]')
        .removeClass("highlight-row");

      $($rows)
        .find('input[name="Quantity"]')
        .closest("td")
        .removeClass("highlight-cell");

      $($rows)
        .find('input[name="Price"]')
        .closest("td")
        .removeClass("highlight-cell");
    }
  }

  TableValidationCheck() {
    let $validrows = $("#billtable").find('tr[isvalid="true"]');
    let ErrorMessagge = "";
    if ($validrows !== null && $validrows.length > 0) {
      let index = 0;
      let $rows: any = null;
      while (index < $validrows.length) {
        $rows = $validrows[index];
        if (
          $($rows)
            .find('input[name="Price"]')
            .val() === ""
        ) {
          ErrorMessagge += "Price, ";
          this.HighlightErrorRow($rows);
        }
        if (
          $($rows)
            .find('input[name="Quantity"]')
            .val() === ""
        ) {
          ErrorMessagge += "Quantity, ";
          this.HighlightErrorRow($rows);
        }
        index++;
      }

      if (ErrorMessagge.length > 0) {
        this.commonService.ShowToast(
          "Row(s) marked red is invalid. Please check again & submit."
        );
      }
      return !(ErrorMessagge.length > 0);
    }
    return 0;
  }

  RefreshPage() {
    let rows = $("#billing-body").find('tr[isvalid="true"]');
    if (rows !== null && rows.length > 0) {
      let index = 0;
      while (index < rows.length) {
        this.commonService.ResetDropdown($(rows[index]));
        $(rows[index])
          .find('input[name="Description"]')
          .val("");
        $(rows[index])
          .find('input[name="Price"]')
          .val("");
        $(rows[index])
          .find('input[name="Quantity"]')
          .val("");
        $(rows[index])
          .find('input[name="BrandName"]')
          .val("");
        index++;
      }
    }

    this.commonService.ResetDropdown($("#CustomerByName"));
    $("#BillNo").val("");
    $("#TransportName").val("");
    $("#VehicleNo").val("");
    $("#PaidAmount").val("");
    $("#DueAmount").val("");
    this.PurchasedTotalPrice = 0;
    this.ReLoadMasterData();
  }

  SubmitData() {
    if (this.IsPurchasePage) {
      this.SubmitSoldItems();
    } else {
      this.SubmitNewItems();
    }
  }

  SubmitNewItems() {
    let $table = $("#newitems-body");
    let IsValidflag = false;
    let GridRowData: any = this.purchaseFormGroup.controls["GridDetail"];
    if (this.commonService.IsValid(GridRowData)) {
      let PurchaseData = {};
      let ItemDetail: Array<any> = [];
      let ErrorFields: Array<number> = [];
      let ErrorFlag = false;
      GridRowData.controls.map((x: any, index: number) => {
        if (x.touched) {
          let StockDetail = $table
            .find(`tr:nth-child(${index + 1}) input[name="currentStockDetail"]`)
            .val();

          if (this.commonService.IsValid(StockDetail)) {
            StockDetail = JSON.parse(StockDetail);
            let CatagoryDetailData = StockDetail["data"];

            try {
              if (isNaN(parseFloat(x.controls["ActualPrice"].value)))
                ErrorFlag = true;
            } catch (e) {
              ErrorFlag = true;
            }

            try {
              if (isNaN(parseFloat(x.controls["SellingPrice"].value)))
                ErrorFlag = true;
            } catch (e) {
              ErrorFlag = true;
            }

            if (ErrorFlag) {
              ErrorFields.push(index + 1);
            } else {
              if (this.commonService.IsValid(CatagoryDetailData)) {
                ItemDetail.push({
                  RowIndex: index + 1,
                  ItemName: x.controls["ItemName"].value,
                  CatagoryUid: CatagoryDetailData.catagoryUid,
                  BrandName: x.controls["BrandName"].value,
                  SerialNumber: "",
                  Quantity: x.controls["Qty"].value,
                  ActualPrice: parseFloat(x.controls["ActualPrice"].value),
                  SellingPrice: parseFloat(x.controls["SellingPrice"].value),
                  Discount: 0
                });
              }
            }
          }
        }
      });

      let CustomerDetail = this.commonService.ReadAutoCompleteObject(
        $("#CustomerByName")
      );

      if (
        this.commonService.IsValid(CustomerDetail) &&
        this.commonService.IsValid(CustomerDetail.data)
      ) {
        if (ItemDetail.length > 0 && !ErrorFlag) {
          PurchaseData["CustomerUid"] = CustomerDetail.data;
          PurchaseData["purchaseItemDetails"] = ItemDetail;
          this.http.post("Goods/AddNewItems", PurchaseData).then(
            response => {
              if (
                this.commonService.IsValid(response) &&
                response === "Committed successfully"
              ) {
                this.commonService.ShowToast("Data added successfully.");
                this.RefreshPage();
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
        } else {
          let Message = "";
          if (ItemDetail.length > 0) {
            let Indexes = ErrorFields.join(", ");
            Message =
              "Following indexed row have invalid Qunatity & Price values. [ " +
              Indexes +
              " ]";
          } else {
            Message = "No entry found. Please fill atleast one row detail.";
          }
          this.commonService.ShowToast(Message);
        }
      } else {
        this.commonService.ShowToast("Please select vendor before submit.");
      }
    }
  }

  SubmitSoldItems() {
    if (this.TableValidationCheck()) {
      let $table = $("#billing-body");
      let OtherDetailData: any = this.purchaseFormGroup.controls["OtherDetail"];
      let GridRowData: any = this.purchaseFormGroup.controls["GridDetail"];
      let CustomerDetailData: any = this.purchaseFormGroup.controls[
        "CustomerDetail"
      ];
      if (
        this.commonService.IsValid(GridRowData) &&
        this.commonService.IsValid(OtherDetailData) &&
        this.commonService.IsValid(CustomerDetailData)
      ) {
        let PurchaseData: any = {};
        let InValidCells: Array<string> = [];

        let Vendor = this.commonService.ReadAutoCompleteObject(
          $("#CustomerByName")
        );

        if (this.commonService.IsValid(Vendor["data"])) {
          PurchaseData["CustomerUid"] = Vendor["data"];
        } else {
          InValidCells.push("CustomerUid");
        }

        let DueAmount = 0;
        let DueAmountValue = $("#DueAmount").val();
        try {
          DueAmount = parseFloat(DueAmountValue);
        } catch (e) {
          console.log("Invalid due amount.");
        }
        PurchaseData["DueAmount"] = DueAmount;

        if (OtherDetailData.controls["PaidAmount"].value !== "") {
          PurchaseData["PaidAmount"] =
            OtherDetailData.controls["PaidAmount"].value;
        } else {
          InValidCells.push("PaidAmount");
        }

        if (OtherDetailData.controls["TransportName"].value !== "") {
          PurchaseData["TransportName"] =
            OtherDetailData.controls["TransportName"].value;
        } else {
          InValidCells.push("TransportName");
        }

        if (OtherDetailData.controls["VehicleNo"].value !== "") {
          PurchaseData["VehicleNo"] =
            OtherDetailData.controls["VehicleNo"].value;
        }

        if (CustomerDetailData.controls["BillNo"].value !== "") {
          PurchaseData["BillNo"] = CustomerDetailData.controls["BillNo"].value;
        } else {
          InValidCells.push("BillNo");
        }

        let ItemName = "";
        if (InValidCells.length === 0) {
          let ItemDetail = [];
          GridRowData.controls.map((x, index) => {
            if (x.touched) {
              let StockDetail = $table
                .find(
                  `tr:nth-child(${index + 1}) input[name="currentStockDetail"]`
                )
                .val();

              if (
                this.commonService.IsValid(StockDetail) &&
                ItemName !== null
              ) {
                StockDetail = JSON.parse(StockDetail);
                let StockDetailData = StockDetail["data"];
                ItemName = StockDetail.value.split("@[");
                if (ItemName.length > 1) ItemName = ItemName[0].trim();
                else ItemName = null;
                if (ItemName !== null) {
                  ItemDetail.push({
                    RowIndex: index + 1,
                    ItemName: ItemName,
                    CatagoryUid: StockDetailData.catagoryUid,
                    BrandName: x.controls["BrandName"].value,
                    BrandUid: StockDetailData["brandUid"],
                    StockUid: StockDetailData.stockUid,
                    SerialNumber: "",
                    Quantity: $table
                      .find(`tr:nth-child(${index + 1}) input[name="Quantity"]`)
                      .val(),
                    ActualPrice: $table
                      .find(`tr:nth-child(${index + 1}) input[name="Price"]`)
                      .val(),
                    SellingPrice: 0,
                    MRP: $table
                      .find(`tr:nth-child(${index + 1}) input[name="Price"]`)
                      .val(),
                    Discount: 0,
                    Description: $table
                      .find(
                        `tr:nth-child(${index + 1}) input[name="Description"]`
                      )
                      .val(),
                    TaxAmount: $table
                      .find(
                        `tr:nth-child(${index + 1}) input[name="TaxAmount"]`
                      )
                      .val(),
                    TotalAmount: $table
                      .find(
                        `tr:nth-child(${index + 1}) input[name="TotalAmount"]`
                      )
                      .val()
                  });
                }
              }
            }
          });

          if (ItemDetail.length > 0) {
            PurchaseData["purchaseItemDetails"] = ItemDetail;
            this.http.post("Goods/InsertMultiPurchaseItem", PurchaseData).then(
              response => {
                if (
                  this.commonService.IsValid(response) &&
                  response === "Committed successfully"
                ) {
                  this.commonService.ShowToast("Data added successfully.");
                  this.RefreshPage();
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
        } else {
          this.commonService.MarkedErrorFields(InValidCells);
          this.commonService.ShowToast(
            "Required fields: " +
              InValidCells.join(", ").replace("CustomerUid", "Customer Name")
          );
        }
      }
    }
  }

  ValidateNInsertValue(key: string, index: number): number {
    let position: number = -1;
    position = this.Items.hasKey(key);
    if (position === -1) {
      position = this.Items.hasValue(index);
      if (position !== -1) {
        this.Items.replaceByValue(key, index);
        position = -1;
      } else {
        this.Items.insert(key, index);
        position = -1;
      }
    } else if (position === index) {
      position = -1;
    }
    return position;
  }

  HandleAutofillData(event: any) {
    let CurrentRow = $(event.currentTarget).closest("tr");
    let SelectValues = JSON.parse(event);
    let position = -1;
    if (this.IsPurchasePage) {
      position = this.ValidateNInsertValue(
        SelectValues.value,
        parseInt(CurrentRow.attr("index"))
      );
    }
    if (position === -1) {
      if (event !== null && CurrentRow !== null) {
        CurrentRow.find('input[name="currentStockDetail"]').val(event);
        let StockValues = this.storage.get("", "Stocks");
        let TaxDetail = this.storage.get("", "MasterDetail");
        if (this.commonService.IsValid(StockValues)) {
          let FilteredValue = StockValues.filter(
            (x: any) => x.StockUid === SelectValues.data.stockUid
          );
          if (this.commonService.IsValid(FilteredValue)) {
            this.CurrentItemActualPrice = FilteredValue[0].ActualPrice;
            CurrentRow.find('input[name="Price"]').val(
              FilteredValue[0].ActualPrice
            );
          }
        }
        this.EnableCurrentRow($(event.currentTarget));
        let GSTDetail = TaxDetail.filter(
          (x: any) => x.CatagoryUid === SelectValues["data"].catagoryUid
        );
        if (GSTDetail.length === 3) {
          try {
            let IGSTItem = GSTDetail.filter((x: any) => x.TypeName === "IGST");
            if (IGSTItem.length > 0) {
              this.CurrentIGSTTax = IGSTItem[0].TypeValue;
            }
            let SGSTItem = GSTDetail.filter((x: any) => x.TypeName === "SGST");
            if (SGSTItem.length > 0) {
              this.CurrentSGSTTax = SGSTItem[0].TypeValue;
            }
            let CGSTItem = GSTDetail.filter((x: any) => x.TypeName === "CGST");
            if (CGSTItem.length > 0) {
              this.CurrentCGSTTax = CGSTItem[0].TypeValue;
            }
          } catch (e) {
            this.commonService.ShowToast(
              "Invalid data found. Please contact to admin."
            );
          }
        }
        //let BrandDetail = this.storage.get(null, "Brands");
      } else {
        this.commonService.ShowToast(
          "Selected stock is invalid. Please contact to admin."
        );
      }
      $(event?.currentTarget)
        .closest("tr")
        .find('div[name="description"] > input')
        .focus();
    } else {
      let Row = $(`#billing-body tr:nth-child(${position + 1})`);
      this.commonService.ShowToast("Item already selected.");
      this.commonService.ResetDropdown(
        CurrentRow.find('div[name="autofill-container"]')
      );
      this.HighlightErrorRow(Row);
      setTimeout(() => {
        this.RemoveErrorHighlight(Row);
      }, 4000);
    }
  }

  ReLoadMasterData() {
    this.http.get("Master/PageMasterData").then(
      response => {
        this.cache.clear();
        this.storage.clear();
        this.storage.set(response);
        let index = 0;
        while (index < 50) {
          this.ItemRows.push(index + 1);
          index++;
        }
        if (this.IsPurchasePage) {
          this.PageCachingData = this.cache.get("Stocks");
          if (this.PageCachingData !== null) {
            //this.PrepareDropdownData();
            this.StockBindingData = {
              data: [],
              placeholder: ""
            };
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
                  stockUid: this.PageCachingData[index].StockUid,
                  catagoryUid: this.PageCachingData[index].CatagoryUid,
                  brandUid: this.PageCachingData[index].BrandUid,
                  brandName: this.PageCachingData[index].BrandName
                }
              });
              index++;
            }
            this.StockBindingData["data"] = BindingData;
            this.loadInitData();
            this.IsDataReady = true;
          } else {
            this.commonService.ShowToast(
              "No item added. Please go to setting and add product.",
              10
            );
          }
        } else {
          this.PageCachingData = this.cache.get("Catagory");
          if (this.PageCachingData !== null) {
            //this.PrepareDropdownData();
            this.StockBindingData = {
              data: [],
              placeholder: ""
            };
            let BindingData = [];
            let index = 0;
            while (index < this.PageCachingData.length) {
              BindingData.push({
                value: this.PageCachingData[index].CatagoryName,
                data: {
                  catagoryUid: this.PageCachingData[index].CatagoryUid
                }
              });
              index++;
            }
            this.StockBindingData["data"] = BindingData;
            this.loadInitData();
            this.IsDataReady = true;
          } else {
            this.IsDataReady = false;
            this.commonService.ShowToast(
              "No item added. Please go to setting and add product.",
              10
            );
          }
        }
      },
      error => {
        this.commonService.ShowToast(
          "Unable to get master data. Please try again later."
        );
        this.nav.navigate("/", null);
      }
    );
  }

  AddMoreRows() {
    this.BillingFormGroup.push(this.GetRow());
  }

  DeleteRow() {
    alert("delete");
  }

  EditRow() {
    alert("edit");
  }

  GetRow() {
    return {
      Quantity: [""],
      Price: [""],
      TotalPrice: [""],
      StockDetail: this.StockBindingData,
      BrandDetail: {
        data: [],
        placeholder: "No brand"
      }
    };
  }

  InitBillingRows(RowCount: number): Array<any> {
    let Row = [];
    let index = 0;
    while (index < RowCount) {
      Row.push(this.GetRow());
      index++;
    }
    return Row;
  }

  ngOnInit() {}

  loadInitData() {
    this.BillingFormGroup = this.InitBillingRows(this.NoOfRows);
    this.BindDynamicGrid();
    //this.HandleAutoClose();
    let Data = this.storage.get("master", "Vendor");
    if (this.commonService.IsValid(Data)) {
      let NamedData = [];
      let index = 0;
      while (index < Data.length) {
        if (
          Data[index]["FirstName"] !== null &&
          Data[index]["FirstName"] !== ""
        ) {
          NamedData.push({
            value: Data[index]["FirstName"] + " " + Data[index]["LastName"],
            data: Data[index]["CustomerUid"]
          });
        }
        index++;
      }
      this.CustomerDetail["data"] = NamedData;
      this.CustomerDefaultSelection = NamedData[0];

      let DataByMobile = [];
      index = 0;
      while (index < Data.length) {
        if (
          Data[index]["ShopName"] !== null &&
          Data[index]["ShopName"] !== ""
        ) {
          DataByMobile.push({
            value: Data[index]["MobileNo"],
            data: Data[index]["CustomerUid"]
          });
        }
        index++;
      }
    }

    this.CustomerDetail["placeholder"] = "Customer Name";
    setTimeout(() => {
      this.Grid = $("#billing-body");
    }, 1000);
  }

  PrepareDropdownData() {
    this.http.get("Master/PageMasterData").then(
      data => {
        this.storage.clear();
        this.storage.set(data);
        this.StockBindingData = {
          data: [],
          placeholder: ""
        };
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
              stockUid: this.PageCachingData[index].StockUid,
              catagoryUid: this.PageCachingData[index].CatagoryUid,
              brandUid: this.PageCachingData[index].BrandUid,
              brandName: this.PageCachingData[index].BrandName
            }
          });
          index++;
        }
        this.StockBindingData["data"] = BindingData;
        this.loadInitData();
      },
      error => {
        this.commonService.ShowToast("Unable to fetch Master Data");
      }
    );
  }

  CalculateTotalAmount() {
    let $validrows = $("#billtable").find('tr[isvalid="true"]');
    if ($validrows !== null && $validrows.length > 0) {
      let index = 0;
      let TotalAmount = 0;
      this.PurchasedTotalPrice = 0;
      while (index < $validrows.length) {
        try {
          TotalAmount = parseInt(
            $($validrows[index])
              .find('input[name="TotalAmount"]')
              .val()
          );
          if (!isNaN(TotalAmount)) {
            this.PurchasedTotalPrice += TotalAmount;
          }
        } catch (e) {}
        index++;
      }
    }
  }

  // ScrollToAvailableRow(Record: any) {
  //   let SelectedRow = $(this.Grid).find('td[uid="' + Record["data"] + '"]');
  //   if (
  //     this.commonService.IsValid(Record) &&
  //     this.commonService.IsValidString(Record["index"]) &&
  //     this.commonService.IsValid(SelectedRow)
  //   ) {
  //     let CurrentRowIndex = SelectedRow.closest("tr").attr("index");
  //     if (this.commonService.IsValidString(CurrentRowIndex)) {
  //       if (Record.index === CurrentRowIndex) {
  //         SelectedRow.closest("tr")
  //           .find('div[name="quantity"] > input')
  //           .focus();
  //       } else {
  //         let $workingcell = $(event.currentTarget)
  //           .closest("td")
  //           .find('input[name="iautofill-textfield"]');

  //         this.commonService.Scrollto("content-body", SelectedRow);
  //         $workingcell.val("");
  //         $workingcell.attr("data", "");
  //         SelectedRow.closest("tr")
  //           .find('div[name="quantity"] > input')
  //           .focus();
  //         SelectedRow.closest("tr").addClass("marked-active");
  //         this.commonService.ShowToast("Already selected.");
  //         setTimeout(() => {
  //           SelectedRow.closest("tr").removeClass("marked-active");
  //         }, 2000);
  //       }
  //     }
  //   }
  // }

  EnableCurrentRow($e: any) {
    $e.closest("tr").attr("isvalid", "true");
  }

  // EnableField() {
  //   $(event.currentTarget).removeAttr("style");
  // }

  //HandleAutoClose() {}

  HandleDescription(event: any) {
    let value = "";
    event.preventDefault();
    if (event.which < 58) {
      if (event.which === 32 || event.which === 43) {
        value = "+";
        if (this.LastKey === "*" || this.LastKey === "+") {
          event.preventDefault();
          return false;
        }
        this.LastKey = "+";
      } else if (event.which === 42 || event.which === 46) {
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
      } else if (event.which % 48 >= 0 && event.which % 48 <= 9) {
        this.LastKey = event.key;
        this.DescriptValue = $(event.currentTarget).val() + event.key;
        this.CalculateDescription(this.DescriptValue);
      }
      $(event.currentTarget).val(this.DescriptValue);
    }
    return true;
  }

  ManageDescription(e: any) {
    if (e.which === 8 || e.which === 46) {
      this.CalculateDescription($(e.currentTarget).val());
    }
  }

  CalculateDescription(DescValue: string) {
    let ActualValue = 0;
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
                  multipledData *=
                    parseInt(values[innerIndex]) *
                    parseInt(values[++innerIndex]);
                  innerIndex++;
                }
              }
            }
            if (multipledData == 0) ActualValue += parseInt(Items[index]);
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
      this.CalculateAllGstTaxes(ActualValue);
      this.CalculateTotalAmount();
    }
  }

  PrepareBinding(event: any) {
    this.$Qnty = $(event.currentTarget)
      .closest("tr")
      .find('input[name="Quantity"]');

    this.TaxField = $(event.currentTarget)
      .closest("tr")
      .find('input[name="TaxAmount"]');

    this.TotalAmountField = $(event.currentTarget)
      .closest("tr")
      .find('input[name="TotalAmount"]');
  }

  CalculateAllGstTaxes(ActualQuantity: any) {
    try {
      if (
        this.CurrentItemActualPrice !== null &&
        this.CurrentItemActualPrice > 0
      ) {
        let Amount: number =
          parseFloat(parseFloat(ActualQuantity).toFixed(2)) *
          this.CurrentItemActualPrice;
        if (!isNaN(Amount)) {
          try {
            let TaxAmount = 0;
            if (this.CurrentIGSTTax > 0) {
              TaxAmount += parseFloat(
                parseFloat(
                  ((Amount * this.CurrentIGSTTax) / 100).toFixed(2)
                ).toFixed(2)
              );
            }

            if (this.CurrentSGSTTax > 0) {
              TaxAmount += parseFloat(
                parseFloat(
                  ((Amount * this.CurrentSGSTTax) / 100).toFixed(2)
                ).toFixed(2)
              );
            }

            if (this.CurrentCGSTTax > 0) {
              TaxAmount += parseFloat(
                parseFloat(
                  ((Amount * this.CurrentCGSTTax) / 100).toFixed(2)
                ).toFixed(2)
              );
            }

            this.TaxField.val(TaxAmount);
            this.TotalAmountField.val(Amount + TaxAmount);
          } catch (e) {
            this.commonService.ShowToast(
              "Getting error on tax calculation. Please contact to admin."
            );
          }
        }
      }
    } catch (e) {
      this.commonService.ShowToast(
        "Getting error on tax calculation. Please contact to admin."
      );
    }
  }

  FindDueAmount(event: any) {
    let UserAmount = 0;
    try {
      UserAmount = parseFloat($(event.currentTarget).val());
      if (UserAmount <= this.PurchasedTotalPrice) {
        $("#DueAmount").val(this.PurchasedTotalPrice - UserAmount);
      }
    } catch (e) {
      this.commonService.ShowToast("Invalid amount.");
    }
  }
}
