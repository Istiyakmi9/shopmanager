import { Component, OnInit, ViewChild } from "@angular/core";
import * as $ from "jquery";
import { NgForm } from "@angular/forms";
import { CommonService } from "../../providers/common-service/common.service";
import { AjaxService } from "../../providers/ajax.service";
import { iNavigation } from "src/providers/iNavigation";
import { ApplicationStorage } from "./../../providers/ApplicationStorage";

@Component({
  selector: "app-customers",
  templateUrl: "./customers.component.html",
  styleUrls: ["./customers.component.scss"]
})
export class CustomersComponent implements OnInit {
  @ViewChild("customerform") CustomerData: NgForm;
  @ViewChild("vendorform") VendorData: NgForm;
  UserImagePath: string = this.commonService.DefaultUserImage();
  UserImage: any;
  Vendor: any = {};
  UserDetail: any = {};
  IsCustomer: boolean = true;
  constructor(
    private commonService: CommonService,
    private http: AjaxService,
    private nav: iNavigation,
    private storage: ApplicationStorage
  ) {
    this.ClearAllFields();
  }

  ngOnInit() {
    this.ManageCustomer();
  }

  ResetForm() {
    event.preventDefault();
    this.ClearAllFields();
    this.UserImagePath = this.commonService.DefaultUserImage();
    this.nav.resetValue();
    this.commonService.ShowToast("Form reseted successfully");
  }

  ManageCustomer() {
    let NavData = this.nav.getValue();
    let SearchStr = "";
    if (this.commonService.IsValid(NavData)) {
      if (NavData["data"].HiddenFields.length > 0) {
        let Uid = NavData["data"].HiddenFields[0].value;
        let Uri = `Registration/CurrentUserDetail?UserUid=${Uid}`;
        this.http.get(Uri).then(
          data => {
            if (typeof data["Record"] !== "undefined") {
              let ServerData = data["Record"][0];
              let flag = ServerData.IsClient;
              if (flag) {
                this.IsCustomer = true;
                this.BindCustomerDetail(ServerData);
              } else {
                this.IsCustomer = false;
                this.BindVendorDetail(ServerData);
              }
            } else {
              this.commonService.ShowToast("Server error. Contact to admin.");
            }
          },
          err => {
            console.log(JSON.stringify(err));
            this.commonService.ShowToast("Server error. Contact to admin.");
          }
        );
      }
    }
  }

  BindVendorDetail(ServerData: any) {
    let UserImagePath = this.commonService.IsValid(ServerData.ImagePath)
      ? this.http.GetImageBasePath() + ServerData.ImagePath
      : this.commonService.DefaultUserImage();
    this.Vendor = {
      UserImagePath: UserImagePath,
      MobileNo: ServerData.MobileNo,
      FullName: ServerData.FirstName + " " + ServerData.LastName,
      AlternetMobileNo: ServerData.AlternetMobileNo,
      EmailId: ServerData.EmailId,
      Dob: ServerData.UserDob,
      FullAddress: ServerData.FullAddress,
      ShopPhoneNumber: ServerData.ShopPhoneNumber,
      ShopName: ServerData.ShopName,
      LicenseNo: ServerData.LicenseNo,
      GSTNo: ServerData.GSTNo,
      State: ServerData.State,
      City: ServerData.City,
      Pincode: ServerData.Pincode,
      CustBankAccountNo: ServerData.AccountNo,
      IFSCCode: ServerData.Ifsc,
      ImagePath: UserImagePath,
      CustomerUid: ServerData.CustomerUid
    };
  }

  BindCustomerDetail(ServerData: any) {
    let UserImagePath = this.commonService.IsValid(ServerData.ImagePath)
      ? this.http.GetImageBasePath() + ServerData.ImagePath
      : this.commonService.DefaultUserImage();
    this.UserDetail = {
      UserImagePath: UserImagePath,
      MobileNo: ServerData.MobileNo,
      FullName: ServerData.FirstName + " " + ServerData.LastName,
      AlternetMobileNo: ServerData.AlternetMobileNo,
      EmailId: ServerData.EmailId,
      Dob: ServerData.UserDob,
      FullAddress: ServerData.FullAddress,
      ShopPhoneNumber: ServerData.ShopPhoneNumber,
      ShopName: ServerData.ShopName,
      LicenseNo: ServerData.LicenseNo,
      GSTNo: ServerData.GSTNo,
      State: ServerData.State,
      City: ServerData.City,
      Pincode: ServerData.Pincode,
      CustBankAccountNo: ServerData.AccountNo,
      IFSCCode: ServerData.Ifsc,
      ImagePath: UserImagePath,
      CustomerUid: ServerData.CustomerUid
    };
  }

  ngAfterViewInit(): void {
    $("#customer-form")
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

  OpenFileExplorer() {
    $("#imageupload").click();
  }

  GetFile(fileInput: any) {
    let Files = fileInput.target.files;
    if (Files.length > 0) {
      this.UserImage = <File>Files[0];
      let mimeType = this.UserImage.type;
      if (mimeType.match(/image\/*/) == null) {
        console.log("Only images are supported.");
        return;
      }

      let reader = new FileReader();
      reader.readAsDataURL(this.UserImage);
      reader.onload = fileEvent => {
        if (this.IsCustomer) this.UserDetail.UserImagePath = reader.result;
        else this.Vendor.UserImagePath = reader.result;
      };
      console.log(this.UserImage.filename);
    } else {
      this.commonService.ShowToast("No file selected");
    }
  }

  SubmitCustomerForm() {
    let CuxtData = this.CustomerData.value;
    let Keys = Object.keys(CuxtData);
    let IsValidForm = this.commonService.ValidateForm(Keys);
    if (IsValidForm === 0) {
      let FullName = CuxtData.FullName;
      let PartedName = FullName.split(" ");
      if (PartedName.length === 1) {
        CuxtData["FirstName"] = FullName.trim().toUpperCase();
        CuxtData["LastName"] = "";
      } else {
        CuxtData["FirstName"] = PartedName[0].trim().toUpperCase();
        PartedName.splice(0, 1);
        CuxtData["LastName"] = PartedName.join(" ")
          .trim()
          .toUpperCase();
      }
      let formData = new FormData();
      formData.append("image", this.UserImage);
      formData.append("userDetail", JSON.stringify(CuxtData));

      this.http.upload("Registration/Customer", formData).then(
        data => {
          if (typeof data !== "undefined" && Object.keys(data).length > 0) {
            this.commonService.ShowToast("Customer created successfully.");
            this.storage.set(data);
          } else {
            this.commonService.ShowToast(
              "Server error. Please contact to admin."
            );
          }
        },
        error => {
          this.commonService.ShowToast(
            "Server error. Please contact to admin."
          );
        }
      );
    }
  }

  SubmitVendorForm() {
    let VendorData = this.VendorData.value;
    let Keys = Object.keys(VendorData);
    let IsValidForm = this.commonService.ValidateForm(Keys);
    if (IsValidForm === 0) {
      let FullName = VendorData.FullName;
      let PartedName = FullName.split(" ");
      if (PartedName.length === 1) {
        VendorData["FirstName"] = FullName.trim().toUpperCase();
        VendorData["LastName"] = "";
      } else {
        VendorData["FirstName"] = PartedName[0].trim().toUpperCase();
        PartedName.splice(0, 1);
        VendorData["LastName"] = PartedName.join(" ")
          .trim()
          .toUpperCase();
      }
      let formData = new FormData();
      formData.append("image", this.UserImage);
      formData.append("userDetail", JSON.stringify(VendorData));

      this.http.upload("Registration/Vendor", formData).then(
        data => {
          if (data !== "" && data !== null) {
            this.commonService.ShowToast("Record inserted successfully");
            this.storage.set(data);
            this.ClearAllFields();
          } else {
            this.commonService.ShowToast("Fail to inserted.");
          }
        },
        error => {
          this.commonService.ShowToast(
            "Server error. Please contact to admin."
          );
        }
      );
    }
  }

  ClearAllFields() {
    this.Vendor["FullName"] = "";
    this.Vendor["MobileNo"] = "";
    this.Vendor["AlternetMobileNo"] = "";
    this.Vendor["EmailId"] = "";
    this.Vendor["FullAddress"] = "";
    this.Vendor["ShopPhoneNumber"] = "";
    this.Vendor["ShopName"] = "";
    this.Vendor["LicenseNo"] = "";
    this.Vendor["GSTNo"] = "";
    this.Vendor["State"] = "";
    this.Vendor["City"] = "";
    this.Vendor["Pincode"] = "";
    this.Vendor["CustBankAccountNo"] = "";
    this.Vendor["Dob"] = new Date().toISOString();
    this.Vendor["IFSCCode"] = "";
    this.Vendor["UserImagePath"] = this.commonService.DefaultUserImage();

    this.UserDetail["FullName"] = "";
    this.UserDetail["MobileNo"] = "";
    this.UserDetail["AlternetMobileNo"] = "";
    this.UserDetail["EmailId"] = "";
    this.UserDetail["FullAddress"] = "";
    this.UserDetail["ShopPhoneNumber"] = "";
    this.UserDetail["ShopName"] = "";
    this.UserDetail["LicenseNo"] = "";
    this.UserDetail["GSTNo"] = "";
    this.UserDetail["State"] = "";
    this.UserDetail["City"] = "";
    this.UserDetail["Pincode"] = "";
    this.UserDetail["CustBankAccountNo"] = "";
    this.UserDetail["Dob"] = new Date().toISOString();
    this.UserDetail["IFSCCode"] = "";
    this.UserDetail["UserImagePath"] = this.commonService.DefaultUserImage();
  }

  HandleNav(Type: string) {
    if (Type === "Customer") {
      this.IsCustomer = true;
    } else {
      this.IsCustomer = false;
    }
  }

  PhonenoValidation(e: any) {
    let flag = this.commonService.MobileNumberFormat(
      e.which || e.keyCode,
      $(event.currentTarget).val().length
    );

    if (!flag) {
      event.preventDefault();
    }
  }
}
