import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { ReminderFrequency, ReminderStatus, CommunicationChannel } from '@prisma/client';
import nodemailer from 'nodemailer';
import path from 'path';

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

    const pdfLink = `${process.env.API_BASE_URL || 'http://localhost:5000'}${invoice.pdfUrl}`;

    // Compile message templates
    let message = '';
    if (reminder.channel === CommunicationChannel.WHATSAPP) {
      message = `*BRASSFLOW INDUSTRIES BILLING REMINDER*\n\nDear Accounts Team at *${customer.companyName}*,\n\nThis is a friendly reminder that invoice *${invoiceNum}* of *${outstanding}* is due on *${dueDateStr}*.\n\nPlease process the payment at your earliest convenience.\n\nDownload Invoice PDF: ${pdfLink}\n\nBank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0000123\n\nThank you.`;
    } else if (reminder.channel === CommunicationChannel.EMAIL) {
      message = `Subject: Payment Due Notice: Invoice ${invoiceNum} - BrassFlow Industries\n\nDear Accounts Team,\n\nWe would like to remind you that invoice ${invoiceNum} total ${outstanding} is scheduled for payment by ${dueDateStr}.\n\nPlease find the PDF copy attached or view it on our customer portal.\n\nBest Regards,\nFinance Team\nBrassFlow Industries`;
    } else {
      message = `BrassFlow Reminder: Invoice ${invoiceNum} for ${outstanding} is due on ${dueDateStr}. Please clear at the earliest.`;
    }

    let status: ReminderStatus = ReminderStatus.SENT;

    if (reminder.channel === CommunicationChannel.EMAIL) {
      logger.info(`Sending actual email to ${recipient} with PDF attachment`);
      try {
        // Fetch SMTP credentials from BusinessProfile DB (per-client config)
        const bizProfile = await prisma.businessProfile.findFirst();
        const smtpHost = bizProfile?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = bizProfile?.smtpPort || Number(process.env.SMTP_PORT) || 587;
        const smtpUser = bizProfile?.smtpEmail || process.env.SMTP_USER;
        const smtpPass = bizProfile?.smtpPassword || process.env.SMTP_PASS;
        const fromAddress = bizProfile?.smtpEmail
          ? `"${bizProfile.companyName || 'AI Brass ERP'}" <${bizProfile.smtpEmail}>`
          : process.env.SMTP_FROM || `"AI Brass ERP" <${process.env.SMTP_USER}>`;

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        let attachments = undefined;
        if (invoice.pdfUrl) {
          const absolutePdfPath = path.join(process.cwd(), invoice.pdfUrl);
          attachments = [{
            filename: path.basename(invoice.pdfUrl),
            path: absolutePdfPath,
          }];
        }

        await transporter.sendMail({
          from: fromAddress,
          to: recipient,
          subject: `Payment Reminder: Invoice ${invoiceNum} - ${bizProfile?.companyName || 'BrassFlow Industries'}`,
          text: message,
          html: message.replace(/\n/g, '<br>'),
          attachments,
        });
        logger.info(`Email sent successfully to ${recipient}`);
      } catch (err: any) {
        logger.error(`Failed to send email to ${recipient}: ${err.message}`);
        status = ReminderStatus.FAILED;
      }
    } else {
      logger.info(`[MOCK DISPATCH] Sending ${reminder.channel} to ${recipient}:\n"${message}"`);
      // Simulate network delay for other channels
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Save reminder log
    await prisma.reminderLog.create({
      data: {
        reminderId,
        channel: reminder.channel,
        recipient,
        status,
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
    return {
      ...updated,
      whatsappUrl: reminder.channel === CommunicationChannel.WHATSAPP 
        ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(recipient.replace(/[^0-9]/g, ''))}&text=${encodeURIComponent(message)}`
        : null
    };
  }
}
