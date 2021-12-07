import { ITable } from "./../../providers/Generic/Interface/ITable";
import { Component, OnInit } from "@angular/core";
import { AjaxService } from "src/providers/ajax.service";
import { CommonService, GetReportData, SearchRequest } from "../../providers/common-service/common.service";
import * as $ from "jquery";
import { iNavigation } from "src/providers/iNavigation";
import { Customer, Product } from "src/providers/constants";

@Component({
  selector: "app-customerreport",
  templateUrl: "./customerreport.component.html",
  styleUrls: ["./customerreport.component.scss"]
})
export class CustomerreportComponent implements OnInit {
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
    this.http.post("registration/GetCustomers", this.searchRequest ).then(response => {
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
    this.nav.navigate(Customer, e);    
  }

  GetNextPage(e: any) {

  }
  
  GetPreviousPage(e: any) {

  }
}