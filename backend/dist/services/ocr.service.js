"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const logger_1 = require("../utils/logger");
class OCRService {
    async processDocument(documentId) {
        logger_1.logger.info(`Starting asynchronous AI OCR process for document: ${documentId}`);
        // Update status to PROCESSING
        await prisma_1.prisma.oCRDocument.update({
            where: { id: documentId },
            data: { status: client_1.OCRStatus.PROCESSING },
        });
        // Simulate 2.5 second delay for cloud AI model execution
        await new Promise((resolve) => setTimeout(resolve, 2500));
        try {
            const doc = await prisma_1.prisma.oCRDocument.findUnique({ where: { id: documentId } });
            if (!doc)
                throw new Error('Document record not found');
            // Generate realistic mock data based on type
            let extractedData = {};
            let confidenceScore = 95.80;
            if (doc.documentType === client_1.OCRDocumentType.PURCHASE_BILL) {
                extractedData = {
                    vendor: {
                        companyName: 'Saraswati Metal Scrap Merchants',
                        gstin: '24AAAPS1122D1Z9',
                        pan: 'AAAPS1122D',
                        address: 'Hapa Industrial Area, Jamnagar, Gujarat, 361005',
                    },
                    invoiceNumber: 'SMS-2026-049',
                    invoiceDate: '2026-06-28',
                    items: [
                        {
                            sku: 'BR-SCRP-HONEY',
                            description: 'Honey Grade Brass Scrap (Clean Cast)',
                            quantity: 1500.00,
                            unit: 'KG',
                            rate: 380.00,
                            taxableAmount: 570000.00,
                            gstRate: 18.00,
                            cgst: 51300.00,
                            sgst: 51300.00,
                            igst: 0.00,
                            total: 672600.00,
                        }
                    ],
                    totals: {
                        subtotal: 570000.00,
                        cgst: 51300.00,
                        sgst: 51300.00,
                        igst: 0.00,
                        discount: 0.00,
                        grandTotal: 672600.00,
                    }
                };
            }
            else {
                // Default generic invoice extract
                extractedData = {
                    vendor: {
                        companyName: 'Hindalco Zinc Division',
                        gstin: '27AAACH0099K1Z4',
                        address: 'Birla Centurion, Worli, Mumbai, Maharashtra, 400030',
                    },
                    invoiceNumber: 'HZ-99812-B',
                    invoiceDate: '2026-06-29',
                    items: [
                        {
                            sku: 'ZN-INGOT-99',
                            description: 'Zinc Ingot (99.9% Pure)',
                            quantity: 2000.00,
                            unit: 'KG',
                            rate: 240.00,
                            taxableAmount: 480000.00,
                            gstRate: 18.00,
                            cgst: 0.00,
                            sgst: 0.00,
                            igst: 86400.00,
                            total: 566400.00,
                        }
                    ],
                    totals: {
                        subtotal: 480000.00,
                        cgst: 0.00,
                        sgst: 0.00,
                        igst: 86400.00,
                        discount: 0.00,
                        grandTotal: 566400.00,
                    }
                };
                confidenceScore = 92.50;
            }
            // Update document record with findings
            const updatedDoc = await prisma_1.prisma.oCRDocument.update({
                where: { id: documentId },
                data: {
                    status: client_1.OCRStatus.COMPLETED,
                    extractedData,
                    confidenceScore,
                },
            });
            logger_1.logger.info(`OCR processing finished successfully for: ${documentId}`);
            return updatedDoc;
        }
        catch (error) {
            logger_1.logger.error(`OCR processing failed for document ${documentId}: ${error.message}`);
            return prisma_1.prisma.oCRDocument.update({
                where: { id: documentId },
                data: {
                    status: client_1.OCRStatus.FAILED,
                    errorMessage: error.message || 'Unknown OCR processing error',
                },
            });
        }
    }
}
exports.OCRService = OCRService;
