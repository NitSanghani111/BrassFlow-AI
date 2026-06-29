"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
const prisma_1 = require("../config/prisma");
class CustomerRepository {
    async findMany() {
        return prisma_1.prisma.customer.findMany({
            where: { isDeleted: false },
            orderBy: { companyName: 'asc' },
        });
    }
    async findById(id) {
        return prisma_1.prisma.customer.findFirst({
            where: { id, isDeleted: false },
            include: {
                invoices: {
                    orderBy: { invoiceDate: 'desc' },
                },
            },
        });
    }
    async create(data) {
        return prisma_1.prisma.customer.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.customer.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        // Soft delete to protect relational integrity
        return prisma_1.prisma.customer.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
exports.CustomerRepository = CustomerRepository;
