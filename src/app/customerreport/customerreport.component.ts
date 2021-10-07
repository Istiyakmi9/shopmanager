import { ITable } from "./../../providers/Generic/Interface/ITable";
import { Component, OnInit, Inject } from "@angular/core";
import { AjaxService } from "src/providers/ajax.service";
import { CommonService } from "../../providers/common-service/common.service";
import * as $ from "jquery";
import { iNavigation } from "src/providers/iNavigation";
import { Customer, CustomerColumn } from "src/providers/constants";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-customerreport",
  templateUrl: "./customerreport.component.html",
  styleUrls: ["./customerreport.component.scss"]
})
export class CustomerreportComponent implements OnInit {
  DynamicTableDetail: ITable;
  Record: any = [];
  TotalCount: any = 0;
  Pagination: [];
  CurrentPageIndex: any;
  animal: string;
  name: string;
  constructor(
    private http: AjaxService,
    private commonService: CommonService,
    private nav: iNavigation,
    public dialog: MatDialog
  ) {
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
      this.DynamicTableDetail = {
        rows: CustomerColumn,
        url: "Registration/CustomerReport",
        SearchStr: searchStr,
        SortBy: sortBy,
        editUrl: Customer
      };
    });
  }
}
