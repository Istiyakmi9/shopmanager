import { NumberOnlyDirective } from "./../directives/numbertype";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AjaxService } from "src/providers/ajax.service";
import { HttpClientModule } from "@angular/common/http";
import { SideMenuComponent } from "./side-menu/side-menu.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { HeaderComponent } from "./header/header.component";
import { CatagoryComponent } from "./catagory/catagory.component";
import { UploadexcelComponent } from "./uploadexcel/uploadexcel.component";
import { CatagoryreportComponent } from "./catagoryreport/catagoryreport.component";
import { UsersComponent } from "./users/users.component";
import { CustomersComponent } from "./customers/customers.component";
import { CustomerreportComponent } from "./customerreport/customerreport.component";
import { VendorComponent } from "./vendor/vendor.component";
import { VendorreportComponent } from "./vendorreport/vendorreport.component";
import { SalesandinvestmentactivityComponent } from "./salesandinvestmentactivity/salesandinvestmentactivity.component";
import { BillingComponent } from "./billing/billing.component";
import { RolesComponent } from "./roles/roles.component";
import { SalesComponent } from "./sales/sales.component";
import { PurchaseComponent } from "./purchase/purchase.component";
import { DynamicTableComponent } from "./dynamic-table/dynamic-table.component";
import { CommonService } from "../providers/common-service/common.service";
import { BillingPageComponent } from "./billing-page/billing-page.component";
import { ApplicationStorage } from "../providers/ApplicationStorage";
import { PageCache } from "../providers/PageCache";
import { LoginComponent } from "./login/login.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { CreditComponent } from "./credit/credit.component";
import { SettingComponent } from "./setting/setting.component";
import { ChattingboxComponent } from "./chattingbox/chattingbox.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { iNavigation } from "../providers/iNavigation";
import { MatDialogModule } from "@angular/material/dialog";
import { PageModalComponent } from "./page-modal/page-modal.component";
import { AdvanceFilterModalComponent } from "./advance-filter-modal/advance-filter-modal.component";
import { IautocompleteComponent } from "./iautocomplete/iautocomplete.component";
import { PurchasecreditComponent } from "./purchasecredit/purchasecredit.component";
import { PurchaseitemsComponent } from "./purchaseitems/purchaseitems.component";
import { FloatOnlyDirective } from "src/directives/floattype";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTabsModule} from '@angular/material/tabs';
import { UpperCaseDirective } from "src/directives/upper";
import { NgbDateParserFormatter, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbDateFormatter } from "src/providers/NgbDateFormatter";

@NgModule({
  declarations: [
    AppComponent,
    SideMenuComponent,
    DashboardComponent,
    HeaderComponent,
    CatagoryComponent,
    UploadexcelComponent,
    CatagoryreportComponent,
    UsersComponent,
    CustomersComponent,
    CustomerreportComponent,
    VendorComponent,
    VendorreportComponent,
    SalesandinvestmentactivityComponent,
    BillingComponent,
    RolesComponent,
    SalesComponent,
    PurchaseComponent,
    DynamicTableComponent,
    BillingPageComponent,
    LoginComponent,
    CreditComponent,
    SettingComponent,
    ChattingboxComponent,
    PageModalComponent,
    AdvanceFilterModalComponent,
    IautocompleteComponent,
    PurchasecreditComponent,
    PurchaseitemsComponent,
    FloatOnlyDirective,
    NumberOnlyDirective,
    UpperCaseDirective    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatDialogModule,
    NgbModule
  ],
  entryComponents: [PageModalComponent, AdvanceFilterModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    AjaxService,
    CommonService,
    ApplicationStorage,
    PageCache,
    MatDatepickerModule,
    iNavigation,
    {
      provide: NgbDateParserFormatter, useClass: NgbDateFormatter
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
