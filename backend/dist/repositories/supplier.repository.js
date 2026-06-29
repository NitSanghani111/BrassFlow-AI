"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierRepository = void 0;
const prisma_1 = require("../config/prisma");
class SupplierRepository {
    async findMany() {
        return prisma_1.prisma.supplier.findMany({
            where: { isDeleted: false },
            orderBy: { companyName: 'asc' },
        });
    }
    async findById(id) {
        return prisma_1.prisma.supplier.findFirst({
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
    async create(data) {
        return prisma_1.prisma.supplier.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.supplier.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        // Soft delete to protect relational integrity
        return prisma_1.prisma.supplier.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
exports.SupplierRepository = SupplierRepository;
