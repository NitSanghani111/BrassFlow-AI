import { z } from 'zod';
import { PurchaseStatus } from '@prisma/client';

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string({ required_error: 'Supplier ID is required' }).uuid('Invalid Supplier ID format'),
    purchaseDate: z.string({ required_error: 'Purchase date is required' }).transform((val) => new Date(val)),
    dueDate: z.string({ required_error: 'Due date is required' }).transform((val) => new Date(val)),
    discountAmount: z.number().min(0).default(0.00),
    originalInvoiceNo: z.string().optional().or(z.literal('')),
    invoiceUrl: z.string().optional().or(z.literal('')),
    ocrDocumentId: z.string().uuid().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    items: z.array(
      z.object({
        productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid Product ID format'),
        quantity: z.number().positive('Quantity must be greater than zero'),
        unitPrice: z.number().nonnegative('Unit price must be non-negative'),
        discountPercentage: z.number().min(0).max(100).default(0.00),
      })
    ).min(1, 'Purchase must contain at least 1 item'),
  }),
});

export const updatePurchaseStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(PurchaseStatus, { required_error: 'Status is required' }),
  }),
});
