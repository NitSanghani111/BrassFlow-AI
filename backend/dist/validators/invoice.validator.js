"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceStatusSchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string({ required_error: 'Customer ID is required' }).uuid('Invalid Customer ID format'),
        invoiceDate: zod_1.z.string({ required_error: 'Invoice date is required' }).transform((val) => new Date(val)),
        dueDate: zod_1.z.string({ required_error: 'Due date is required' }).transform((val) => new Date(val)),
        discountAmount: zod_1.z.number().min(0).default(0.00),
        paymentTerms: zod_1.z.string().optional().or(zod_1.z.literal('')),
        notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
        termsAndConditions: zod_1.z.string().optional().or(zod_1.z.literal('')),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string({ required_error: 'Product ID is required' }).uuid('Invalid Product ID format'),
            quantity: zod_1.z.number().positive('Quantity must be greater than zero'),
            unitPrice: zod_1.z.number().nonnegative('Unit price must be non-negative'),
            discountPercentage: zod_1.z.number().min(0).max(100).default(0.00),
        })).min(1, 'Invoice must contain at least 1 item'),
    }),
});
exports.updateInvoiceStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.InvoiceStatus, { required_error: 'Status is required' }),
    }),
});
