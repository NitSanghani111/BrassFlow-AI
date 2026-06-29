-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRATOR', 'OWNER', 'ACCOUNTANT', 'SALES', 'PURCHASE', 'WAREHOUSE', 'PRODUCTION', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('KG', 'PCS', 'METERS', 'TONS');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockTransactionType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "StockReason" AS ENUM ('INVOICE_BILLING', 'PURCHASE_RECEIPT', 'STOCK_ADJUSTMENT', 'PRODUCTION_INPUT', 'PRODUCTION_OUTPUT');

-- CreateEnum
CREATE TYPE "OCRDocumentType" AS ENUM ('INVOICE', 'PURCHASE_BILL', 'DELIVERY_CHALLAN', 'QUOTATION', 'RECEIPT', 'GST_BILL');

-- CreateEnum
CREATE TYPE "OCRStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReminderFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'DASHBOARD');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "gstin" TEXT,
    "pan" TEXT,
    "billingStreet" TEXT NOT NULL,
    "billingCity" TEXT NOT NULL,
    "billingState" TEXT NOT NULL,
    "billingZip" TEXT NOT NULL,
    "billingCountry" TEXT NOT NULL DEFAULT 'India',
    "shippingStreet" TEXT NOT NULL,
    "shippingCity" TEXT NOT NULL,
    "shippingState" TEXT NOT NULL,
    "shippingZip" TEXT NOT NULL,
    "shippingCountry" TEXT NOT NULL DEFAULT 'India',
    "outstandingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "aiNotes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "gstin" TEXT,
    "pan" TEXT,
    "billingStreet" TEXT NOT NULL,
    "billingCity" TEXT NOT NULL,
    "billingState" TEXT NOT NULL,
    "billingZip" TEXT NOT NULL,
    "billingCountry" TEXT NOT NULL DEFAULT 'India',
    "outstandingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "unit" "UnitType" NOT NULL DEFAULT 'KG',
    "purchasePrice" DECIMAL(15,4) NOT NULL,
    "sellingPrice" DECIMAL(15,4) NOT NULL,
    "openingStock" DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    "currentStock" DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    "minimumStock" DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "cgst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "sgst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "igst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "roundOff" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "grandTotal" DECIMAL(15,2) NOT NULL,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "termsAndConditions" TEXT,
    "pdfUrl" TEXT,
    "ocrDocumentId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unitPrice" DECIMAL(15,4) NOT NULL,
    "discountPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "discountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "taxableAmount" DECIMAL(15,2) NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL,
    "cgst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "sgst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "igst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "type" "StockTransactionType" NOT NULL,
    "reason" "StockReason" NOT NULL,
    "invoiceId" UUID,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OCRDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "documentType" "OCRDocumentType" NOT NULL,
    "status" "OCRStatus" NOT NULL DEFAULT 'PENDING',
    "extractedData" JSONB,
    "confidenceScore" DECIMAL(5,2),
    "errorMessage" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMPTZ,
    "reviewedById" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "OCRDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReminder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoiceId" UUID NOT NULL,
    "reminderFrequency" "ReminderFrequency" NOT NULL DEFAULT 'WEEKLY',
    "channel" "CommunicationChannel" NOT NULL DEFAULT 'DASHBOARD',
    "nextReminderDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reminderId" UUID NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "ReminderStatus" NOT NULL,
    "sentAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failureReason" TEXT,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" UUID,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Customer_companyName_idx" ON "Customer"("companyName");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_gstin_idx" ON "Customer"("gstin");

-- CreateIndex
CREATE INDEX "Supplier_companyName_idx" ON "Supplier"("companyName");

-- CreateIndex
CREATE INDEX "Supplier_gstin_idx" ON "Supplier"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_productId_idx" ON "InvoiceItem"("productId");

-- CreateIndex
CREATE INDEX "StockTransaction_productId_type_idx" ON "StockTransaction"("productId", "type");

-- CreateIndex
CREATE INDEX "StockTransaction_reason_idx" ON "StockTransaction"("reason");

-- CreateIndex
CREATE INDEX "OCRDocument_status_idx" ON "OCRDocument"("status");

-- CreateIndex
CREATE INDEX "OCRDocument_createdAt_idx" ON "OCRDocument"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentReminder_nextReminderDate_idx" ON "PaymentReminder"("nextReminderDate");

-- CreateIndex
CREATE INDEX "PaymentReminder_invoiceId_idx" ON "PaymentReminder"("invoiceId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityName_entityId_idx" ON "AuditLog"("entityName", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_ocrDocumentId_fkey" FOREIGN KEY ("ocrDocumentId") REFERENCES "OCRDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OCRDocument" ADD CONSTRAINT "OCRDocument_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "PaymentReminder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
