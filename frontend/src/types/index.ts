export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone: string;
  gstin?: string;
  pan?: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  paymentTermsDays: number;
  outstandingBalance: number | string;
  status: string;
  invoices?: Invoice[];
}

export interface Supplier {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone: string;
  gstin?: string;
  pan?: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  paymentTermsDays: number;
  outstandingBalance: number | string;
  status: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  hsnCode: string;
  gstRate: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  openingStock: number;
  currentStock: number;
  minimumStock: number;
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  invoiceDate: string;
  dueDate: string;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  status: string;
  pdfUrl?: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  description?: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  purchaseDate: string;
  dueDate: string;
  discountAmount: number;
  subTotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  originalInvoiceNo?: string;
  status: string;
}

export interface Reminder {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  reminderFrequency: string;
  channel: string;
  nextReminderDate: string;
  isActive: boolean;
  reminderLogs?: ReminderLog[];
}

export interface ReminderLog {
  id: string;
  sentAt: string;
  channel: string;
  recipient: string;
  status: string;
  reminder?: Reminder;
}

export interface DashboardKPIs {
  totalOutstanding: number;
  lowStockCount: number;
  monthlySales: number;
  pendingAmount: number;
  pendingCount: number;
  todaySales?: number;
  todayPurchases?: number;
  totalPayable?: number;
}

export interface DashboardAnalytics {
  kpis: DashboardKPIs;
  recentInvoices: any[];
  topCustomers: any[];
  categoryStocks: any[];
  recentActivities?: any[];
}
