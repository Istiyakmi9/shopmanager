import { ITable } from "./../../providers/Generic/Interface/ITable";
import { Component, OnInit } from "@angular/core";
import { AjaxService } from "src/providers/ajax.service";
import { CommonService, GetReportData, SearchRequest } from "../../providers/common-service/common.service";
import * as $ from "jquery";
import { Customer, VendorColumn } from "src/providers/constants";
import { VendorReport } from "./../../providers/constants";
import { iNavigation } from "src/providers/iNavigation";

@Component({
  selector: "app-vendorreport",
  templateUrl: "./vendorreport.component.html",
  styleUrls: ["./vendorreport.component.scss"]
})
export class VendorreportComponent implements OnInit {
  Record: any = [];
  searchRequest: SearchRequest;
  GridData: ITable;
  TotalCount: any = 0;
  Pagination: [];
  CurrentPageIndex: any;
  constructor(private http: AjaxService, private commonService: CommonService,
    private nav: iNavigation) {
    this.LoadPage("1=1", "", 1, 10);
  }

  ngOnInit() {
    this.searchRequest = new SearchRequest();
    this.searchRequest.SearchString = "1=1";
    this.LoadData();
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
    });
  }

  LoadData() {
    this.http.post("itemandgoods/GetStocks", this.searchRequest).then(response => {
      if (response.responseBody) {
        let data = GetReportData(response.responseBody, this.searchRequest);
        if (data)
          this.GridData = data;
      }
    });
  }

  OnEdit(e: any) {
    this.nav.navigate(Customer, e);
  }

  GetNextPage(e: any) {

  }

  GetPreviousPage(e: any) {

  }

  alidateMoney(e: any) {
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
