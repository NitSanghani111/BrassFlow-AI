import { z } from 'zod';
import { UnitType } from '@prisma/client';

const HSN_REGEX = /^[0-9]{4,8}$/; // Indian standard HSN is typically 4, 6 or 8 digits

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string({ required_error: 'SKU is required' }).min(3).max(50).toUpperCase().trim(),
    name: z.string({ required_error: 'Product name is required' }).min(2).max(255).trim(),
    description: z.string().optional().or(z.literal('')),
    category: z.string({ required_error: 'Category is required' }).min(2).max(100).trim(),
    hsnCode: z.string().regex(HSN_REGEX, 'HSN code must be 4 to 8 digits').optional().or(z.literal('')),
    gstRate: z.number().min(0).max(100).default(18.00),
    unit: z.nativeEnum(UnitType).default(UnitType.KG),
    purchasePrice: z.number().min(0, 'Purchase price must be non-negative'),
    sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
    openingStock: z.number().min(0).default(0),
    currentStock: z.number().min(0).default(0),
    minimumStock: z.number().min(0).default(0),
    reservedStock: z.number().min(0).default(0),
    internalCode: z.string().optional().or(z.literal('')),
    customerPartNumber: z.string().optional().or(z.literal('')),
    material: z.string().optional().or(z.literal('')),
    weight: z.number().optional(),
    finish: z.string().optional().or(z.literal('')),
    drawingNumber: z.string().optional().or(z.literal('')),
    revision: z.string().optional().or(z.literal('')),
    cadDrawingUrl: z.string().optional().or(z.literal('')),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3).max(50).toUpperCase().trim().optional(),
    name: z.string().min(2).max(255).trim().optional(),
    description: z.string().optional().or(z.literal('')),
    category: z.string().min(2).max(100).trim().optional(),
    hsnCode: z.string().regex(HSN_REGEX, 'HSN code must be 4 to 8 digits').optional().or(z.literal('')),
    gstRate: z.number().min(0).max(100).optional(),
    unit: z.nativeEnum(UnitType).optional(),
    purchasePrice: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    openingStock: z.number().min(0).optional(),
    currentStock: z.number().min(0).optional(),
    minimumStock: z.number().min(0).optional(),
    reservedStock: z.number().min(0).optional(),
    internalCode: z.string().optional().or(z.literal('')),
    customerPartNumber: z.string().optional().or(z.literal('')),
    material: z.string().optional().or(z.literal('')),
    weight: z.number().optional(),
    finish: z.string().optional().or(z.literal('')),
    drawingNumber: z.string().optional().or(z.literal('')),
    revision: z.string().optional().or(z.literal('')),
    cadDrawingUrl: z.string().optional().or(z.literal('')),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    quantity: z.number({ required_error: 'Adjustment quantity is required' }),
    type: z.enum(['ADD', 'SUBTRACT'], { required_error: 'Type must be ADD or SUBTRACT' }),
    reference: z.string().optional().or(z.literal('')),
  }),
});
