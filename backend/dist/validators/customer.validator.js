"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Indian GSTIN: 2 numbers, 10 alphanumeric (PAN), 1 number, 1 character, 1 'Z', 1 number/character
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
exports.createCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        companyName: zod_1.z.string({ required_error: 'Company name is required' }).min(2).max(255).trim(),
        contactName: zod_1.z.string({ required_error: 'Contact name is required' }).min(2).max(255).trim(),
        email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().min(10).max(15).optional().or(zod_1.z.literal('')),
        gstin: zod_1.z.string().regex(GSTIN_REGEX, 'Invalid Indian GSTIN structure').optional().or(zod_1.z.literal('')),
        pan: zod_1.z.string().regex(PAN_REGEX, 'Invalid PAN structure').optional().or(zod_1.z.literal('')),
        billingStreet: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingCity: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingState: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingZip: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingCountry: zod_1.z.string().default('India'),
        shippingStreet: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingCity: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingState: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingZip: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingCountry: zod_1.z.string().default('India'),
        paymentTermsDays: zod_1.z.number().int().min(0).default(30),
        status: zod_1.z.nativeEnum(client_1.CustomerStatus).default(client_1.CustomerStatus.ACTIVE),
        notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
exports.updateCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        companyName: zod_1.z.string().min(2).max(255).trim().optional(),
        contactName: zod_1.z.string().min(2).max(255).trim().optional(),
        email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().min(10).max(15).optional().or(zod_1.z.literal('')),
        gstin: zod_1.z.string().regex(GSTIN_REGEX, 'Invalid Indian GSTIN structure').optional().or(zod_1.z.literal('')),
        pan: zod_1.z.string().regex(PAN_REGEX, 'Invalid PAN structure').optional().or(zod_1.z.literal('')),
        billingStreet: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingCity: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingState: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingZip: zod_1.z.string().optional().or(zod_1.z.literal('')),
        billingCountry: zod_1.z.string().optional(),
        shippingStreet: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingCity: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingState: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingZip: zod_1.z.string().optional().or(zod_1.z.literal('')),
        shippingCountry: zod_1.z.string().optional(),
        outstandingBalance: zod_1.z.number().optional(),
        paymentTermsDays: zod_1.z.number().int().min(0).optional(),
        status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional(),
        notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
