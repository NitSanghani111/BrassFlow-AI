"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReminderSchema = exports.createReminderSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createReminderSchema = zod_1.z.object({
    body: zod_1.z.object({
        invoiceId: zod_1.z.string({ required_error: 'Invoice ID is required' }).uuid('Invalid Invoice ID format'),
        reminderFrequency: zod_1.z.nativeEnum(client_1.ReminderFrequency).default(client_1.ReminderFrequency.WEEKLY),
        channel: zod_1.z.nativeEnum(client_1.CommunicationChannel).default(client_1.CommunicationChannel.EMAIL),
        nextReminderDate: zod_1.z.string({ required_error: 'Next reminder date is required' }).transform((val) => new Date(val)),
    }),
});
exports.updateReminderSchema = zod_1.z.object({
    body: zod_1.z.object({
        reminderFrequency: zod_1.z.nativeEnum(client_1.ReminderFrequency).optional(),
        channel: zod_1.z.nativeEnum(client_1.CommunicationChannel).optional(),
        nextReminderDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
