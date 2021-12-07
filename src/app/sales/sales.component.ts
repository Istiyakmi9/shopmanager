import { Component, Inject, OnInit } from "@angular/core";
import { CommonService } from "../../providers/common-service/common.service";
import { SalesColumn } from "src/providers/constants";
import { Sales } from "./../../providers/constants";
import { ITable } from "./../../providers/Generic/Interface/ITable";

@Component({
  selector: "app-sales",
  templateUrl: "./sales.component.html",
  styleUrls: ["./sales.component.scss"]
})
export class SalesComponent implements OnInit {
  constructor(private commonService: CommonService) {
    this.BindDynamicTableDetail();
  }

  FilterPageData(e: any) {}

  BindDynamicTableDetail() {
   
  }

  ngOnInit() {}
}
