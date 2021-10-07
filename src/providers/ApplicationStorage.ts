import { Injectable } from "@angular/core";
import { CommonService } from "./common-service/common.service";

@Injectable()
export class ApplicationStorage {
  $master: any = {};
  MasterCacheName = "master";
  CurrentUserDetail: any = null;
  constructor(private commonService: CommonService) {}

  reinitMaster() {
    let flag = false;
    let LocalData = localStorage.getItem("master");
    if (LocalData != null && LocalData != "" && LocalData != "{}") {
      this.$master = JSON.parse(LocalData);
      flag = true;
    }
    return flag;
  }

  public GetCurrentUser() {
    if (this.CurrentUserDetail === null)
      this.CurrentUserDetail = this.get("", "CurrentUser");
    return this.CurrentUserDetail;
  }

  set(Data: any) {
    if (Data) {
      localStorage.clear();
      Data = JSON.stringify(Data);
      Data = Data.replace(/\"null\"/g, null)
      localStorage.setItem(
        this.MasterCacheName,
        Data
      );
    }
  }

  clear() {
    localStorage.clear();
  }

  get(storageName: string = this.MasterCacheName, key: string) {
    let ResultingData = null;
    if (
      storageName === undefined ||
      storageName === null ||
      storageName === ""
    ) {
      storageName = this.MasterCacheName;
    }
    storageName = storageName.toLocaleLowerCase();
    let Data: any = localStorage.getItem(storageName);
    if (this.commonService.IsValid(Data)) {
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
    return ResultingData;
  }

  setByKey(Key: string, ModifiedData: any): boolean {
    let flag = false;
    let ResultingData = null;
    if (this.MasterCacheName != "" && Key != "") {
      this.MasterCacheName = this.MasterCacheName.toLocaleLowerCase();
      let Data: any = localStorage.getItem(this.MasterCacheName);
      if (this.commonService.IsValid(Data)) {
        Data = JSON.parse(Data);
        let DataKeys = Object.keys(Data);
        if (DataKeys.length > 0) {
          let index = 0;
          while (index < DataKeys.length) {
            if (
              DataKeys[index].toLocaleLowerCase() === Key.toLocaleLowerCase()
            ) {
              Data[DataKeys[index]] = ModifiedData;
              localStorage.setItem(this.MasterCacheName, JSON.stringify(Data));
              flag = true;
              break;
            }
            index++;
          }
        }
      }
    }
    return flag;
  }
}
