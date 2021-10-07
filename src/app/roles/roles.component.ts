import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { CommonService } from "./../../providers/common-service/common.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import * as $ from "jquery";
import { AjaxService } from "src/providers/ajax.service";

@Component({
  selector: "app-roles",
  templateUrl: "./roles.component.html",
  styleUrls: ["./roles.component.scss"]
})
export class RolesComponent implements OnInit {
  RolesDetail: Array<any>;
  AllowedCatagory: Array<any> = [];
  constructor(
    private commonService: CommonService,
    private storage: ApplicationStorage,
    private http: AjaxService
  ) {}

  ngOnInit() {
    this.InitPageData();
  }

  InitPageData() {
    let MenuDetail = this.storage.get(null, "ApplicationMenu");
    if (this.commonService.IsValid(MenuDetail)) {
      this.RolesDetail = [];
      let index = 0;
      while (index < MenuDetail.length) {
        if (
          MenuDetail[index]["Link"] !== null &&
          MenuDetail[index]["Link"] !== "NA"
        )
          this.RolesDetail.push({
            Index: index,
            Name: MenuDetail[index]["Catagory"],
            Icon: MenuDetail[index]["Icon"],
            Action: "No"
          });
        index++;
      }
    }
  }

  MarkPersmission(CatagoryName: number) {
    if (this.commonService.IsValid(CatagoryName)) {
      if (event.target["checked"]) {
        this.AllowedCatagory.push(CatagoryName);
        $(event.currentTarget)
          .closest("div")
          .find('span[name="permission-desc"]')
          .text("[Allow for edit and add.]");
      } else {
        if (this.AllowedCatagory.indexOf(CatagoryName) !== -1) {
          this.AllowedCatagory.splice(CatagoryName, 1);
          $(event.currentTarget)
            .closest("div")
            .find('span[name="permission-desc"]')
            .text("[Allow only for view page.]");
        }
      }
    }
  }

  SubmitForm() {
    let RolesTag: any = document.getElementById("rolename");
    let RolesName = RolesTag.value;
    if (
      RolesName !== null &&
      RolesName !== "" &&
      this.AllowedCatagory.length > 0
    ) {
      let ServerData = {
        PageNames: this.AllowedCatagory.join(","),
        RoleName: RolesName
      };

      this.http
        .post("Master/AddNewRoles", ServerData)
        .then(result => {
          if (this.commonService.IsValid(result)) {
            this.commonService.ShowToast("New roles added successfully.");
          } else {
            this.commonService.ShowToast(
              "Unable to add roles. Please contact to admin."
            );
          }
        })
        .catch(err => {
          console.log(err);
          this.commonService.ShowToast("Fail to call server.");
        });
    }
  }
}
