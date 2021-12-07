import { PurchaseItems } from "./../../providers/constants";
import { Component, OnInit } from "@angular/core";
import { CommonService } from "src/providers/common-service/common.service";
import { PurchaseItemsColumn } from "src/providers/constants";
import { ITable } from "src/providers/Generic/Interface/ITable";

@Component({
  selector: "app-purchaseitems",
  templateUrl: "./purchaseitems.component.html",
  styleUrls: ["./purchaseitems.component.scss"]
})
export class PurchaseitemsComponent implements OnInit {
  constructor(private commonService: CommonService) {
    this.BindDynamicTableDetail();
  }

  FilterPageData(e: any) {}

  BindDynamicTableDetail() {
    
  }

  ngOnInit() {}
}
