import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }).uuid('Invalid Customer ID format'),
    invoiceDate: z.string({ required_error: 'Invoice date is required' }).transform((val) => new Date(val)),
    dueDate: z.string({ required_error: 'Due date is required' }).transform((val) => new Date(val)),
    discountAmount: z.number().min(0).default(0.00),
    paymentTerms: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    termsAndConditions: z.string().optional().or(z.literal('')),
    items: z.array(
      z.object({
        productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid Product ID format'),
        quantity: z.number().positive('Quantity must be greater than zero'),
        unitPrice: z.number().nonnegative('Unit price must be non-negative'),
        discountPercentage: z.number().min(0).max(100).default(0.00),
      })
    ).min(1, 'Invoice must contain at least 1 item'),
  }),
});

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(InvoiceStatus, { required_error: 'Status is required' }),
  }),
});
