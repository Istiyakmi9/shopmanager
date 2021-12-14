import { Component, Inject, OnInit } from "@angular/core";
import { CommonService, GetReportData, SearchRequest } from "../../providers/common-service/common.service";
import { Customer, SalesColumn } from "src/providers/constants";
import * as $ from "jquery";
import { Sales } from "./../../providers/constants";
import { ITable } from "./../../providers/Generic/Interface/ITable";
import { AjaxService } from "src/providers/ajax.service";
import { iNavigation } from "src/providers/iNavigation";

@Component({
  selector: "app-sales",
  templateUrl: "./sales.component.html",
  styleUrls: ["./sales.component.scss"]
})
export class SalesComponent implements OnInit {
  searchRequest: SearchRequest;
  GridData: ITable;
  Record: any = [];
  TotalCount: any = 0;
  Pagination: [];
  CurrentPageIndex: any;


  constructor(private commonService: CommonService,
    private http: AjaxService,
    private nav: iNavigation
  ) {
    this.BindDynamicTableDetail();
  }

  FilterPageData(e: any) { }

  BindDynamicTableDetail() {

  }

  ngOnInit() {
    this.searchRequest = new SearchRequest();
    this.searchRequest.SearchString = "1=1";
    this.LoadData();
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

  OnEdit(e: any) {
    this.nav.navigate(Customer, e);
  }

  GetNextPage(e: any) {

  }

  GetPreviousPage(e: any) {

  }
}
