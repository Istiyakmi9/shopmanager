import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
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
  @ViewChild("form") Form: NgForm;
  MasterDetailData: any;
  EnableInfo: any;
  SettingDetail: any = {};
  CurrentCatagoryDetail: any = {};
  FilteringMasterData: any;
  CatagoryDetail: any = {
    data: [],
    placeholder: "Item Catagory"
  };
  FieldDisabled: boolean = true;
  NewName: boolean = true;
  enableNewnameField: boolean = false;
  autosearch: any;
  constructor(
    private storage: ApplicationStorage,
    private common: CommonService,
    private http: AjaxService
  ) {}

  ngOnInit() {
    this.BindInitialData();
    this.common.ValidateField("settingform");
    this.MasterDetailData = this.storage.get("", PageSetting);
    // if (this.common.IsValid(this.MasterDetailData)) {
    //   this.MasterDetailData.forEach(element => {
    //     this.SettingDetail[element.TypeName.toLocaleLowerCase()] = {
    //       value: element.TypeValue,
    //       uid: this.common.IsValidString(element.MasterDetailUid)
    //         ? element.MasterDetailUid
    //         : ""
    //     };
    //     this.SettingDetail["desc"] = "";
    //   });
    // } else {
    //   this.SettingDetail = {
    //     igst: {},
    //     sgst: {},
    //     cgst: {},
    //     desc: ""
    //   };
    // }

    this.SettingDetail = {
      igst: {},
      sgst: {},
      cgst: {},
      desc: ""
    };
  }

  EnableNewName() {
    if (this.NewName) {
      this.NewName = false;
    } else {
      this.NewName = true;
    }
  }

  HandleSelectedCatagory(e: any) {
    if (this.common.IsValidString(e)) {
      let MasterData = this.storage.get(null, "MasterDetail");
      let Data = JSON.parse(e);
      if (Data.data !== "") {
        this.CurrentCatagoryDetail["Uid"] = Data.data.Uid;
        this.enableNewnameField = true;
      } else {
        this.CurrentCatagoryDetail["Uid"] = Data.data;
        this.enableNewnameField = false;
      }
      this.CurrentCatagoryDetail["value"] = Data.value;
      if (this.common.IsValid(MasterData)) {
        let Result = MasterData.filter(x => x.CatagoryUid === Data.data.Uid);
        if (Result.length > 0) {
          let Catagory = this.storage.get(null, "Catagory");
          let CurrentCatagory = {};
          let CurrentCatagoryObject = Catagory.filter(
            x => x.CatagoryUid === Data.data.Uid
          );
          if (CurrentCatagoryObject.length > 0)
            CurrentCatagory = CurrentCatagoryObject[0];
          else CurrentCatagory["Description"] = "Description is not available";
          let IGSTDetail = null;
          let SGSTDetail = null;
          let CGSTDetail = null;
          SGSTDetail = Result.filter(x => x.TypeName === "SGST");
          if (SGSTDetail.length > 0) SGSTDetail = SGSTDetail[0];
          else SGSTDetail = {};

          CGSTDetail = Result.filter(x => x.TypeName === "CGST");
          if (CGSTDetail.length > 0) CGSTDetail = CGSTDetail[0];
          else CGSTDetail = {};

          IGSTDetail = Result.filter(x => x.TypeName === "IGST");
          if (IGSTDetail.length > 0) IGSTDetail = IGSTDetail[0];
          else IGSTDetail = {};

          this.SettingDetail = {
            igst: {
              value: IGSTDetail.TypeValue,
              uid: IGSTDetail.MasterDetailUid
            },
            sgst: {
              value: SGSTDetail.TypeValue,
              uid: SGSTDetail.MasterDetailUid
            },
            cgst: {
              value: CGSTDetail.TypeValue,
              uid: CGSTDetail.MasterDetailUid
            },
            desc: CurrentCatagory["Description"]
          };
        } else {
          this.SettingDetail = {
            igst: {},
            sgst: {},
            cgst: {},
            desc: ""
          };
        }
        this.FieldDisabled = false;
      } else {
        this.FieldDisabled = false;
        this.common.ShowToast(
          "For new catagory please enter description and GST detail."
        );
      }
    }
  }

  BindInitialData() {
    this.FilteringMasterData = this.storage.get(null, "Catagory");
    let Data = this.FilteringMasterData;
    let CatagoryData = [];
    if (Data !== null && Data.length > 0) {
      let index = 0;
      while (index < Data.length) {
        if (
          CatagoryData.filter(x => x.value.Uid === Data[index].CatagoryUid)
            .length === 0
        ) {
          if (
            this.common.IsValidString(Data[index].CatagoryName) &&
            this.common.IsValidString(Data[index].CatagoryUid)
          ) {
            CatagoryData.push({
              value: Data[index].CatagoryName,
              data: {
                Uid: Data[index].CatagoryUid,
                Type: "Catagory"
              }
            });
          }
        }
        index++;
      }
      this.CatagoryDetail["data"] = CatagoryData;
      this.CatagoryDetail["placeholder"] = "Item Catagory";
    }
  }

  AddNewRule() {
    if (this.Form.valid) {
      let Data = this.Form.value;
      if (this.common.IsValid(Data)) {
        let CatagoryUid = "";
        let CatagoryName = "";
        if (this.common.IsValidString(this.CurrentCatagoryDetail["Uid"])) {
          CatagoryUid = this.CurrentCatagoryDetail["Uid"];
        }

        CatagoryName = this.CurrentCatagoryDetail["value"];
        if (!this.NewName) {
          CatagoryName = Data["newname"];
        }

        if (CatagoryName !== null && CatagoryName !== "") {
          let FormObject = null;
          FormObject = {};
          FormObject["CatagoryUid"] = CatagoryUid;
          FormObject["ParentCatagoryUid"] = null;
          FormObject["CatagoryName"] = CatagoryName;
          FormObject["Description"] = Data["desc"];
          FormObject["SGSTValue"] = parseFloat(Data["sgst"]);
          FormObject["IGSTValue"] = parseFloat(Data["igst"]);
          FormObject["CGSTValue"] = parseFloat(Data["cgst"]);
          FormObject["CGstUid"] = $("#cgst").attr("Uid");
          FormObject["IGstUid"] = $("#igst").attr("Uid");
          FormObject["SGstUid"] = $("#sgst").attr("Uid");
          if (FormObject.length > 0 || FormObject !== null) {
            this.http.post("ItemAndGoods/CatagoryWithTaxes", FormObject).then(
              data => {
                if (this.common.IsValid(data)) {
                  let Tables = Object.keys(data);
                  if (
                    Tables.indexOf("Catagory") !== -1 &&
                    Tables.indexOf("Brands") !== -1 &&
                    Tables.indexOf("Stocks") !== -1 &&
                    Tables.indexOf("MasterDetail") !== -1
                  ) {
                    this.storage.setByKey("Catagory", data["Catagory"]);
                    this.storage.setByKey("Brands", data["Brands"]);
                    this.storage.setByKey("Stocks", data["Stocks"]);
                    this.storage.setByKey("MasterDetail", data["MasterDetail"]);
                    this.common.ShowToast("Record inserted successfully");
                    this.ClearAll();
                    this.BindInitialData();
                  } else {
                    this.common.ShowToast(
                      "Data got inserted successfully but getting some problem. To resolve this please login again."
                    );
                  }
                } else {
                  this.common.ShowToast(
                    "Fail to insert data or getting some server error. Please contact to admin."
                  );
                }
              },
              err => {
                this.common.ShowToast("Fail to insert or update.");
              }
            );
          }
        } else {
          this.common.ShowToast(
            "Catagory name is invalid. Please contact to admin."
          );
        }
      } else {
        this.common.ShowToast("Form data is invalid");
      }
    }
  }

  ClearAll() {
    this.SettingDetail = {
      igst: {},
      sgst: {},
      cgst: {},
      desc: ""
    };

    this.NewName = true;
    $("#Catagory")
      .find('input[name="iautofill-textfield"]')
      .val("")
      .attr("data", "");
  }

  ClaerForm() {
    this.ClearAll();
  }
}
