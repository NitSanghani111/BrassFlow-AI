import { prisma } from '../config/prisma';
import { Prisma, Supplier } from '@prisma/client';

export class SupplierRepository {
  async findMany(): Promise<Supplier[]> {
    return prisma.supplier.findMany({
      where: { isDeleted: false },
      orderBy: { companyName: 'asc' },
    });
  }

  async findById(id: string): Promise<any> {
    return prisma.supplier.findFirst({
      where: { id, isDeleted: false },
      include: {
        purchases: {
          orderBy: { purchaseDate: 'desc' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return prisma.supplier.create({ data });
  }

  async update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Supplier> {
    // Soft delete to protect relational integrity
    return prisma.supplier.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
