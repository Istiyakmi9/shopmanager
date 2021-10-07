import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: "app-page-modal",
  templateUrl: "./page-modal.component.html",
  styleUrls: ["./page-modal.component.scss"]
})
export class PageModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<PageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  openDialog() {}

  ngOnInit() {}
}
