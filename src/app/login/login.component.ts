import {
  Component,
  OnInit,
} from "@angular/core";
import { AjaxService } from "../../providers/ajax.service";
import { ApplicationStorage } from "../../providers/ApplicationStorage";
import * as $ from "jquery";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators
} from "@angular/forms";
import { CommonService } from "./../../providers/common-service/common.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  title = "Business manager";
  initialUrl: string = "";
  catagory: any = {};
  SignupData: FormGroup;
  SignInForm: FormGroup;


  constructor(
    private http: AjaxService,
    private router: Router,
    private local: ApplicationStorage,
    private commonService: CommonService,
    private fb: FormBuilder
  ) {
    this.SignInForm = this.fb.group({
      Username: new FormControl("", Validators.required),
      Password: new FormControl("", Validators.required)
    });

    this.SignupData = this.fb.group({
      Fullname: new FormControl("", Validators.required),
      UserName: new FormControl("", Validators.required),
      Password: new FormControl("", Validators.required),
      ConfirmPassword: new FormControl("", Validators.required),
      RegistrationCode: new FormControl("", Validators.required),
      ShopName: new FormControl("", Validators.required),
      MobileNo: new FormControl("", Validators.required),
      ShopPhoneNo: new FormControl(""),
      EmailId: new FormControl(""),
      BillCode: new FormControl("", Validators.required)
    });
  }

  ngOnInit() {}

  LoginUser() {
    this.LoadMasterData();
  }

  ResetSignUpForm() {
    this.SignupData.controls["UserName"].setValue("");
    this.SignupData.controls["Password"].setValue("");
    this.SignupData.controls["ConfirmPassword"].setValue("");
    this.SignupData.controls["RegistrationCode"].setValue("");
    this.SignupData.controls["ShopName"].setValue("");
    this.SignupData.controls["MobileNo"].setValue("");

    $("#signup").hide();
    $("#signin").fadeIn();
  }

  MobileNumber(e: any) {
    if (
      !this.commonService.MobileNumberFormat(
        e.which,
        $(event.currentTarget).val().length
      )
    ) {
      event.preventDefault();
    }
  }

  SignupUser() {
    let ErrorFields: Array<string> = [];
    let Data = {
      Fullname: "",
      UserName: "",
      Password: "",
      ConfirmPassword: "",
      RegistrationCode: "",
      ShopName: "",
      MobileNo: "",
      ShopPhoneNo: "",
      EmailId: "",
      BillCode: ""
    };

    if (!this.SignupData.get("Fullname").valid) ErrorFields.push("Fullname");
    else Data.Fullname = this.SignupData.get("Fullname").value;
    if (!this.SignupData.get("UserName").valid) ErrorFields.push("UserName");
    else Data.UserName = this.SignupData.get("UserName").value;
    if (!this.SignupData.get("Password").valid) ErrorFields.push("Password");
    else Data.Password = this.SignupData.get("Password").value;
    if (!this.SignupData.get("ConfirmPassword").valid)
      ErrorFields.push("ConfirmPassword");
    else Data.ConfirmPassword = this.SignupData.get("ConfirmPassword").value;
    if (!this.SignupData.get("RegistrationCode").valid)
      ErrorFields.push("RegistrationCode");
    else Data.RegistrationCode = this.SignupData.get("RegistrationCode").value;
    if (!this.SignupData.get("ShopName").valid) ErrorFields.push("ShopName");
    else Data.ShopName = this.SignupData.get("ShopName").value;
    if (!this.SignupData.get("MobileNo").valid) ErrorFields.push("MobileNo");
    else Data.MobileNo = this.SignupData.get("MobileNo").value;
    if (!this.SignupData.get("BillCode").valid) ErrorFields.push("BillCode");
    else Data.BillCode = this.SignupData.get("BillCode").value;

    Data.ShopPhoneNo = this.SignupData.get("ShopPhoneNo").value;
    Data.EmailId = this.SignupData.get("EmailId").value;
    if (ErrorFields.length === 0) {
      if (
        this.SignupData.get("ConfirmPassword").value ===
        this.SignupData.get("Password").value
      ) {
        this.http.post("Authentication/ShopSigup", Data).then(
          result => {
            if (this.commonService.IsValidString(result)) {
              this.commonService.ShowToast("Registration done successfully");
              this.ResetSignUpForm();
            }
          },
          error => {
            this.commonService.ShowToast(
              "Registration fail. Please contact to admin."
            );
          }
        );
      } else {
        this.commonService.ShowToast("Password & ConfirmPassword mismatch.");
      }
    } else {
      this.commonService.ShowToast("All field marked (*) is mandatory.");
    }
  }

  doLogin() {
    if(this.SignInForm.valid) {
      let username = this.SignInForm.get("Username").value;
      let password = this.SignInForm.get("Password").value;

      if(username !== "" && password !== "") {
        this.AuthenticateCredential(this.SignInForm.value);
      }
    }
  }

  AuthenticateCredential(Credential: any) {
    if (this.commonService.IsValid(Credential)) {
      if (Credential.Username && Credential.Password) {
        this.http.post("login/auth", Credential).then(response => {
            if(response.responseBody) {
              this.local.set(response.responseBody);
              this.commonService.SetApplicationMenu();
              this.router.navigate(["./dashboard"]);
            } else {
            }
          },
          error => {
            this.commonService.ShowToast(
              "Invalid username or password. Please try again later."
            );
          }
        );
      }
    }
  }

  EnableSignup() {
    $("#signin").hide();
    $("#signup").fadeIn();
  }

  EnableLogin() {
    $("#signin").fadeIn();
    $("#signup").hide();
  }

  LoadMasterData() {
    this.http.get("Master/PageMasterData").then(
      data => {
        this.local.set(data);
      },
      error => {
        this.commonService.ShowToast("Unable to fetch Master Data");
      }
    );
  }

  isScrollbarBottom(container) {
    var height = container.outerHeight();
    var scrollHeight = container[0].scrollHeight;
    var scrollTop = container.scrollTop();
    if (scrollTop >= scrollHeight - height) {
      return true;
    }
    return false;
  }
}
