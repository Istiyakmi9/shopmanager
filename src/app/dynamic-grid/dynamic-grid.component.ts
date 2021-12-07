import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ITable } from "src/providers/Generic/Interface/ITable";
import { IColumns } from "src/providers/Generic/Interface/IColumns";
import {
  IsValidType,
  CommonService
} from "src/providers/common-service/common.service";
import * as $ from "jquery";

@Component({
  selector: "app-dynamic-grid",
  templateUrl: "./dynamic-grid.component.html",
  styleUrls: ["./dynamic-grid.component.scss"]
})
export class DynamicGridComponent implements OnInit {
  IsEmptyRow: boolean = false;
  TotalHeaders: number = 0;
  GridData: any;
  TableRows: any;
  Headers: Array<IColumns>;
  IsStriped: boolean = true;
  pageIndex: number = 0;
  TotalPageCount: number = 0;
  DisableNext: boolean;
  DisablePrev: boolean;
  isInlineContextClassUsed: boolean = false;
  @Output() Edit = new EventEmitter();
  @Output() Delete = new EventEmitter();
  @Output() Next = new EventEmitter();
  @Output() Previous = new EventEmitter();
  constructor(private commonService: CommonService) {}

  @Input()
  set Data(Data: ITable) {
    if (IsValidType(Data)) {
      if(Data.inlineContent)
        this.isInlineContextClassUsed = true;
      let cols = Object.keys(Data);
      if (cols.indexOf("headers") === -1 || cols.indexOf("rows") === -1) {
        this.commonService.ShowToast(
          "Object required [headers and rows] fields."
        );
      } else {
        this.GridData = Data["rows"];
        this.Headers = Data["headers"];
        if (
          Data["totalCount"] !== null &&
          Data["pageSize"] !== null &&
          Data["pageIndex"] !== null
        ) {
          let TotalRecordCount = Number(Data["totalCount"]);
          let pageSize = Data["pageSize"];
          this.pageIndex = Data["pageIndex"];
          if (TotalRecordCount > 0) {
            try {
              this.TotalPageCount = parseInt(
                (TotalRecordCount / pageSize).toString()
              );
              if (TotalRecordCount % pageSize > 0) {
                this.TotalPageCount++;
              }
            } catch (e) {
              this.commonService.ShowToast(
                "Invalid record count and pagesize passed."
              );
            }
          } else {
            this.TotalPageCount = 0;
            this.pageIndex = 0;
          }
          this.MangePaging();
        }
        let TotalHeaders = this.Headers.filter(x => x.type !== "hidden").length;
      }
    }
  }

  @Input()
  set Stripe(isStripe: boolean) {
    if (IsValidType(isStripe)) {
      this.IsStriped = isStripe;
    } else {
      this.IsStriped = false;
    }
  }

  EditCurrent() {
    let JsonData = $(event.currentTarget)
      .closest("tr")
      .find('input[name="currentObject"]')
      .val();
    if (IsValidType(JsonData)) {
      this.Edit.emit(JsonData);
    }
  }

  DeleteCurrent() {
    let JsonData = $(event.currentTarget)
      .closest("tr")
      .find('input[name="currentObject"]')
      .val();
    if (IsValidType(JsonData)) {
      this.Delete.emit(JsonData);
    }
  }

  MangePaging() {
    this.DisableNext = false;
    this.DisablePrev = false;
    if (this.pageIndex === 1) {
      this.DisablePrev = true;
      if (this.pageIndex === this.TotalPageCount) {
        this.DisableNext = true;
      }
    } else if (this.pageIndex === 1) {
      this.DisablePrev = true;
    } else if (this.pageIndex === this.TotalPageCount) {
      this.DisableNext = true;
    }
  }

  ngOnInit(): void {}

  PreviousPage() {
    if (this.pageIndex >= 1) {
      this.pageIndex--;
      this.Next.emit(
        JSON.stringify({
          PageIndex: this.pageIndex,
          TotalPages: this.TotalPageCount
        })
      );
    }
  }

  NextPage() {
    if (this.pageIndex < this.TotalPageCount) {
      this.pageIndex++;
      if (this.pageIndex === this.TotalPageCount) {
      }
      this.Next.emit(
        JSON.stringify({
          PageIndex: this.pageIndex,
          TotalPages: this.TotalPageCount
        })
      );
    }
  }
}
