"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentReminderController = void 0;
const prisma_1 = require("../config/prisma");
const reminder_service_1 = require("../services/reminder.service");
const logger_1 = require("../utils/logger");
const reminderService = new reminder_service_1.ReminderService();
class PaymentReminderController {
    async getAllReminders(req, res, next) {
        try {
            logger_1.logger.info('Fetching all payment reminders');
            const reminders = await prisma_1.prisma.paymentReminder.findMany({
                include: {
                    invoice: {
                        include: {
                            customer: true,
                        },
                    },
                },
                orderBy: { nextReminderDate: 'asc' },
            });
            res.status(200).json({
                success: true,
                data: reminders,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch payment reminders: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching reminders',
            });
        }
    }
    async createReminder(req, res, next) {
        try {
            const { invoiceId, reminderFrequency, channel, nextReminderDate } = req.body;
            logger_1.logger.info(`Creating payment reminder for invoice: ${invoiceId}`);
            // Check if invoice exists
            const invoice = await prisma_1.prisma.invoice.findUnique({ where: { id: invoiceId } });
            if (!invoice) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice not found',
                });
                return;
            }
            const reminder = await prisma_1.prisma.paymentReminder.create({
                data: {
                    invoiceId,
                    reminderFrequency,
                    channel,
                    nextReminderDate,
                },
            });
            res.status(201).json({
                success: true,
                message: 'Payment reminder scheduled successfully',
                data: reminder,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to create payment reminder: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while scheduling reminder',
            });
        }
    }
    async triggerReminderManual(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Manual reminder dispatch requested for ID: ${id}`);
            const reminder = await prisma_1.prisma.paymentReminder.findUnique({ where: { id } });
            if (!reminder) {
                res.status(404).json({
                    success: false,
                    message: 'Payment reminder configuration not found',
                });
                return;
            }
            const result = await reminderService.sendReminder(id);
            res.status(200).json({
                success: true,
                message: 'Follow-up notification sent successfully',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed manual reminder dispatch: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Error occurred while sending follow-up notification',
            });
        }
    }
    async getReminderLogs(req, res, next) {
        try {
            logger_1.logger.info('Fetching payment reminder execution audit trail');
            const logs = await prisma_1.prisma.reminderLog.findMany({
                include: {
                    reminder: {
                        include: {
                            invoice: {
                                include: {
                                    customer: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { sentAt: 'desc' },
            });
            res.status(200).json({
                success: true,
                data: logs,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed fetching reminder logs: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching notification audit logs',
            });
        }
    }
}
exports.PaymentReminderController = PaymentReminderController;
