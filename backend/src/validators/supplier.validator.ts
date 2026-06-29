import { z } from 'zod';
import { SupplierStatus } from '@prisma/client';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const createSupplierSchema = z.object({
  body: z.object({
    companyName: z.string({ required_error: 'Company name is required' }).min(2).max(255).trim(),
    contactName: z.string({ required_error: 'Contact name is required' }).min(2).max(255).trim(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10).max(15).optional().or(z.literal('')),
    gstin: z.string().regex(GSTIN_REGEX, 'Invalid Indian GSTIN structure').optional().or(z.literal('')),
    pan: z.string().regex(PAN_REGEX, 'Invalid PAN structure').optional().or(z.literal('')),
    billingStreet: z.string().optional().or(z.literal('')),
    billingCity: z.string().optional().or(z.literal('')),
    billingState: z.string().optional().or(z.literal('')),
    billingZip: z.string().optional().or(z.literal('')),
    billingCountry: z.string().default('India'),
    paymentTermsDays: z.number().int().min(0).default(15),
    status: z.nativeEnum(SupplierStatus).default(SupplierStatus.ACTIVE),
    notes: z.string().optional().or(z.literal('')),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(255).trim().optional(),
    contactName: z.string().min(2).max(255).trim().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10).max(15).optional().or(z.literal('')),
    gstin: z.string().regex(GSTIN_REGEX, 'Invalid Indian GSTIN structure').optional().or(z.literal('')),
    pan: z.string().regex(PAN_REGEX, 'Invalid PAN structure').optional().or(z.literal('')),
    billingStreet: z.string().optional().or(z.literal('')),
    billingCity: z.string().optional().or(z.literal('')),
    billingState: z.string().optional().or(z.literal('')),
    billingZip: z.string().optional().or(z.literal('')),
    billingCountry: z.string().optional(),
    outstandingBalance: z.number().optional(),
    paymentTermsDays: z.number().int().min(0).optional(),
    status: z.nativeEnum(SupplierStatus).optional(),
    notes: z.string().optional().or(z.literal('')),
  }),
});
