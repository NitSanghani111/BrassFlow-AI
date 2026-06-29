"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStockSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const HSN_REGEX = /^[0-9]{4,8}$/; // Indian standard HSN is typically 4, 6 or 8 digits
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        sku: zod_1.z.string({ required_error: 'SKU is required' }).min(3).max(50).toUpperCase().trim(),
        name: zod_1.z.string({ required_error: 'Product name is required' }).min(2).max(255).trim(),
        description: zod_1.z.string().optional().or(zod_1.z.literal('')),
        category: zod_1.z.string({ required_error: 'Category is required' }).min(2).max(100).trim(),
        hsnCode: zod_1.z.string().regex(HSN_REGEX, 'HSN code must be 4 to 8 digits').optional().or(zod_1.z.literal('')),
        gstRate: zod_1.z.number().min(0).max(100).default(18.00),
        unit: zod_1.z.nativeEnum(client_1.UnitType).default(client_1.UnitType.KG),
        purchasePrice: zod_1.z.number().min(0, 'Purchase price must be non-negative'),
        sellingPrice: zod_1.z.number().min(0, 'Selling price must be non-negative'),
        openingStock: zod_1.z.number().min(0).default(0),
        currentStock: zod_1.z.number().min(0).default(0),
        minimumStock: zod_1.z.number().min(0).default(0),
        reservedStock: zod_1.z.number().min(0).default(0),
        internalCode: zod_1.z.string().optional().or(zod_1.z.literal('')),
        customerPartNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
        material: zod_1.z.string().optional().or(zod_1.z.literal('')),
        weight: zod_1.z.number().optional(),
        finish: zod_1.z.string().optional().or(zod_1.z.literal('')),
        drawingNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
        revision: zod_1.z.string().optional().or(zod_1.z.literal('')),
        cadDrawingUrl: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        sku: zod_1.z.string().min(3).max(50).toUpperCase().trim().optional(),
        name: zod_1.z.string().min(2).max(255).trim().optional(),
        description: zod_1.z.string().optional().or(zod_1.z.literal('')),
        category: zod_1.z.string().min(2).max(100).trim().optional(),
        hsnCode: zod_1.z.string().regex(HSN_REGEX, 'HSN code must be 4 to 8 digits').optional().or(zod_1.z.literal('')),
        gstRate: zod_1.z.number().min(0).max(100).optional(),
        unit: zod_1.z.nativeEnum(client_1.UnitType).optional(),
        purchasePrice: zod_1.z.number().min(0).optional(),
        sellingPrice: zod_1.z.number().min(0).optional(),
        openingStock: zod_1.z.number().min(0).optional(),
        currentStock: zod_1.z.number().min(0).optional(),
        minimumStock: zod_1.z.number().min(0).optional(),
        reservedStock: zod_1.z.number().min(0).optional(),
        internalCode: zod_1.z.string().optional().or(zod_1.z.literal('')),
        customerPartNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
        material: zod_1.z.string().optional().or(zod_1.z.literal('')),
        weight: zod_1.z.number().optional(),
        finish: zod_1.z.string().optional().or(zod_1.z.literal('')),
        drawingNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
        revision: zod_1.z.string().optional().or(zod_1.z.literal('')),
        cadDrawingUrl: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
exports.adjustStockSchema = zod_1.z.object({
    body: zod_1.z.object({
        quantity: zod_1.z.number({ required_error: 'Adjustment quantity is required' }),
        type: zod_1.z.enum(['ADD', 'SUBTRACT'], { required_error: 'Type must be ADD or SUBTRACT' }),
        reference: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
