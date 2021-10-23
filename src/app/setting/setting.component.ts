import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import { ApplicationStorage } from "../../providers/ApplicationStorage";
import { CommonService } from "./../../providers/common-service/common.service";
import { AjaxService } from "src/providers/ajax.service";
import * as $ from "jquery";

interface CatagoryWithTaxes {
  CatagoryUid: string;
  ParentCatagoryUid: string;
  CatagoryName: string;
  Description: string;
  SGSTValue: number;
  IGSTValue: number;
  CGSTValue: number;
}

const PageSetting = "MasterDetail";
@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.scss"]
})
export class SettingComponent implements OnInit {
  CatagoryDetail: Array<any> = [{
    value: '',
    text: ''
  }];

  selectMode: boolean = false;
  placehosderName: string = "No item available";
  FieldDisabled: boolean = true;
  CatagoryForm: FormGroup = null;

  constructor(
    private storage: ApplicationStorage,
    private common: CommonService,
    private http: AjaxService,
    private fb: FormBuilder
  ) {
    this.CatagoryForm = this.fb.group({
      CatagoryName: new FormControl("", Validators.required),
      CatagoryUid: new FormControl(0),
      Description: new FormControl(""),
      IGST: new FormControl(""),
      CGST: new FormControl(""),
      SGST: new FormControl(""),
      IsNew: new FormControl(true)
    });
  }

  ngOnInit() {
    let catagory = this.storage.get(null, "catagory");
    if(catagory) {
      let index = 0;
      this.CatagoryDetail = [];
      while(index < catagory.length) {
        this.CatagoryDetail.push({
          text: catagory[index].CatagoryName,
          value: catagory[index].CatagoryUid
        });
        index++;
      }
    }
  }

  AddNewRule() {
    if(this.CatagoryForm.valid) {
      if(this.CatagoryForm.controls.CatagoryName.errors != null)
        this.common.ShowToast("Catagory name is required field");

      this.http.post("master/AddOrUpdateCatagory", this.CatagoryForm.value).then(response => {
        if(response.responseBody) {
          if(response.responseBody == "Insert Or update successfull.")
            this.common.ShowToast(response.responseBody);
        }
      });
    }
  }

  ClearAll() {

  }

  ClaerForm() {
    this.ClearAll();
  }

  changeCatagoryFieldType() {
    this.selectMode = !this.selectMode;
  }
}
