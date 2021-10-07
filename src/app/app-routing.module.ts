import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { CatagoryComponent } from "./catagory/catagory.component";
import { UploadexcelComponent } from "./uploadexcel/uploadexcel.component";
import { CatagoryreportComponent } from "./catagoryreport/catagoryreport.component";
import { UsersComponent } from "./users/users.component";
import { CustomersComponent } from "./customers/customers.component";
import { CustomerreportComponent } from "./customerreport/customerreport.component";
import { SalesandinvestmentactivityComponent } from "./salesandinvestmentactivity/salesandinvestmentactivity.component";
import { VendorComponent } from "./vendor/vendor.component";
import { VendorreportComponent } from "./vendorreport/vendorreport.component";
import { BillingComponent } from "./billing/billing.component";
import { RolesComponent } from "./roles/roles.component";
import { SalesComponent } from "./sales/sales.component";
import { PurchaseComponent } from "./purchase/purchase.component";
import { BillingPageComponent } from "./billing-page/billing-page.component";
import { CreditComponent } from "./credit/credit.component";
import { SettingComponent } from "./setting/setting.component";
import {
  Billing,
  Dashboard,
  Product,
  Uploadexcel,
  ItemReport,
  Users,
  Customer,
  CustomerReport,
  Roles,
  Sales,
  Purchases,
  SalesInvestmentReport,
  Vendor,
  VendorReport,
  BillingPage,
  Credit,
  Setting,
  PurchaseCredit,
  AddItems,
  PurchaseItems
} from "../providers/constants";
import { LoginComponent } from "./login/login.component";
import { PurchasecreditComponent } from "./purchasecredit/purchasecredit.component";
import { PurchaseitemsComponent } from "./purchaseitems/purchaseitems.component";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: Dashboard, component: DashboardComponent },
  { path: Product, component: CatagoryComponent },
  { path: Uploadexcel, component: UploadexcelComponent },
  { path: ItemReport, component: CatagoryreportComponent },
  { path: Users, component: UsersComponent },
  { path: Customer, component: CustomersComponent },
  { path: CustomerReport, component: CustomerreportComponent },
  { path: Roles, component: RolesComponent },
  { path: Sales, component: SalesComponent },
  { path: Purchases, component: PurchaseComponent },
  { path: AddItems, component: PurchaseComponent },
  {
    path: SalesInvestmentReport,
    component: SalesandinvestmentactivityComponent
  },
  { path: Vendor, component: VendorComponent },
  { path: VendorReport, component: VendorreportComponent },
  { path: Billing, component: BillingComponent },
  { path: BillingPage, component: BillingPageComponent },
  { path: Credit, component: CreditComponent },
  { path: Setting, component: SettingComponent },
  { path: PurchaseItems, component: PurchaseitemsComponent },
  { path: PurchaseCredit, component: PurchasecreditComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
