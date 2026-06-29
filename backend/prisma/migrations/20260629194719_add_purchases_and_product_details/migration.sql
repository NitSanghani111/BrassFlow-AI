-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockReason" ADD VALUE 'RETURN';
ALTER TYPE "StockReason" ADD VALUE 'OPENING_STOCK';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cadDrawingUrl" TEXT,
ADD COLUMN     "customerPartNumber" TEXT,
ADD COLUMN     "drawingNumber" TEXT,
ADD COLUMN     "finish" TEXT,
ADD COLUMN     "internalCode" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "reservedStock" DECIMAL(15,3) NOT NULL DEFAULT 0.000,
ADD COLUMN     "revision" TEXT,
ADD COLUMN     "weight" DECIMAL(10,3);

-- AlterTable
ALTER TABLE "StockTransaction" ADD COLUMN     "purchaseId" UUID;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "purchaseNumber" TEXT NOT NULL,
    "purchaseDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "supplierId" UUID NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "cgst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "sgst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "igst" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "roundOff" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "grandTotal" DECIMAL(15,2) NOT NULL,
    "originalInvoiceNo" TEXT,
    "invoiceUrl" TEXT,
    "notes" TEXT,
    "ocrDocumentId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "purchaseId" UUID NOT NULL,
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

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_purchaseNumber_key" ON "Purchase"("purchaseNumber");

-- CreateIndex
CREATE INDEX "Purchase_purchaseNumber_idx" ON "Purchase"("purchaseNumber");

-- CreateIndex
CREATE INDEX "Purchase_purchaseDate_idx" ON "Purchase"("purchaseDate");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_productId_idx" ON "PurchaseItem"("productId");

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_ocrDocumentId_fkey" FOREIGN KEY ("ocrDocumentId") REFERENCES "OCRDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
