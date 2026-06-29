import { z } from 'zod';
import { ReminderFrequency, CommunicationChannel } from '@prisma/client';

export const createReminderSchema = z.object({
  body: z.object({
    invoiceId: z.string({ required_error: 'Invoice ID is required' }).uuid('Invalid Invoice ID format'),
    reminderFrequency: z.nativeEnum(ReminderFrequency).default(ReminderFrequency.WEEKLY),
    channel: z.nativeEnum(CommunicationChannel).default(CommunicationChannel.EMAIL),
    nextReminderDate: z.string({ required_error: 'Next reminder date is required' }).transform((val) => new Date(val)),
  }),
});

export const updateReminderSchema = z.object({
  body: z.object({
    reminderFrequency: z.nativeEnum(ReminderFrequency).optional(),
    channel: z.nativeEnum(CommunicationChannel).optional(),
    nextReminderDate: z.string().transform((val) => new Date(val)).optional(),
    isActive: z.boolean().optional(),
  }),
});
