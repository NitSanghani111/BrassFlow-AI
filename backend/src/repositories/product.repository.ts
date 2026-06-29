import { prisma } from '../config/prisma';
import { Prisma, Product, StockTransactionType, StockReason } from '@prisma/client';

export class ProductRepository {
  async findMany(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { isDeleted: false },
      orderBy: { sku: 'asc' },
    });
  }

  async findById(id: string): Promise<any> {
    return prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        stockTransactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: { sku: sku.toUpperCase(), isDeleted: false },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async adjustStock(
    productId: string,
    quantity: number,
    type: StockTransactionType,
    reason: StockReason,
    referenceNumber?: string,
    notes?: string,
    userId?: string
  ): Promise<Product> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch current product
      const product = await tx.product.findUnique({
        where: { id: productId },
      });
      
      if (!product || product.isDeleted) {
        throw new Error('Product not found');
      }

      // 2. Calculate stock difference
      const currentVal = Number(product.currentStock);
      const newVal = type === StockTransactionType.IN ? currentVal + quantity : currentVal - quantity;

      if (newVal < 0) {
        throw new Error(`Insufficient stock for SKU ${product.sku}. Available stock is ${currentVal} ${product.unit}.`);
      }

      // 3. Update product
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newVal },
      });

      // 4. Create Transaction Log
      await tx.stockTransaction.create({
        data: {
          productId,
          quantity,
          type,
          reason,
          referenceNumber,
          notes,
          createdById: userId,
        },
      });

      return updatedProduct;
    });
  }
}
