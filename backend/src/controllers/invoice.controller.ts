import { Response, NextFunction } from 'express';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const invoiceRepository = new InvoiceRepository();

export class InvoiceController {
  async getAllInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all invoices');
      const invoices = await invoiceRepository.findMany();
      res.status(200).json({
        success: true,
        data: invoices,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch invoices: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching invoices',
      });
    }
  }

  async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching invoice by ID: ${id}`);
      const invoice = await invoiceRepository.findById(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch invoice: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching invoice details',
      });
    }
  }

  async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      logger.info(`Creating invoice requested by user: ${userId}`);

      const invoice = await invoiceRepository.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Invoice created and finalized successfully',
        data: invoice,
      });
    } catch (error: any) {
      logger.error(`Failed to create invoice: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Error occurred while creating invoice',
      });
    }
  }

  async updateInvoiceStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      logger.info(`Updating status of invoice: ${id} to ${status}`);

      const invoice = await invoiceRepository.updateStatus(id, status);
      res.status(200).json({
        success: true,
        message: 'Invoice status updated successfully',
        data: invoice,
      });
    } catch (error: any) {
      logger.error(`Failed to update invoice status: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating invoice status',
      });
    }
  }

  async downloadInvoicePDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Downloading PDF for invoice: ${id}`);

      const invoice = await invoiceRepository.findById(id);
      if (!invoice || !invoice.pdfUrl) {
        res.status(404).json({
          success: false,
          message: 'Invoice PDF not found or not generated yet',
        });
        return;
      }

      const filename = path.basename(invoice.pdfUrl);
      const filePath = path.join(process.cwd(), 'uploads', 'invoices', filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Invoice PDF file does not exist on disk',
        });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.download(filePath, filename);
    } catch (error: any) {
      logger.error(`Failed to download PDF: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving invoice PDF',
      });
    }
  }
}
