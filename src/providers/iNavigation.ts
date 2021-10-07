import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService, NAVPARAMNAME } from "./common-service/common.service";

@Injectable()
export class iNavigation {
  constructor(private route: Router, private common: CommonService) {}

  public navigate(Path: string, Parameter: any) {
    let PageParamter: any = "";
    if (Path !== null && Path !== "") {
      if (Parameter !== null && Parameter !== "") {
        PageParamter = JSON.stringify({ page: Path, data: Parameter });
      }
      localStorage.setItem(NAVPARAMNAME, PageParamter);
      this.common.HighlightNavMenu(Path);
      this.route.navigate([Path]);
    } else {
      this.common.ShowToast("Invalid component path passed.");
    }
  }

  public getValue(): any {
    let ParsedData = null;
    let Data = localStorage.getItem(NAVPARAMNAME);
    if (this.common.IsValid(Data)) {
      try {
        ParsedData = JSON.parse(Data);
      } catch (e) {
        console.log(JSON.stringify(e));
        this.common.ShowToast(
          "Unable to get route data. Please contact admin."
        );
      }
    }
    return ParsedData;
  }

  public resetValue() {
    localStorage.removeItem(NAVPARAMNAME);
  }
}
