"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const invoice_repository_1 = require("../repositories/invoice.repository");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const invoiceRepository = new invoice_repository_1.InvoiceRepository();
class InvoiceController {
    async getAllInvoices(req, res, next) {
        try {
            logger_1.logger.info('Fetching all invoices');
            const invoices = await invoiceRepository.findMany();
            res.status(200).json({
                success: true,
                data: invoices,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch invoices: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching invoices',
            });
        }
    }
    async getInvoiceById(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Fetching invoice by ID: ${id}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch invoice: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching invoice details',
            });
        }
    }
    async createInvoice(req, res, next) {
        try {
            const userId = req.user?.userId;
            logger_1.logger.info(`Creating invoice requested by user: ${userId}`);
            const invoice = await invoiceRepository.create(req.body, userId);
            res.status(201).json({
                success: true,
                message: 'Invoice created and finalized successfully',
                data: invoice,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to create invoice: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error occurred while creating invoice',
            });
        }
    }
    async updateInvoiceStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            logger_1.logger.info(`Updating status of invoice: ${id} to ${status}`);
            const invoice = await invoiceRepository.updateStatus(id, status);
            res.status(200).json({
                success: true,
                message: 'Invoice status updated successfully',
                data: invoice,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to update invoice status: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating invoice status',
            });
        }
    }
    async downloadInvoicePDF(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Downloading PDF for invoice: ${id}`);
            const invoice = await invoiceRepository.findById(id);
            if (!invoice || !invoice.pdfUrl) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice PDF not found or not generated yet',
                });
                return;
            }
            const filename = path_1.default.basename(invoice.pdfUrl);
            const filePath = path_1.default.join(process.cwd(), 'uploads', 'invoices', filename);
            if (!fs_1.default.existsSync(filePath)) {
                res.status(404).json({
                    success: false,
                    message: 'Invoice PDF file does not exist on disk',
                });
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.download(filePath, filename);
        }
        catch (error) {
            logger_1.logger.error(`Failed to download PDF: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while retrieving invoice PDF',
            });
        }
    }
}
exports.InvoiceController = InvoiceController;
