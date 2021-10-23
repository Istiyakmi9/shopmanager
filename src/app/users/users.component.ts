import { Component, OnInit, ViewChild } from "@angular/core";
import {
  NgForm,
  FormBuilder,
  FormGroup,
  AbstractControl,
  Validators
} from "@angular/forms";
import { CommonService } from "../../providers/common-service/common.service";
import * as $ from "jquery";
import { AjaxService } from "../../providers/ajax.service";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"]
})
export class UsersComponent implements OnInit {
  @ViewChild("userForm") UserFormDetail: NgForm;
  IsNonAdmin: boolean = true;
  IsMale: boolean = true;
  Roles: any = [];
  NewUserDetail: FormGroup;
  constructor(
    private commonService: CommonService,
    private http: AjaxService,
    private fb: FormBuilder
  ) {
    this.NewUserDetail = this.fb.group({
      FullName: this.fb.control("", Validators.required),
      FirstName: this.fb.control(""),
      LastName: this.fb.control(""),
      MobileNo: this.fb.control(""),
      AlternetNo: this.fb.control(""),
      Dob: this.fb.control(""),
      EmailId: this.fb.control(""),
      RoleUid: this.fb.control(""),
      State: this.fb.control(""),
      City: this.fb.control(""),
      Gender: this.fb.control(true),
      Address: this.fb.control("")
    });
    this.http.get("Registration/GetRoles").then(
      data => {
        if (this.commonService.IsValid(data)) {
          this.Roles = data["Record"];
        } else {
          this.commonService.ShowToast("Unable to get roles data.");
        }
      },
      err => {
        this.commonService.ShowToast("Server error. Please contact to admin.");
      }
    );
  }

  ngOnInit() {
    this.OnBlurFieldValidation();
  }

  OnBlurFieldValidation() {
    $("#user-form")
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

  SubmitForm() {
    let FormData = this.NewUserDetail;
    if (this.commonService.IsValid(FormData)) {
      FormData.value.Gender = this.IsMale;
      let ErrorFields = [];
      let Keys = Object.keys(FormData.value);
      let index = 0;
      let data = null;
      while (index < Keys.length) {
        if (FormData.get(Keys[index]).validator !== null) {
          let validator = FormData.get(Keys[index]).validator(
            {} as AbstractControl
          );
          if (validator) {
            data = FormData.get(Keys[index]).value;
            if (!this.commonService.IsValid(data)) {
              ErrorFields.push(Keys[index]);
            }
            if (Keys[index] === "FullName") {
              let PartedName = FormData.get("FullName").value.split(" ");
              if (PartedName.length > 1) {
                FormData.value.FirstName = PartedName[0];
                let Name = PartedName.join(" ");
                FormData.value.LastName = Name.replace(PartedName[0], "");
              }
            }
          }
        }
        index++;
      }

      if (ErrorFields.length === 0) {
        // this.http.post("Registration/AppUser", FormData.value).then(data => {
        //   if (data.indexOf("successfully") != -1) {
        //     this.CleanUpForm();
        //     this.commonService.ShowToast(data);
        //   } else {
        //     this.commonService.ShowToast(
        //       "User adding fails. Please try again later."
        //     );
        //   }
        // });
      } else {
        this.commonService.ShowToast(
          "Required fields: " + ErrorFields.join(", ")
        );
      }
    }
    // let Keys = Object.keys(this.UserFormDetail.value);
    // if (this.commonService.ValidateForm(Keys) === 0) {
    //   if (this.UserFormDetail.valid) {
    //     this.AppUser = this.UserFormDetail.value;
    //     if ($("#Male").prop("checked")) {
    //       this.AppUser["Gender"] = true;
    //     } else {
    //       this.AppUser["Gender"] = false;
    //     }

    //     let UserName = this.AppUser.FullName.split(" ");
    //     if (UserName.length > 1) {
    //       let FirstName = UserName.splice(0, 1);
    //       this.AppUser["FirstName"] = FirstName[0];
    //       this.AppUser["LastName"] = UserName.join(" ");
    //     } else {
    //       this.AppUser["FirstName"] = this.AppUser.FullName.split(" ")[0];
    //       this.AppUser["LastName"] = "";
    //     }

    //     this.http.post("Registration/AppUser", this.AppUser).then(data => {
    //       if (data.indexOf("successfully") != -1) {
    //         this.CleanUpForm();
    //         this.commonService.ShowToast("User added successfully");
    //       } else if (data.length > 0) {
    //         this.commonService.ShowToast(data);
    //       } else {
    //         this.commonService.ShowToast(
    //           "User adding fails. Please try again later."
    //         );
    //       }
    //     });
    //   }
    // }
  }

  CleanUpForm() {}

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

  ManageCheckbox(type: boolean) {
    if (type) {
      $("#Female")
        .removeAttr("checked")
        .prop("checked", false);
      $("#Male")
        .attr("checked", true)
        .prop("checked", true);
      this.IsMale = true;
    } else {
      $("#Male")
        .removeAttr("checked")
        .prop("checked", false);
      $("#Female")
        .attr("checked", true)
        .prop("checked", true);
      this.IsMale = true;
    }
  }
}
