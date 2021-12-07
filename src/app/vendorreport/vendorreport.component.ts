import { ITable } from "./../../providers/Generic/Interface/ITable";
import { Component, OnInit } from "@angular/core";
import { AjaxService } from "src/providers/ajax.service";
import { CommonService } from "../../providers/common-service/common.service";
import * as $ from "jquery";
import { VendorColumn } from "src/providers/constants";
import { VendorReport } from "./../../providers/constants";

@Component({
  selector: "app-vendorreport",
  templateUrl: "./vendorreport.component.html",
  styleUrls: ["./vendorreport.component.scss"]
})
export class VendorreportComponent implements OnInit {
  Record: any = [];
  TotalCount: any = 0;
  Pagination: [];
  CurrentPageIndex: any;
  constructor(private http: AjaxService, private commonService: CommonService) {
    this.LoadPage("1=1", "", 1, 10);
  }

  ngOnInit() {}

  LoadPage(
    searchStr: string,
    sortBy: string,
    pageIndex: any,
    pageSize: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      $("#hdnsearchstr").val(searchStr);
      $("#hdnsortBy").val(sortBy);
      $("#hdnpageSize").val(pageSize);
      $("#hdnpageIndex").val(pageIndex);
      pageIndex = pageIndex - 1;
    });
  }
}
