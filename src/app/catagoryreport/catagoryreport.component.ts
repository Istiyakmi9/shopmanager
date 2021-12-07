import { ITable } from "./../../providers/Generic/Interface/ITable";
import { Component, OnInit } from "@angular/core";
import { CommonService, GetReportData, SearchRequest } from "../../providers/common-service/common.service";
import { AjaxService } from "src/providers/ajax.service";
import * as $ from "jquery";
import { Product } from "src/providers/constants";
import { iNavigation } from "src/providers/iNavigation";

@Component({
  selector: "app-catagoryreport",
  templateUrl: "./catagoryreport.component.html",
  styleUrls: ["./catagoryreport.component.scss"]
})
export class CatagoryreportComponent implements OnInit {
  Record: any = [];
  TotalCount: any = 0;
  Pagination: [];
  CurrentPageIndex: any;
  searchRequest: SearchRequest;
  GridData: ITable;

  constructor(
    private commonService: CommonService,
    private http: AjaxService,
    private nav: iNavigation
  ) {}

  ngOnInit() {
    this.searchRequest = new SearchRequest();
    this.searchRequest.SearchString = "1=1";
    this.LoadPage();
  }

  LoadPage() {
    this.http.post("itemandgoods/GetStocks", this.searchRequest ).then(response => {
      if(response.responseBody) {
        let data = GetReportData(response.responseBody, this.searchRequest);
        if(data)
          this.GridData = data;
      }
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

  OnEdit(e: any) {
    this.nav.navigate(Product, e);    
  }

  GetNextPage(e: any) {

  }
  
  GetPreviousPage(e: any) {

  }
}
