import { prisma } from '../config/prisma';
import { Prisma, Invoice, InvoiceStatus, StockTransactionType, StockReason } from '@prisma/client';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import path from 'path';

export class InvoiceRepository {
  async findMany(): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      include: {
        customer: true,
      },
      orderBy: { invoiceNumber: 'desc' },
    });
  }

  async findById(id: string): Promise<any> {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
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
      customerId: string;
      invoiceDate: Date;
      dueDate: Date;
      discountAmount: number;
      paymentTerms?: string;
      notes?: string;
      termsAndConditions?: string;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        discountPercentage: number;
      }>;
    },
    userId?: string
  ): Promise<Invoice> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch customer details
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer || customer.isDeleted) {
        throw new Error('Customer not found');
      }

      // 2. Determine GST mode (Gujarat is local state)
      const isLocal = customer.billingState.toLowerCase().trim() === 'gujarat';

      // 3. Auto-generate sequential Invoice Number (e.g. INV-2026-00001)
      const year = new Date(data.invoiceDate).getFullYear();
      const count = await tx.invoice.count({
        where: {
          invoiceNumber: {
            startsWith: `INV-${year}-`,
          },
        },
      });
      const seqStr = String(count + 1).padStart(5, '0');
      const invoiceNumber = `INV-${year}-${seqStr}`;

      // 4. Calculate invoice totals and compile items
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

        // Check stock availability
        const currentStockVal = Number(product.currentStock);
        if (currentStockVal < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${currentStockVal}, Required: ${item.quantity}`);
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
          productSku: product.sku,
          productName: product.name,
          productUnit: product.unit.toString(),
          hsnCode: product.hsnCode,
        });

        // 5. Update stock level
        const newStockVal = currentStockVal - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newStockVal },
        });

        // 6. Create StockTransaction
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: StockTransactionType.OUT,
            reason: StockReason.INVOICE_BILLING,
            referenceNumber: invoiceNumber,
            notes: `Inventory reduction for invoice billing ${invoiceNumber}`,
            createdById: userId,
          },
        });
      }

      // Calculations for Invoice Headers
      const discountAmountVal = data.discountAmount;
      const rawGrandTotal = subtotal + cgstTotal + sgstTotal + igstTotal - discountAmountVal;
      const grandTotalRounded = Math.round(rawGrandTotal);
      const roundOff = grandTotalRounded - rawGrandTotal;

      // 7. Save Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          customerId: data.customerId,
          status: InvoiceStatus.PENDING,
          subtotal,
          discountAmount: discountAmountVal,
          cgst: cgstTotal,
          sgst: sgstTotal,
          igst: igstTotal,
          roundOff,
          grandTotal: grandTotalRounded,
          paymentTerms: data.paymentTerms,
          notes: data.notes,
          termsAndConditions: data.termsAndConditions,
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

      // 8. Update Customer Outstanding Balance
      const currentOutstanding = Number(customer.outstandingBalance);
      await tx.customer.update({
        where: { id: data.customerId },
        data: { outstandingBalance: currentOutstanding + grandTotalRounded },
      });

      // 9. Generate and save PDF Invoice
      const formatPdfDate = (d: any) => {
        if (d instanceof Date) return d.toISOString().split('T')[0];
        if (typeof d === 'string') return d.split('T')[0];
        return new Date(d).toISOString().split('T')[0];
      };

      const pdfData = {
        invoiceNumber,
        invoiceDate: formatPdfDate(data.invoiceDate),
        dueDate: formatPdfDate(data.dueDate),
        companyName: customer.companyName,
        customerName: customer.contactName || '',
        customerGstin: customer.gstin || '',
        customerStreet: customer.billingStreet,
        customerCity: customer.billingCity,
        customerState: customer.billingState,
        customerZip: customer.billingZip,
        subtotal,
        discountAmount: discountAmountVal,
        cgst: cgstTotal,
        sgst: sgstTotal,
        igst: igstTotal,
        roundOff,
        grandTotal: grandTotalRounded,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        items: compiledItems.map((i) => ({
          sku: i.productSku,
          name: i.productName,
          hsnCode: i.hsnCode,
          quantity: i.quantity,
          unit: i.productUnit,
          unitPrice: i.unitPrice,
          discountAmount: i.discountAmount,
          taxableAmount: i.taxableAmount,
          gstRate: i.gstRate,
          cgst: i.cgst,
          sgst: i.sgst,
          igst: i.igst,
          totalAmount: i.totalAmount,
        })),
      };

      const pdfPath = await generateInvoicePDF(pdfData);
      
      // Update Invoice with pdfUrl (local static path uploads/invoices/...)
      const relativePdfUrl = `/uploads/invoices/${path.basename(pdfPath)}`;
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl: relativePdfUrl },
      });

      return {
        ...invoice,
        pdfUrl: relativePdfUrl,
      };
    });
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    return prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }
}
