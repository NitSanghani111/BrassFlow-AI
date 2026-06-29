import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { InvoiceStatus, PurchaseStatus } from '@prisma/client';

export class AnalyticsController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Aggregating dashboard KPIs and report analytics');

      // 1. Outstanding Customer Balances (Receivables)
      const customerBalances = await prisma.customer.aggregate({
        _sum: {
          outstandingBalance: true,
        },
        where: { isDeleted: false },
      });
      const totalOutstanding = Number(customerBalances._sum.outstandingBalance || 0);

      // 2. Outstanding Supplier Balances (Payables)
      const supplierBalances = await prisma.supplier.aggregate({
        _sum: {
          outstandingBalance: true,
        },
        where: { isDeleted: false },
      });
      const totalPayable = Number(supplierBalances._sum.outstandingBalance || 0);

      // 3. Low Stock Counts (currentStock < minimumStock)
      const lowStockProducts = await prisma.product.findMany({
        where: {
          isDeleted: false,
          currentStock: {
            lt: prisma.product.fields.minimumStock,
          },
        },
      });
      const lowStockCount = lowStockProducts.length;

      // 4. Current Month Sales (Grand Totals)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySalesAgg = await prisma.invoice.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          invoiceDate: {
            gte: startOfMonth,
          },
          status: {
            not: InvoiceStatus.CANCELLED,
          },
        },
      });
      const monthlySales = Number(monthlySalesAgg._sum.grandTotal || 0);

      // 5. Today's Sales
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todaySalesAgg = await prisma.invoice.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          invoiceDate: {
            gte: startOfToday,
          },
          status: {
            not: InvoiceStatus.CANCELLED,
          },
        },
      });
      const todaySales = Number(todaySalesAgg._sum.grandTotal || 0);

      // 6. Today's Purchases
      const todayPurchasesAgg = await prisma.purchase.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          purchaseDate: {
            gte: startOfToday,
          },
          status: {
            not: PurchaseStatus.CANCELLED,
          },
        },
      });
      const todayPurchases = Number(todayPurchasesAgg._sum.grandTotal || 0);

      // 7. Invoice statuses break down
      const pendingInvoices = await prisma.invoice.findMany({
        where: {
          status: {
            in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL],
          },
        },
      });
      const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + Number(inv.grandTotal), 0);
      const pendingCount = pendingInvoices.length;

      // 8. Recent Invoices (top 5)
      const recentInvoices = await prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      });

      // 9. Top 5 Customers by Outstanding Balance
      const topCustomers = await prisma.customer.findMany({
        take: 5,
        where: { isDeleted: false },
        orderBy: { outstandingBalance: 'desc' },
      });

      // 10. Top 5 Suppliers by Outstanding Balance
      const topSuppliers = await prisma.supplier.findMany({
        take: 5,
        where: { isDeleted: false },
        orderBy: { outstandingBalance: 'desc' },
      });

      // 11. Category Stock distribution (KG/PCS)
      const categoryStocks = await prisma.product.groupBy({
        by: ['category'],
        _sum: {
          currentStock: true,
        },
        where: { isDeleted: false },
      });

      // 12. Recent OCR Document Imports (top 5)
      const recentOcr = await prisma.oCRDocument.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      // 13. Recent activities audit log (top 10)
      const recentActivities = await prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: {
          kpis: {
            totalOutstanding,
            totalPayable,
            lowStockCount,
            monthlySales,
            todaySales,
            todayPurchases,
            pendingAmount,
            pendingCount,
          },
          recentInvoices: recentInvoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            companyName: inv.customer.companyName,
            grandTotal: Number(inv.grandTotal),
            invoiceDate: inv.invoiceDate.toISOString().split('T')[0],
            status: inv.status,
          })),
          topCustomers: topCustomers.map((c) => ({
            id: c.id,
            companyName: c.companyName,
            outstandingBalance: Number(c.outstandingBalance),
            phone: c.phone,
          })),
          topSuppliers: topSuppliers.map((s) => ({
            id: s.id,
            companyName: s.companyName,
            outstandingBalance: Number(s.outstandingBalance),
            phone: s.phone,
          })),
          categoryStocks: categoryStocks.map((cs) => ({
            category: cs.category,
            totalStock: Number(cs._sum.currentStock || 0),
          })),
          recentOcr: recentOcr.map((o) => ({
            id: o.id,
            fileName: o.fileName,
            status: o.status,
            confidenceScore: o.confidenceScore ? Number(o.confidenceScore) : null,
            createdAt: o.createdAt.toISOString().split('T')[0],
          })),
          recentActivities: recentActivities.map((act) => ({
            id: act.id,
            action: act.action,
            entityName: act.entityName,
            entityId: act.entityId,
            newValues: act.newValues,
            userName: act.user ? `${act.user.firstName} ${act.user.lastName}` : 'System',
            createdAt: act.createdAt.toISOString(),
          })),
        },
      });
    } catch (error: any) {
      logger.error(`Failed aggregating dashboard stats: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while compiling report analytics',
      });
    }
  }
}
