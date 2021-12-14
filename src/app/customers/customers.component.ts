import { Component, OnInit, ViewChild } from "@angular/core";
import * as $ from "jquery";
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import { CommonService, Toast } from "../../providers/common-service/common.service";
import { AjaxService } from "../../providers/ajax.service";
import { iNavigation } from "src/providers/iNavigation";
import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { FileDetail } from "../DbModel";
import { ZerothIndex } from "src/providers/constants";

@Component({
  selector: "app-customers",
  templateUrl: "./customers.component.html",
  styleUrls: ["./customers.component.scss"]
})
export class CustomersComponent implements OnInit {
  @ViewChild("vendorform") VendorData: NgForm;
  UserImagePath: string = this.commonService.DefaultUserImage();
  UserImage: any;
  Vendor: any = {};
  UserDetail: any = {};
  IsCustomer: boolean = false;
  customerform: FormGroup;
  fileDetail: FileDetail;

  constructor(
    private commonService: CommonService,
    private http: AjaxService,
    private nav: iNavigation,
    private storage: ApplicationStorage,
    private fb: FormBuilder
  ) {
    this.fileDetail = null;
  }

  initForm() {
    this.customerform = this.fb.group({
      UserImagePath: new FormControl(""),
      Mobile: new FormControl(this.UserDetail.Mobile, Validators.required),
      FullName: new FormControl(this.UserDetail.FullName, Validators.required),
      FirstName: new FormControl(""),
      LastName: new FormControl(""),
      AlternetMobileNo: new FormControl(this.UserDetail.AlternetMobileNo),
      Email: new FormControl(this.UserDetail.Email, Validators.required),
      Dob: new FormControl(""),
      Address: new FormControl(this.UserDetail.Address),
      ShopPhoneNumber: new FormControl(this.UserDetail.ShopPhoneNumber),
      ShopName: new FormControl(this.UserDetail.ShopName),
      LicenseNo: new FormControl(this.UserDetail.LicenseNo),
      GSTNo: new FormControl(this.UserDetail.GSTNo),
      State: new FormControl(this.UserDetail.State),
      City: new FormControl(this.UserDetail.City),
      Pincode: new FormControl(this.UserDetail.Pincode),
      BankAccountNo: new FormControl(this.UserDetail.BankAccountNo),
      IFSCCode: new FormControl(this.UserDetail.IFSCCode),
      ImagePath: new FormControl(this.UserDetail.ImagePath),
      ShopUid: new FormControl(this.UserDetail.ShopUid),
      IsClient: new FormControl(true),
      IsVendor: new FormControl(false),
      ExistingFileDetailId: new FormControl(this.UserDetail.ExistingFileDetailId),
      CustomerUid: new FormControl(this.UserDetail.CustomerUid)
    });
  }

  enableVendor() {
    this.customerform.get("IsClient").setValue(false);
  }

  enableCustomer() {
    this.customerform.get("IsVendor").setValue(false);
  }

  ngOnInit() {
    let data = this.nav.getValue();
    if(data) {
      this.loadData(data["data"]);
    } else {
      this.initForm();
      this.IsCustomer = true;
    }
  }

  loadData(value: string) {
    let userData = JSON.parse(value);
    this.ManageCustomer(userData);
  }

  ResetForm() {
    event.preventDefault();
    this.ClearAllFields();
    this.UserImagePath = this.commonService.DefaultUserImage();
    this.nav.resetValue();
    Toast("Form reseted successfully");
  }

  ManageCustomer(userData: any) {
    let Uri = `reports/GetCustomerById?UserUid=${userData.CustomerUid}`;
    this.http.get(Uri).then(
      data => {
        if (data.responseBody) {
          let ServerData = data.responseBody.CustomerDetail[0];
          this.IsCustomer = true;
          this.BindCustomerDetail(ServerData);
          this.fileDetail = data.responseBody.Files[ZerothIndex] as FileDetail;
          if(this.fileDetail) {
            if(!isNaN(Number(this.fileDetail.FileOwnerId)))
              this.fileDetail.FileOwnerId = Number(this.fileDetail.FileOwnerId);
            if(!isNaN(Number(this.fileDetail.FileDetailId))) {
              this.fileDetail.FileDetailId = Number(this.fileDetail.FileDetailId);
              this.UserDetail.ExistingFileDetailId = this.fileDetail.FileDetailId;
            }
          }
        } else {
          Toast("Server error. Contact to admin.");
        }
        this.initForm();
        this.IsCustomer = true;
      },
      err => {
        console.log(JSON.stringify(err));
        Toast("Server error. Contact to admin.");
      }
    );
  }

  BindVendorDetail(ServerData: any) {
    let UserImagePath = this.commonService.IsValid(ServerData.ImagePath)
      ? this.http.GetImageBasePath() + ServerData.ImagePath
      : this.commonService.DefaultUserImage();
    this.Vendor = {
      Mobile: ServerData.Mobile,
      FullName: ServerData.FirstName + " " + ServerData.LastName,
      AlternetMobileNo: ServerData.AlternetMobileNo,
      Email: ServerData.EmailId,
      Dob: ServerData.UserDob,
      Address: ServerData.FullAddress,
      ShopPhoneNumber: ServerData.ShopPhoneNumber,
      ShopName: ServerData.ShopName,
      LicenseNo: ServerData.LicenseNo,
      GSTNo: ServerData.GSTNo,
      State: ServerData.State,
      City: ServerData.City,
      Pincode: ServerData.Pincode,
      BankAccountNo: ServerData.AccountNo,
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
      Mobile: ServerData.MobileNo,
      FullName: ServerData.FirstName + " " + ServerData.LastName,
      AlternetMobileNo: ServerData.AlternetMobileNo,
      Email: ServerData.EmailId,
      Dob: ServerData.UserDob,
      Address: ServerData.FullAddress,
      ShopPhoneNumber: ServerData.ShopPhoneNumber,
      ShopName: ServerData.ShopName,
      LicenseNo: ServerData.LicenseNo,
      GSTNo: ServerData.GSTNo,
      State: ServerData.State,
      City: ServerData.City,
      Pincode: ServerData.Pincode,
      BankAccountNo: ServerData.AccountNo,
      IFSCCode: ServerData.Ifsc,
      ImagePath: UserImagePath,
      CustomerUid: ServerData.CustomerUid,
      ExistingFileDetailId: 0
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
        if (this.IsCustomer){
          this.UserDetail.UserImagePath = reader.result;
        } else {
          this.Vendor.UserImagePath = reader.result;
        }
      };
      console.log(this.UserImage.filename);
    } else {
      Toast("No file selected");
    }
  }

  SubmitCustomerForm() {
    if (this.customerform.valid) {
      let CustomerFullName = "";
      let errorFlag = false;
      if(this.customerform.controls.FullName.errors != null)
      errorFlag = true;
      else {
        CustomerFullName = this.customerform.get("FullName").value;
        let Names = CustomerFullName.split(" ");
        if(Names && Names.length > 0) {
          this.customerform.get("FirstName").setValue(Names.shift());
          this.customerform.get("LastName").setValue(Names.join(" "));
        }
      }

      if(this.customerform.controls.Mobile.errors != null)
      errorFlag = true;
      
      if(this.customerform.controls.Email.errors != null)
      errorFlag = true;
      
      if(errorFlag) {
        Toast("Name, Mobil and Email is required field.");
        return;
      }
      
      let custId = this.customerform.get("CustomerUid").value;
      let customerData = this.customerform.value;
      if(custId != "")
        customerData["UserUid"] = Number(custId);
      if(!errorFlag) {
        let formData = new FormData();
        formData.append("image", this.UserImage);
        formData.append("userDetail", JSON.stringify(customerData));
  
        this.http.upload("registration/Customer", formData).then(
          data => {
            if (data) {
              Toast("Customer created/updated successfully.");
            } else {
              Toast("Server error. Please contact to admin.");
            }
          },
          error => {
            Toast("Server error. Please contact to admin.");
          }
        );
      } else {
        Toast("Please fill all mandatory fields");
      }
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
            Toast("Record inserted successfully");
            this.storage.set(data);
            this.ClearAllFields();
          } else {
            Toast("Fail to inserted.");
          }
        },
        error => {
          Toast(
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

