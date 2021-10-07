import { Component, OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import { WorkBook, read, utils, write, readFile } from "xlsx";
import { AjaxService } from "src/providers/ajax.service";
import { CommonService } from "./../../providers/common-service/common.service";
import * as $ from "jquery";
import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { Dictionary } from "src/providers/Generic/Code/Dictionary";

@Component({
  selector: "app-uploadexcel",
  templateUrl: "./uploadexcel.component.html",
  styleUrls: ["./uploadexcel.component.scss"]
})
export class UploadexcelComponent implements OnInit {
  wbout = [];
  table = [];
  file: File;
  fileSize: string;
  fileName: string;
  isFileReady: boolean = false;
  noOfRecords: number;
  recordToUpload: any;
  ws: any;
  constructor(
    private http: AjaxService,
    private common: CommonService,
    private storage: ApplicationStorage
  ) {}

  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  ngOnInit() {}

  SaveToExcel(tableData, fileName: string = "QuestionSheet") {
    this.setTableData(tableData, fileName);
    saveAs(
      new Blob([this.s2ab(this.wbout)], { type: "application/octet-stream" }),
      fileName + ".xlsx"
    );
  }

  getTableData() {
    return this.table;
  }

  setTableData(tableData, fileName: string) {
    this.table = tableData;
    this.setExcelProperties(fileName);
  }

  setExcelProperties(fileName: string) {
    const ws_name = fileName.substr(0, 25); //'QuestionSheet'
    //  const ws_name = ''; // worksheet name cannot exceed 31 chracters length
    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    this.ws = utils.json_to_sheet(this.getTableData());
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = this.ws;
    this.wbout = write(wb, { bookType: "xlsx", bookSST: true, type: "binary" });
  }

  convertToJson(): Promise<any> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      let workbookkk;
      let XL_row_object;
      reader.readAsBinaryString(this.file);
      reader.onload = function() {
        let data = reader.result;
        let ExcelCollectionData = new Dictionary<string, any>();
        workbookkk = read(data, { type: "binary" });
        let SheetName = "";
        let index = 0;
        while (index < workbookkk.SheetNames.length) {
          SheetName = workbookkk.SheetNames[index];
          if (ExcelCollectionData.hasKey(SheetName) === -1) {
            XL_row_object = utils.sheet_to_json(workbookkk.Sheets[SheetName]);
            ExcelCollectionData.insert(SheetName, XL_row_object);
          }
          index++;
        }
        resolve(ExcelCollectionData);
        // workbookkk.SheetNames.forEach(function(sheetName) {
        //   XL_row_object = utils.sheet_to_json(workbookkk.Sheets[sheetName]);
        //   if (this.ExcelCollection.hasKey(sheetName) !== -1) {
        //     this.ExcelCollection.insert(sheetName, XL_row_object);
        //   }
        //   resolve(XL_row_object);
        // });
      };
    });
  }

  uploadExcelSheet() {
    event.stopPropagation();
    event.preventDefault();
    this.http.post("BatchInsertStocks", this.recordToUpload).then(result => {
      if (result !== null && result !== "") {
        this.common.ShowToast("Data inserted successfully");
        this.storage.set(result);
      } else {
        this.common.ShowToast("Fail to insert data.");
      }
      this.cleanFileHandler();
    });
  }

  fireBrowserFile() {
    $("#uploadexcel").click();
  }

  cleanFileHandler() {
    $("#uploadexcel").val("");
    this.fileSize = "";
    this.fileName = "";
    this.isFileReady = false;
    this.noOfRecords = 0;
    event.stopPropagation();
    event.preventDefault();
  }

  readExcelData(e: any) {
    this.file = e.target.files[0];
    if (this.file !== undefined && this.file !== null) {
      this.convertToJson().then(data => {
        if (this.common.IsValid(data) && data.mapTable.length > 0) {
          this.recordToUpload = data.mapTable[0].value;
          this.fileSize = (this.file.size / 1024).toFixed(2);
          this.fileName = this.file.name;
          this.noOfRecords = this.recordToUpload.length;
          this.isFileReady = true;
        } else {
          this.cleanFileHandler();
          this.common.ShowToast("Excel data is InValid.");
        }
      });
    }
  }
}
