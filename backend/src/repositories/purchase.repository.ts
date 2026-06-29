import { prisma } from '../config/prisma';
import { Prisma, Purchase, PurchaseStatus, StockTransactionType, StockReason } from '@prisma/client';

export class PurchaseRepository {
  async findMany(): Promise<any[]> {
    return prisma.purchase.findMany({
      include: {
        supplier: true,
      },
      orderBy: { purchaseNumber: 'desc' },
    });
  }

  async findById(id: string): Promise<any> {
    return prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async create(
    data: {
      supplierId: string;
      purchaseDate: Date;
      dueDate: Date;
      discountAmount: number;
      originalInvoiceNo?: string;
      invoiceUrl?: string;
      ocrDocumentId?: string;
      notes?: string;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        discountPercentage: number;
      }>;
    },
    userId?: string
  ): Promise<Purchase> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch supplier details
      const supplier = await tx.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier || supplier.isDeleted) {
        throw new Error('Supplier not found');
      }

      // 2. Determine GST mode (Gujarat is local state)
      const isLocal = supplier.billingState.toLowerCase().trim() === 'gujarat';

      // 3. Auto-generate sequential Purchase Number (e.g. PUR-2026-00001)
      const year = new Date(data.purchaseDate).getFullYear();
      const count = await tx.purchase.count({
        where: {
          purchaseNumber: {
            startsWith: `PUR-${year}-`,
          },
        },
      });
      const seqStr = String(count + 1).padStart(5, '0');
      const purchaseNumber = `PUR-${year}-${seqStr}`;

      // 4. Calculate purchase totals and compile items
      let subtotal = 0;
      let cgstTotal = 0;
      let sgstTotal = 0;
      let igstTotal = 0;

      const compiledItems = [];

      for (const item of data.items) {
        // Fetch product
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.isDeleted) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        // Calculations
        const itemSubtotal = item.quantity * item.unitPrice;
        const discountAmount = (itemSubtotal * item.discountPercentage) / 100;
        const taxableAmount = itemSubtotal - discountAmount;

        const gstRateVal = Number(product.gstRate);
        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (isLocal) {
          cgst = (taxableAmount * (gstRateVal / 2)) / 100;
          sgst = (taxableAmount * (gstRateVal / 2)) / 100;
          cgstTotal += cgst;
          sgstTotal += sgst;
        } else {
          igst = (taxableAmount * gstRateVal) / 100;
          igstTotal += igst;
        }

        const totalAmount = taxableAmount + cgst + sgst + igst;
        subtotal += taxableAmount;

        compiledItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage,
          discountAmount,
          taxableAmount,
          gstRate: gstRateVal,
          cgst,
          sgst,
          igst,
          totalAmount,
        });

        // 5. Update stock level (Increase for purchases)
        const currentStockVal = Number(product.currentStock);
        const newStockVal = currentStockVal + item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newStockVal },
        });

        // 6. Create StockTransaction (Type: IN, Reason: PURCHASE_RECEIPT)
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: StockTransactionType.IN,
            reason: StockReason.PURCHASE_RECEIPT,
            referenceNumber: purchaseNumber,
            notes: `Inventory receipt from purchase billing ${purchaseNumber}`,
            createdById: userId,
          },
        });
      }

      // Calculations for Purchase Headers
      const discountAmountVal = data.discountAmount;
      const rawGrandTotal = subtotal + cgstTotal + sgstTotal + igstTotal - discountAmountVal;
      const grandTotalRounded = Math.round(rawGrandTotal);
      const roundOff = grandTotalRounded - rawGrandTotal;

      // 7. Save Purchase Entry
      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          purchaseDate: data.purchaseDate,
          dueDate: data.dueDate,
          supplierId: data.supplierId,
          status: PurchaseStatus.PENDING,
          subtotal,
          discountAmount: discountAmountVal,
          cgst: cgstTotal,
          sgst: sgstTotal,
          igst: igstTotal,
          roundOff,
          grandTotal: grandTotalRounded,
          originalInvoiceNo: data.originalInvoiceNo,
          invoiceUrl: data.invoiceUrl,
          ocrDocumentId: data.ocrDocumentId,
          notes: data.notes,
          createdById: userId,
          items: {
            create: compiledItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercentage: item.discountPercentage,
              discountAmount: item.discountAmount,
              taxableAmount: item.taxableAmount,
              gstRate: item.gstRate,
              cgst: item.cgst,
              sgst: item.sgst,
              igst: item.igst,
              totalAmount: item.totalAmount,
            })),
          },
        },
      });

      // 8. Update Supplier Outstanding Payable Balance
      const currentOutstanding = Number(supplier.outstandingBalance);
      await tx.supplier.update({
        where: { id: data.supplierId },
        data: { outstandingBalance: currentOutstanding + grandTotalRounded },
      });

      // 9. If OCR Document was processed, set it as reviewed
      if (data.ocrDocumentId) {
        await tx.oCRDocument.update({
          where: { id: data.ocrDocumentId },
          data: {
            reviewed: true,
            reviewedAt: new Date(),
            reviewedById: userId,
          },
        });
      }

      // 10. Audit Log Entry
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE_PURCHASE',
          entityName: 'Purchase',
          entityId: purchase.id,
          newValues: { purchaseNumber, grandTotal: grandTotalRounded },
        },
      });

      return purchase;
    });
  }

  async updateStatus(id: string, status: PurchaseStatus, userId?: string): Promise<Purchase> {
    const purchase = await prisma.purchase.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_PURCHASE_STATUS',
        entityName: 'Purchase',
        entityId: id,
        newValues: { status },
      },
    });

    return purchase;
  }
}
