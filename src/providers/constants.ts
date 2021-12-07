import { IGrid } from "./Generic/Interface/IGrid";

export const Billing = "billing";
export const Login = "/";
export const Dashboard = "dashboard";
export const Product = "product";
export const Uploadexcel = "uploadexcel";
export const ItemReport = "item-report";
export const Users = "users";
export const Customer = "customer";
export const CustomerReport = "customer-report";
export const Roles = "roles";
export const Sales = "sales";
export const Purchases = "purchases";
export const SalesInvestmentReport = "sales-investment-report";
export const Vendor = "vendor";
export const VendorReport = "vendor-report";
export const BillingPage = "billingpage";
export const Credit = "credit";
export const Setting = "setting";
export const PurchaseCredit = "purchasecredit";
export const AddItems = "addItems";
export const PurchaseItems = "purchaseItems";
export const DefaultUserImage = "assets/defaultuser.jpg";
export const Total = "total";
export const ZerothIndex = 0;
export const Columns = "columns";
export const Rows = "rows";

// --------  Storage variable names
export const Catagory = "catagory";
export const Brands = "brands";
export const Menu = "menu";

export const Inserted = "Inserted successfully.";
export const Updated = "Updated successfully.";
export const FailToInsert = "Fail to insert.";
export const FailToUpdate = "Fail to update.";

export const SalesColumn: Array<IGrid> = [
  { column: "CustomerName", header: "Customer", width: 10 },
  { column: "BillNum", header: "Bill No.#" },
  { column: "ItemUid", type: "hidden" },
  { column: "Quantity", header: "Qtn #" },
  { column: "TotalPrice", header: "Total Price" },
  { column: "CustomerUid", type: "hidden" },
  { column: "UnregisteredCustomerUid", type: "hidden" },
  { column: "SellingPrice", type: "hidden" }
];

export const PurchaseColumn: Array<IGrid> = [
  { column: "Name", header: "Product", width: 10 },
  { column: "BillNo", header: "Customer" },
  { column: "ItemUid", type: "hidden" },
  { column: "Quantity", header: "Qtn #" },
  { column: "Price", header: "SNo #" },
  { column: "TotalPrice", header: "Total" },
  { column: "AmountPaid", header: "Paid" },
  { column: "AmountDue", header: "Due" }
];

export const CustomerColumn: Array<IGrid> = [
  { column: "CustomerName", header: "Name", width: 10 },
  { column: "MobileNo", header: "MobileNo" },
  { column: "EmailId", header: "Email Id" },
  { column: "ShopName", header: "Shop Name" },
  { column: "ShopPhoneNumber", header: "Shop no. #" },
  { column: "GSTNo", header: "GST No.#" },
  { column: "CustomerUid", type: "hidden" }
];
export const VendorColumn: Array<IGrid> = [
  { column: "CustomerName", header: "Name", width: 10 },
  { column: "MobileNo", header: "MobileNo" },
  { column: "EmailId", header: "Email Id" },
  { column: "ShopName", header: "Shop Name" },
  { column: "ShopPhoneNumber", header: "Shop no. #" },
  { column: "GSTNo", header: "GST No.#" },
  { column: "CustomerUid", type: "hidden" }
];

export const PurchaseCreditColumn: Array<IGrid> = [
  { column: "BillNo", header: "Bill No.#", width: 10 },
  { column: "Name", header: "Name" },
  { column: "PurchaseItemUid", type: "hidden" },
  { column: "AmountPaid", header: "Paid" },
  { column: "AmountDue", header: "Due" },
  { column: "CreatedOn", header: "Purchased On" }
];

export const CreditColumn: Array<IGrid> = [
  { column: "CustomerName", header: "Customer Name", width: 10 },
  { column: "BillNum", header: "Bill No.#" },
  { column: "ItemUid", type: "hidden" },
  { column: "Quantity", header: "Quantity" },
  { column: "TotalPrice", header: "Total Price" },
  { column: "AmountPaid", header: "Paid" },
  { column: "AmountDue", header: "Due" },
  { column: "CreatedOn", type: "hidden" }
];

export const CatagoryReportColumn: Array<IGrid> = [
  { column: "ItemName", header: "Item Name", width: 10 },
  { column: "BrandName", header: "Brand" },
  { column: "AvailableQuantity", header: "Qty.#" },
  { column: "SellingPrice", header: "S-Price" },
  { column: "ActualPrice", header: "A-Price" },
  { column: "StockUid", type: "hidden" }
];

export const PurchaseItemsColumn: Array<IGrid> = [
  { column: "", type: "checkbox" },
  { column: "BillNum", header: "Bill No.#" },
  { column: "CustomerName", header: "Name", width: 10 },
  { column: "ItemUid", type: "hidden" },
  { column: "CustomerUid", type: "hidden" },
  { column: "UnregisteredCustomerUid", type: "hidden" },
  { column: "ItemName", header: "Item Name" },
  { column: "Quantity", header: "Qty.#" },
  { column: "AmountPaid", header: "Price" },
  { column: "BrandName", header: "Brand" },
  { column: "CreatedOn", header: "Date" }
];
