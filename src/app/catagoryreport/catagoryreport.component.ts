import { ITable } from "./../../providers/Generic/Interface/ITable";
import { Component, OnInit } from "@angular/core";
import { CommonService } from "../../providers/common-service/common.service";
import { AjaxService } from "src/providers/ajax.service";
import * as $ from "jquery";
import { Router } from "@angular/router";
import { CatagoryReportColumn } from "src/providers/constants";

@Component({
  selector: "app-catagoryreport",
  templateUrl: "./catagoryreport.component.html",
  styleUrls: ["./catagoryreport.component.scss"]
})
export class CatagoryreportComponent implements OnInit {
  DynamicTableDetail: ITable;
  Record: any = [];
  TotalCount: any = 0;
  Pagination: [];
  CurrentPageIndex: any;
  constructor(
    private commonService: CommonService,
    private http: AjaxService,
    private route: Router
  ) {}

  ngOnInit() {
    let searchStr = "1=1";
    let pageIndex = 1;
    let pageSize = 10;
    let sortBy = "";
    $("#hdnsearchstr").val(searchStr);
    $("#hdnsortBy").val(sortBy);
    $("#hdnpageSize").val(pageSize);
    $("#hdnpageIndex").val(pageIndex);
    this.LoadPage("1=1", "", 1, 10);
  }

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
      this.DynamicTableDetail = {
        rows: CatagoryReportColumn,
        url: "ItemAndGoods/GetStocksDetailByFilter",
        SearchStr: searchStr,
        SortBy: sortBy
      };
    });
  }

  ValidateMoney(e: any) {
    if (e.key == ".") {
      if (
        $(event.currentTarget)
          .val()
          .indexOf(".") != -1
      ) {
        event.preventDefault();
      }
    } else if (!this.commonService.IsNumeric(e.key)) {
      event.preventDefault();
    }
  }

  AllowNumberOnly(e: any) {
    if (!this.commonService.IsNumeric(e.key)) {
      event.preventDefault();
    }
  }
}
