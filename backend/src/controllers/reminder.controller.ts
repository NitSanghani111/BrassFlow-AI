import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ReminderService } from '../services/reminder.service';
import { logger } from '../utils/logger';

const reminderService = new ReminderService();

export class PaymentReminderController {
  async getAllReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all payment reminders');
      const reminders = await prisma.paymentReminder.findMany({
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
    } catch (error: any) {
      logger.error(`Failed to fetch payment reminders: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching reminders',
      });
    }
  }

  async createReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invoiceId, reminderFrequency, channel, nextReminderDate } = req.body;
      logger.info(`Creating payment reminder for invoice: ${invoiceId}`);

      // Check if invoice exists
      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
        return;
      }

      const reminder = await prisma.paymentReminder.create({
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
    } catch (error: any) {
      logger.error(`Failed to create payment reminder: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while scheduling reminder',
      });
    }
  }

  async triggerReminderManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Manual reminder dispatch requested for ID: ${id}`);

      const reminder = await prisma.paymentReminder.findUnique({ where: { id } });
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
    } catch (error: any) {
      logger.error(`Failed manual reminder dispatch: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Error occurred while sending follow-up notification',
      });
    }
  }

  async getReminderLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching payment reminder execution audit trail');
      const logs = await prisma.reminderLog.findMany({
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
    } catch (error: any) {
      logger.error(`Failed fetching reminder logs: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching notification audit logs',
      });
    }
  }
}
