import { prisma } from '../config/prisma';
import { Prisma, Customer } from '@prisma/client';

export class CustomerRepository {
  async findMany(): Promise<Customer[]> {
    return prisma.customer.findMany({
      where: { isDeleted: false },
      orderBy: { companyName: 'asc' },
    });
  }

  async findById(id: string): Promise<any> {
    return prisma.customer.findFirst({
      where: { id, isDeleted: false },
      include: {
        invoices: {
          orderBy: { invoiceDate: 'desc' },
        },
      },
    });
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Customer> {
    // Soft delete to protect relational integrity
    return prisma.customer.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
