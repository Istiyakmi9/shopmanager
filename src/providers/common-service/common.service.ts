import { Injectable } from "@angular/core";
import * as $ from "jquery";
import { FormGroup } from "@angular/forms";
import { Columns, Credit, PurchaseCredit, Rows, Total, ZerothIndex } from "./../constants";
import { MappedActionPage } from "./../MappedActionPage";

export const NAVPARAMNAME = "navigation_parameter";
@Injectable({
  providedIn: "root"
})
export class CommonService {
  LoaderEnableByAjax: boolean = false;
  LoaderEnableByPageNavigator: boolean = false;
  private CurrentPageName: string;
  private ApplicationMenu: any;
  private StorageVarName: string = "";
  private DefaultUserImagePath: string = "assets/img/user.jpg";
  private PageDetail: Array<MappedActionPage> = [];
  ErrorControlId: Array<string> = [];
  constructor() {
    this.StorageVarName = NAVPARAMNAME;
  }

  public GetCurrentPageStorageValue(): any {
    let PageObject = localStorage.getItem(this.StorageVarName);
    if (!this.IsValid(PageObject)) {
      PageObject = null;
    } else {
      let Data = JSON.parse(PageObject);
      if (Data !== "") {
        if (Data.page !== this.CurrentPageName) {
          try {
            localStorage.removeItem(this.StorageVarName);
          } catch (e) {
            console.log("Localstorage value not exists.");
          }
        } else {
          PageObject = Data.data;
        }
      }
    }
    return PageObject;
  }

  public CleanPageData() {
    try {
      localStorage.removeItem(this.StorageVarName);
    } catch (e) {}
  }

  public SetCurrentPageName(Name: string) {
    if (this.IsValidString(Name)) {
      this.CurrentPageName = Name;
    }
    this.LoadMappingInitialData();
  }

  public SetApplicationMenu() {
    let key = "ApplicationMenu";
    let Data = localStorage.getItem("master");
    let ResultingData = null;
    if (this.IsValid(Data)) {
      Data = JSON.parse(Data);
      let DataKeys = Object.keys(Data);
      if (DataKeys.length > 0) {
        let index = 0;
        while (index < DataKeys.length) {
          if (DataKeys[index].toLocaleLowerCase() === key.toLocaleLowerCase()) {
            ResultingData = Data[DataKeys[index]];
            break;
          }
          index++;
        }
      }
    }
    if (this.IsValid(ResultingData) && ResultingData.length > 0) {
      // let MenuData = JSON.parse(ResultingData[0].Menu);
      // if (this.IsValid(MenuData)) {
      //   this.ApplicationMenu = MenuData;
      // }

      this.ApplicationMenu = ResultingData;
    }
  }

  public GetApplicationMenu(): any {
    if (this.ApplicationMenu === undefined || this.ApplicationMenu === null)
      this.SetApplicationMenu();
    return this.ApplicationMenu;
  }

  public GetCurrentPageName() {
    return this.CurrentPageName;
  }

  public DefaultUserImage(): string {
    return this.DefaultUserImagePath;
  }

  public IsValid(Value): boolean {
    let Flag: boolean = false;
    if (
      Value !== null &&
      Value !== undefined &&
      Value !== "" &&
      Value !== "{}"
    ) {
      let ValueDataType = typeof Value;
      if (ValueDataType !== "undefined") {
        if (ValueDataType === "string") {
          if (Value.trim().length > 0) {
            Flag = true;
          }
        } else if (ValueDataType === "object") {
          if (Array.isArray(Value)) {
            if (Value.length > 0) Flag = true;
          } else if (Value instanceof Date) {
            Flag = true;
          } else {
            if (Object.keys(Value).length > 0) Flag = true;
          }
        }
      }
    }
    return Flag;
  }

  public IsValidString(Data: any): boolean {
    let flag = false;
    let type = typeof Data;
    if (type === "undefined") return flag;
    if (type === "string") {
      if (Data !== null) {
        flag = true;
        if (Data.trim() === "") flag = false;
      }
    } else if (type === "number") flag = true;
    return flag;
  }

  public NumericOnly(e: any): boolean {
    let flag = false;
    if (e >= 48 && e <= 57) flag = true;
    return flag;
  }

  public IsValidField(Columns): boolean {
    let Data = Columns;
    let flag = false;
    if ((Data !== null && Data !== "" && Data !== undefined) || Data !== "{}") {
      let Type = typeof Data;
      if (Type === "string") {
        if (Data.trim().length > 0) flag = true;
      } else if (Type === "object") {
        if (Array.isArray(Data)) {
          if (Data.length > 0) flag = true;
        } else {
          if (Object.keys(Data).length > 0) flag = true;
        }
      }
    }
    return flag;
  }

  ValidateField(formid: string) {
    $("#" + formid)
      .find("*[required]")
      .blur(($event: any) => {
        if ($($event.target).is("input")) {
          if (this.IsValidField($(event.currentTarget).val())) {
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

  public IsMoney(value: any) {
    let flag = true;
    if (!this.IsNumeric(value)) {
      if (value != ".") {
        flag = false;
      }
    }
    return flag;
  }

  public IsValidDataSet(Dataset: string): boolean {
    let flag = false;
    if (Dataset !== null && Dataset !== "") {
      let Keys = Object.keys(Dataset);
      if (Keys.length > 0) {
        flag = true;
      }
    }
    return flag;
  }

  public IsValidFilterResponse(Dataset: string): boolean {
    let flag = false;
    if (Dataset !== null && Dataset !== "") {
      let Keys = Object.keys(Dataset);
      if (Keys.length === 2) {
        if (
          Keys.indexOf("Record") !== -1 &&
          Keys.indexOf("RecordCount") !== -1
        ) {
          flag = true;
        } else {
          this.ShowToast("Getting some error. Please contact admin.");
        }
      }
    }
    return flag;
  }

  public ValidateForm(Keys): any {
    let $elem = null;
    let IsValidForm = 0;
    let index = 0;
    while (index < Keys.length) {
      $elem = $("#" + Keys[index]);
      if (this.IsValid($elem.attr("required"))) {
        if ($elem.val() != null) {
          if ($elem.val().trim().length == 0) {
            $elem.addClass("error-field");
            IsValidForm++;
          }
        }
      }
      index++;
    }
    return IsValidForm;
  }

  public IsNumeric(data: any): boolean {
    let flag = false;
    try {
      let integerData = parseInt(data);
      if (!isNaN(integerData)) flag = true;
      else flag = false;
    } catch (e) {
      return false;
    }
    return flag;
  }

  public ValidateFormGroup(purchaseFormGroup: FormGroup): any {
    let FormData = {};
    if (typeof purchaseFormGroup["controls"] !== "undefined") {
      if (Array.isArray(purchaseFormGroup.controls)) {
        let ControlData: any = purchaseFormGroup.controls;
        let ValidArrayData = ControlData.filter(x => x.touched === true);
        let ValuedArrayData = [];
        let index = 0;
        while (index < ValidArrayData.length) {
          ValuedArrayData[index] = this.ValidateFormGroup(
            ValidArrayData[index]
          );
          index++;
        }
        return ValuedArrayData;
      } else {
        let AllKeys: Array<string> = Object.keys(purchaseFormGroup.controls);
        let keyIndex = 0;
        while (keyIndex < AllKeys.length) {
          let InnerForm: any = purchaseFormGroup.controls[AllKeys[keyIndex]];
          if (typeof InnerForm["controls"] !== "undefined") {
            FormData[AllKeys[keyIndex]] = this.ValidateFormGroup(InnerForm);
          } else {
            if (InnerForm.errors !== null) {
              if (InnerForm.errors.required && InnerForm.value === "") {
                if (this.ErrorControlId.indexOf(AllKeys[keyIndex]) === -1) {
                  this.ErrorControlId.push(AllKeys[keyIndex]);
                }
              } else {
                FormData[AllKeys[keyIndex]] = InnerForm.value;
              }
            } else {
              if (AllKeys[keyIndex] === "ItemName") {
                this.ReadAutoCompleteValue($("#CustomerByName"));
              } else if (AllKeys[keyIndex] === "Description") {
              }
              if (AllKeys[keyIndex] === "BrandName") {
              }
              FormData[AllKeys[keyIndex]] = InnerForm.value;
            }
          }
          keyIndex++;
        }
      }
    } else {
      return purchaseFormGroup;
    }
    return FormData;
  }

  public Scrollto(BodyId: string, ToElement: any) {
    if ($("#" + BodyId) !== null)
      $("#" + BodyId).animate({ scrollTop: ToElement.position().top }, "slow");
  }

  public AlphaNumericOnly(event: any) {}

  public AlphaOnly(event: any) {}

  public DateFormat(event: any) {}

  public MobileNumberFormat(number: any, count) {
    let flag = true;

    if (number >= 48 && number <= 57) {
      if (count > 9) {
        flag = false;
      }
    } else {
      flag = false;
    }
    return flag;
  }

  /* -------------------------------- Enable side menu -----------------------------------*/

  DisableActiveLinkes() {
    let $li = $("#menu").find('li[name="item-header"]');
    if ($li !== null && $li.length > 0) {
      let index = 0;
      while (index < $li.length) {
        $($li[index]).removeClass("active");
        $($li[index])
          .find("a")
          .removeClass("active");
        $($li[index])
          .find('li[type="action"]')
          .removeClass("active active-list");
        index++;
      }
    }
  }

  public HighlightNavMenu(OptionalPageName: string = null) {
    let PageName = null;
    if (OptionalPageName !== null) {
      PageName = "/" + OptionalPageName;
      this.DisableActiveLinkes();
    } else {
      PageName = location.hash.replace("#", "");
    }
    $('div[name="submenues"]').css({ display: "none" });
    let $elem = $('a[name="' + PageName + '"][type="link"]');
    if ($elem != null) {
      $elem.closest("li").addClass("active active-list");
      $elem.closest('li[name="item-header"]').addClass("active");

      $elem
        .closest('li[name="item-header"]')
        .children("a")
        .addClass("active");

      $elem.closest('div[name="submenues"]').css({ display: "block" });
    }
  }

  /* -------------------------------- End side menu -----------------------------------*/

  ShowLoaderByAjax() {
    if (!this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length === 1) {
        $("#fadeloadscreen").removeClass("d-none");
        this.LoaderEnableByAjax = true;
      }
    }
  }

  HideLoaderByAjax() {
    if (this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length > 0) {
        $("#fadeloadscreen").addClass("d-none");
        this.LoaderEnableByAjax = false;
      }
    }
  }

  ShowLoader() {
    if (!this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length === 1) {
        $("#fadeloadscreen").removeClass("d-none");
      }
    }
  }

  HideLoader() {
    if (!this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length > 0) {
        $("#fadeloadscreen").addClass("d-none");
        this.LoaderEnableByAjax = false;
      }
    }
  }

  ShowToast(Message: string, TimeSpan: number = 5) {
    // let $Toast = document.getElementById("toast");
    // if ($Toast !== null && $Toast !== undefined) {
    //   $Toast.classList.add("show");
    //   setTimeout(() => {
    //     this.HideToast();
    //   }, TimeSpan * 998);
    // }
  }

  HideToast() {
    let $Toast = document.getElementById("toast");
    if ($Toast !== null && $Toast !== undefined) {
      $Toast.classList.remove("show");
    }
  }

  GerPagination(TotalRecords: any, PageIndex: any, PageSize: any): any {
    // PageIndex always be start from 1 and not 0
    let Indexer = [];
    if (
      TotalRecords !== "" &&
      TotalRecords !== null &&
      PageIndex !== "" &&
      PageIndex !== null &&
      PageSize !== "" &&
      PageSize !== null
    ) {
      let $TotalRecord = parseInt(TotalRecords);
      let $CurrentIndex = parseInt(PageIndex) + 1;
      let TotalSlice = $TotalRecord / parseInt(PageSize);
      TotalSlice = Math.floor(TotalSlice);
      let Reminder = $TotalRecord % parseInt(PageSize);
      if (Reminder > 0) {
        TotalSlice++;
        let ExtraCounter = Math.floor($CurrentIndex / 5);
        let index = 0;
        while (index < TotalSlice) {
          Indexer.push(index + 1 + ExtraCounter * 5);
          index++;
          if (index == 5) break;
        }
      }
    }
    return Indexer;
  }

  /* -------------------- Auto dropdown actions -------------------------*/

  public ReadAutoCompleteValue($AutofillObject): any {
    let Data = null;
    if ($AutofillObject !== null) {
      if ($AutofillObject.find('input[name="iautofill-textfield"]') !== null) {
        Data = $AutofillObject.find('input[name="iautofill-textfield"]').val();
      }
    }
    return Data;
  }

  public ResetDropdown($Current: any) {
    $Current.find('input[name="iautofill-textfield"]').val("");
    $Current.find('input[name="iautofill-textfield"]').attr("data", "");
    $Current.find('input[name="iautofill-textfield"]').val("");
    $Current.find('input[name="autocomplete"]').val("");
  }

  public ReadAutoCompleteObject($AutofillObject): any {
    let Data = null;
    if ($AutofillObject !== null) {
      if ($AutofillObject.find('input[name="iautofill-textfield"]') !== null) {
        let ParsedValue = {};
        let CurrentTypeData = $AutofillObject
          .find('input[name="iautofill-textfield"]')
          .attr("data");
        if (this.IsValidString(CurrentTypeData)) {
          ParsedValue["data"] = JSON.parse(CurrentTypeData);
          ParsedValue["value"] = $AutofillObject
            .find('input[name="iautofill-textfield"]')
            .val();
        }
        Data = ParsedValue;
      }
    }
    return Data;
  }

  //--------------------- Auto dropdown action ends ---------------------*/
  /*---------------------------------------------------------------------*/

  /* -----------------------  Map dynamic table information --------------------------- */

  LoadMappingInitialData() {
    this.PageDetail.push(
      {
        Page: Credit,
        PostDeleteUrl: "",
        PostEditUrl: "UpdateSoldItemDetail",
        GetUrl: "GetCreditRecord",
        PrimaryId: "ItemUid"
      },
      {
        Page: PurchaseCredit,
        PostDeleteUrl: "",
        GetUrl: "GetPurchesCreditRecord",
        PostEditUrl: "UpdatePurchasesRecordDetail",
        PrimaryId: "PurchaseItemUid"
      },
      {
        Page: "",
        PostDeleteUrl: "",
        GetUrl: "",
        PostEditUrl: "",
        PrimaryId: ""
      }
    );
  }

  GetPageActionDetail(PageName: string): MappedActionPage {
    let mappedActionPage: MappedActionPage = null;
    let CurrentPageDetail = this.PageDetail.filter(x => x.Page === PageName);
    if (CurrentPageDetail.length > 0) {
      mappedActionPage = CurrentPageDetail[0];
    }
    return mappedActionPage;
  }

  /* --------------------------------- end ------------------------------------------ */

  MarkedErrorFields(FieldIds: Array<string>) {
    if (FieldIds !== null && FieldIds instanceof Array && FieldIds.length > 0) {
      let index = 0;
      while (index < FieldIds.length) {
        let ElemId = document.getElementById(FieldIds[index]);
        if (ElemId !== null) {
          ElemId.classList.add("error-field");
          setTimeout(() => {
            document
              .getElementById(FieldIds[index])
              .classList.remove("error-field");
          }, 2000);
        }
        index++;
      }
    }
  }
}

export function IsValidType(Value): boolean {
  let Flag: boolean = false;
  if (Value !== null && Value !== undefined && Value !== "" && Value !== "{}") {
    let ValueDataType = typeof Value;
    if (ValueDataType !== "undefined") {
      if (ValueDataType === "string") {
        if (Value.trim().length > 0) {
          Flag = true;
        }
      } else if (ValueDataType === "object") {
        if (Array.isArray(Value)) {
          if (Value.length > 0) Flag = true;
        } else if (Value instanceof Date) {
          Flag = true;
        } else {
          if (Object.keys(Value).length > 0) Flag = true;
        }
      }
    }
  }
  return Flag;
}


export function GetReportData(data: any, searchQuery: SearchRequest): any {
  let GridData: any = null;
  try{
    let Keys = Object.keys(data);
    if (Keys.indexOf(Total) !== -1 && Keys.indexOf(Rows) !== -1 && Keys.indexOf(Columns) !== -1){
      let TotalCount = data[Total][ZerothIndex][Total];
      GridData = {
        headers: data[Columns],
        rows: data[Rows],
        totalCount: TotalCount,
        pageIndex: searchQuery.PageIndex,
        pageSize: searchQuery.PageSize,
        url: "",
      };
    }
  } catch(e) {
    console.log('Error on trying to parse server returned data.');
  }
  return GridData;
}

export class SearchRequest {
  SearchString: string = "";
  SortBy: string = "";
  PageIndex: number = 1;
  PageSize: number = 10;
}

export function Toast(Message: string, TimeSpan: number = 5) {
  let $Toast = document.getElementById("toast");
  $Toast.innerHTML = Message;
  $Toast.classList.remove("d-none");
  setTimeout(() => {
    $Toast.classList.add("d-none");
  }, TimeSpan * 998);
}