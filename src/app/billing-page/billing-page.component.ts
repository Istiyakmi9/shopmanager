import { iNavigation } from "./../../providers/iNavigation";
import { Component, OnInit } from "@angular/core";
import { PageCache } from "src/providers/PageCache";
import {
  CommonService,
  IsValidType
} from "./../../providers/common-service/common.service";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import jsPDF from 'jspdf';
import * as $ from "jquery";
import canvas from "html2canvas";
import { AjaxService } from "src/providers/ajax.service";

@Component({
  selector: "app-billing-page",
  templateUrl: "./billing-page.component.html",
  styleUrls: ["./billing-page.component.scss"]
})
export class BillingPageComponent implements OnInit {
  ItemRows: Array<ItemsDetail> = [];
  CustomerInfo: Customer = null;
  VendorDetail: ShopDetail = null;
  PaymentDate: any;
  BillingAmountDetail: any;
  GrandTotal: any;
  IsReady: boolean = false;
  AmountPaid: any;
  AmountDue: any;
  NotPrintableTag: any;
  IsPurchasedInvoid: boolean = false;
  InitialDob: any;
  BillingData: Array<iBilling> = [];
  InvoiceDetail: any = {
    data: [],
    placeholder: "Enter your invoid no.#"
  };
  constructor(
    private cache: PageCache,
    private commonService: CommonService,
    private storage: ApplicationStorage,
    private nav: iNavigation,
    private http: AjaxService
  ) {}

  ngOnInit() {
    this.LoadBillDetails(new Date());
    this.InitialDob = {
      billDate: new Date()
    };
    let BillingInfo = {
      BillDate: new Date(),
      BillNo: ""
    };
    this.LoadInitialDate(BillingInfo);
    this.PaymentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    let ParseBillingData = this.commonService.GetCurrentPageStorageValue();
    if (ParseBillingData !== undefined && ParseBillingData != null) {
      this.BindingMappedData(ParseBillingData);
      this.ManagePage();
      this.IsReady = true;
      $("#invoice-sec").fadeIn(500);
    } else {
      this.commonService.ShowToast("Invoice page.");
    }
  }

  ngAfterViewInit() {
    this.NotPrintableTag = $("#nonprintable");
  }

  LoadBillDetails(BillDate: Date) {
    if (BillDate !== null) {
      let ServerObject = {
        BillDate: BillDate,
        BillNo: ""
      };
      this.http.post("Goods/GetInvoiceNumbers", ServerObject).then(result => {
        if (IsValidType(result)) {
          if (typeof result["BillNumbers"] !== "undefined") {
            let index = 0;
            this.IsReady = false;
            let Data = result["BillNumbers"];
            this.BillingData = [];
            while (index < Data.length) {
              this.BillingData.push({
                CustomerName: Data[index].CustomerName,
                BillNum: Data[index].BillNum,
                CreatedOn: Data[index].CreatedOn
              });
              index++;
            }
          }
        } else {
          this.commonService.ShowToast(
            "Getting server error. Please contact to admin."
          );
        }
      });
    }
  }

  PrintBill(BillingInfo: any) {
    if (IsValidType(BillingInfo)) {
      this.http
        .post("Goods/GetInvoiceDetail", BillingInfo)
        .then(result => {
          if (IsValidType(result) && result !== "Invalid Bill number") {
            this.BindingMappedData(result);
            this.ManagePage();
            this.IsReady = true;
            $("#invoice-sec").fadeIn(500);
          } else {
            this.commonService.ShowToast(result);
          }
        })
        .catch(e => {
          this.commonService.ShowToast("Error while getting billdetail");
        });
    }
  }

  LoadInitialDate(BillingInfo: any) {
    this.http
      .post("Goods/GetInvoiceNumbers", BillingInfo)
      .then(result => {
        if (IsValidType(result)) {
          if (typeof result["BillNumbers"] !== "undefined") {
            let BillNumbers = result["BillNumbers"];
            let InvoiceNumbers = [];
            let index = 0;
            while (index < BillNumbers.length) {
              InvoiceNumbers.push({
                value: BillNumbers[index]["BillNum"],
                data: BillNumbers[index]["BillNum"]
              });
              index++;
            }
            this.InvoiceDetail = [];
            this.InvoiceDetail = {
              data: InvoiceNumbers,
              placeholder: "Enter your invoid no.#"
            };
          }
        }
      })
      .catch(e => {
        this.commonService.ShowToast(
          "Getting error while loading billing numbers."
        );
      });
  }

  GetActualDate(UserDate: Date) {
    let FormatedDate: Date = null;
    if (IsValidType(UserDate)) {
      FormatedDate = new Date(UserDate);
      if (IsValidType(FormatedDate)) {
        FormatedDate.setMinutes(
          FormatedDate.getMinutes() - FormatedDate.getTimezoneOffset()
        );
      }
    }
    return FormatedDate;
  }

  GetBilltoView() {
    if (IsValidType(this.InitialDob.billDate)) {
      let ActualDate = this.GetActualDate(this.InitialDob.billDate);
      this.LoadBillDetails(ActualDate);
    }
  }

  GetBill() {
    let BillObject = this.commonService.ReadAutoCompleteObject($("#Billno"));
    if (IsValidType(BillObject)) {
      let BillNo = BillObject["data"];
      let BillingInfo = {
        BillDate: new Date(),
        BillNo: BillNo
      };
      this.PrintBill(BillingInfo);
    }
  }

  ViewBill(BillNo: Date) {
    if (IsValidType(BillNo)) {
      let BillingInfo = {
        BillDate: new Date(),
        BillNo: BillNo
      };
      this.PrintBill(BillingInfo);
    }
  }

  ManagePage() {
    let len = this.ItemRows.length;
    if (len < 10) {
      let remaining = 10 - len;
      while (remaining !== 0) {
        this.ItemRows.push(this.GetEmptyRow());
        remaining--;
      }
    }
  }

  GetEmptyRow() {
    let EmptyRow = {
      SoldItemUid: "",
      ItemName: "",
      BrandName: "",
      CatagoryName: "",
      CatagoryDescription: "",
      Quantity: "",
      Price: "",
      Dicsount: "",
      TotalPrice: "",
      TaxAmount: "",
      IGST: "",
      CGST: "",
      SGST: "",
      Description: "",
      BillNum: ""
    };
    return EmptyRow;
  }

  BindingMappedData(ParseBillingData: any) {
    if (ParseBillingData !== null) {
      if (
        typeof ParseBillingData["BillDetail"] !== "undefined" &&
        typeof ParseBillingData["CustomerDetail"] !== "undefined" &&
        typeof ParseBillingData["ShopDetail"] !== "undefined"
      ) {
        this.BuildItemsRow(ParseBillingData["BillDetail"]);
        this.BuildCustomerDetail(ParseBillingData["CustomerDetail"]);
        this.BuildUserDetail(ParseBillingData["ShopDetail"]);
      }
    }
  }

  BuildItemsRow(Items: Array<any>) {
    this.ItemRows = [];
    let index = 0;
    let TotalPrice = 0;
    this.AmountPaid = Items[0].AmountPaid;
    this.AmountDue = Items[0].AmountDue;
    let BrandName = "";
    while (index < Items.length) {
      try {
        BrandName = IsValidType(Items[index].BrandName)
          ? Items[index].BrandName
          : "";
        TotalPrice += parseInt(Items[index].TotalPrice);

        this.ItemRows.push({
          SoldItemUid: IsValidType(Items[index].SoldItemUid)
            ? Items[index].SoldItemUid
            : "NA",
          ItemName: IsValidType(Items[index].ItemName)
            ? Items[index].ItemName + " (" + BrandName + ")"
            : "NA",
          BrandName: IsValidType(Items[index].BrandName)
            ? Items[index].BrandName
            : "NA",
          CatagoryName: IsValidType(Items[index].CatagoryName)
            ? Items[index].CatagoryName
            : "NA",
          CatagoryDescription: IsValidType(Items[index].CatagoryDescription)
            ? Items[index].CatagoryDescription
            : "NA",
          Quantity: Items[index].Quantity,
          Price: Items[index].Price,
          Dicsount: Items[index].Dicsount,
          TotalPrice: Items[index].TotalPrice,
          TaxAmount: Items[index].TaxAmount,
          IGST: Items[index].IGST,
          CGST: Items[index].CGST,
          SGST: Items[index].SGST,
          Description: IsValidType(Items[index].Description)
            ? Items[index].Description
            : "NA",
          BillNum: IsValidType(Items[index].BillNum)
            ? Items[index].BillNum
            : "NA"
        });
      } catch (e) {
        this.commonService.ShowToast(
          "Item record data is invalid. Please contact to admin."
        );
      }
      index++;
    }
    this.GrandTotal = TotalPrice;
  }

  BuildUserDetail(Vendor: any) {
    Vendor = Vendor[0];
    this.VendorDetail = {
      InVoiceNo: IsValidType(Vendor.InVoiceNo) ? Vendor.InVoiceNo : "NA",
      LicenseNo: IsValidType(Vendor.LicenseNo) ? Vendor.LicenseNo : "NA",
      GSTNo: IsValidType(Vendor.GSTNo) ? Vendor.GSTNo : "NA",
      Name: IsValidType(Vendor.Name) ? Vendor.Name : "",
      MobileNo: IsValidType(Vendor.MobileNo) ? Vendor.MobileNo : "NA",
      ShopPhoneNo: IsValidType(Vendor.ShopPhoneNo) ? Vendor.ShopPhoneNo : "NA",
      EmailId: IsValidType(Vendor.EmailId) ? Vendor.EmailId : "NA",
      Address: IsValidType(Vendor.Address) ? Vendor.Address : "NA",
      ShopName: IsValidType(Vendor.ShopName) ? Vendor.ShopName : "NA"
    };
  }

  BuildCustomerDetail(Customer: any) {
    Customer = Customer[0];
    this.CustomerInfo = {
      CustomerName: IsValidType(Customer.CustomerName)
        ? Customer.CustomerName
        : "NA",
      MobileNo: IsValidType(Customer.MobileNo) ? Customer.MobileNo : "NA",
      AlternetNo: IsValidType(Customer.AlternetNo) ? Customer.AlternetNo : "NA",
      ShopPhoneNumber: IsValidType(Customer.ShopPhoneNumber)
        ? Customer.ShopPhoneNumber
        : "NA",
      EmailId: IsValidType(Customer.EmailId) ? Customer.EmailId : "NA",
      ShopName: IsValidType(Customer.ShopName) ? Customer.ShopName : "NA",
      FullAddress: IsValidType(Customer.FullAddress)
        ? Customer.FullAddress
        : "NA",
      GSTNo: IsValidType(Customer.GSTNo) ? Customer.GSTNo : "NA",
      LicenseNo: IsValidType(Customer.LicenseNo) ? Customer.LicenseNo : "NA"
    };
  }

  getInvoicedPdf() {
    //$("#invoice-sec").printThis();
    this.NotPrintableTag.addClass("d-none");
    setTimeout(() => {
      this.NotPrintableTag.removeClass("d-none");
    }, 1000);
    window.print();
  }

  getPdfFile() {
    let data = document.getElementById("invoice-sec");
    canvas(data).then(canvas => {
      // Few necessary setting options
      let imgWidth = 208;
      let pageHeight = 295;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL("image/png");
      //let pdf = new jspdf("p", "mm", "a4");
      let pdf = new jsPDF("p", "mm", "a4")
      let position = 0;
      pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
      pdf.save("billing.pdf"); // Generated PDF
    });
  }
}

interface ItemsDetail {
  SoldItemUid: string;
  ItemName: string;
  BrandName: string;
  CatagoryName: string;
  CatagoryDescription: string;
  Quantity: string;
  Price: string;
  Dicsount: string;
  TotalPrice: string;
  TaxAmount: string;
  IGST: string;
  CGST: string;
  SGST: string;
  Description: string;
  BillNum: string;
  AmountPaid?: string;
  AmountDue?: string;
}

interface ShopDetail {
  InVoiceNo: string;
  LicenseNo: string;
  GSTNo: string;
  Name: string;
  MobileNo: string;
  ShopPhoneNo: string;
  EmailId: string;
  Address: string;
  ShopName: string;
}

interface Customer {
  CustomerName: string;
  MobileNo: string;
  AlternetNo: string;
  ShopPhoneNumber: string;
  EmailId: string;
  ShopName: string;
  FullAddress: string;
  GSTNo: string;
  LicenseNo: string;
}

interface iBilling {
  CustomerName: string;
  BillNum: string;
  CreatedOn: Date;
}
