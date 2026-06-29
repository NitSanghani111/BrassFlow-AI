import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { ReminderFrequency, ReminderStatus, CommunicationChannel } from '@prisma/client';

export class ReminderService {
  async sendReminder(reminderId: string): Promise<any> {
    logger.info(`Triggering notification dispatch for payment reminder: ${reminderId}`);

    const reminder = await prisma.paymentReminder.findUnique({
      where: { id: reminderId },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!reminder || !reminder.isActive) {
      throw new Error('Active payment reminder not found');
    }

    const { invoice } = reminder;
    const { customer } = invoice;
    const recipient = reminder.channel === CommunicationChannel.EMAIL 
      ? (customer.email || 'accounts@client.com') 
      : customer.phone;

    const invoiceNum = invoice.invoiceNumber;
    const outstanding = Number(invoice.grandTotal).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      style: 'currency',
      currency: 'INR',
    });
    const dueDateStr = invoice.dueDate.toISOString().split('T')[0];

    // Compile message templates
    let message = '';
    if (reminder.channel === CommunicationChannel.WHATSAPP) {
      message = `*BRASSFLOW INDUSTRIES BILLING REMINDER*\n\nDear Accounts Team at *${customer.companyName}*,\n\nThis is a friendly reminder that invoice *${invoiceNum}* of *${outstanding}* is due on *${dueDateStr}*.\n\nPlease process the payment at your earliest convenience.\n\nBank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0000123\n\nThank you.`;
    } else if (reminder.channel === CommunicationChannel.EMAIL) {
      message = `Subject: Payment Due Notice: Invoice ${invoiceNum} - BrassFlow Industries\n\nDear Accounts Team,\n\nWe would like to remind you that invoice ${invoiceNum} total ${outstanding} is scheduled for payment by ${dueDateStr}.\n\nPlease find the PDF copy attached or view it on our customer portal.\n\nBest Regards,\nFinance Team\nBrassFlow Industries`;
    } else {
      message = `BrassFlow Reminder: Invoice ${invoiceNum} for ${outstanding} is due on ${dueDateStr}. Please clear at the earliest.`;
    }

    logger.info(`[MOCK DISPATCH] Sending ${reminder.channel} to ${recipient}:\n"${message}"`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save reminder log
    await prisma.reminderLog.create({
      data: {
        reminderId,
        channel: reminder.channel,
        recipient,
        status: ReminderStatus.SENT,
      },
    });

    // Calculate next reminder date based on frequency
    const currentNextDate = new Date(reminder.nextReminderDate);
    let daysToAdd = 7;
    if (reminder.reminderFrequency === ReminderFrequency.DAILY) daysToAdd = 1;
    else if (reminder.reminderFrequency === ReminderFrequency.WEEKLY) daysToAdd = 7;
    else if (reminder.reminderFrequency === ReminderFrequency.BI_WEEKLY) daysToAdd = 14;
    else if (reminder.reminderFrequency === ReminderFrequency.MONTHLY) daysToAdd = 30;

    const newNextDate = new Date();
    newNextDate.setDate(currentNextDate.getDate() + daysToAdd);

    // Update reminder record
    const updated = await prisma.paymentReminder.update({
      where: { id: reminderId },
      data: {
        nextReminderDate: newNextDate,
      },
    });

    logger.info(`Payment reminder: ${reminderId} updated. Next follow-up scheduled on: ${newNextDate.toISOString().split('T')[0]}`);
    return updated;
  }
}
