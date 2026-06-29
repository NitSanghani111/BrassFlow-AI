"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
class ProductRepository {
    async findMany() {
        return prisma_1.prisma.product.findMany({
            where: { isDeleted: false },
            orderBy: { sku: 'asc' },
        });
    }
    async findById(id) {
        return prisma_1.prisma.product.findFirst({
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
    async findBySku(sku) {
        return prisma_1.prisma.product.findFirst({
            where: { sku: sku.toUpperCase(), isDeleted: false },
        });
    }
    async create(data) {
        return prisma_1.prisma.product.create({ data });
    }
    async update(id, data) {
        return prisma_1.prisma.product.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.prisma.product.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    async adjustStock(productId, quantity, type, reason, referenceNumber, notes, userId) {
        return prisma_1.prisma.$transaction(async (tx) => {
            // 1. Fetch current product
            const product = await tx.product.findUnique({
                where: { id: productId },
            });
            if (!product || product.isDeleted) {
                throw new Error('Product not found');
            }
            // 2. Calculate stock difference
            const currentVal = Number(product.currentStock);
            const newVal = type === client_1.StockTransactionType.IN ? currentVal + quantity : currentVal - quantity;
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
exports.ProductRepository = ProductRepository;
