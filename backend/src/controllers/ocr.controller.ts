import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';
import { OCRService } from '../services/ocr.service';
import { logger } from '../utils/logger';
import { OCRDocumentType } from '@prisma/client';

const ocrService = new OCRService();

export class OCRController {
  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a PDF or image document.',
        });
        return;
      }

      const fileType = req.body.documentType as OCRDocumentType || OCRDocumentType.INVOICE;
      logger.info(`Received file upload: ${req.file.originalname} of type ${fileType}`);

      // Create OCR document in database
      const doc = await prisma.oCRDocument.create({
        data: {
          fileName: req.file.originalname,
          fileUrl: `/uploads/ocr/${req.file.filename}`,
          documentType: fileType,
          status: 'PENDING',
        },
      });

      // Execute OCR asynchronously in the background so request is not blocked
      ocrService.processDocument(doc.id).catch((err) => {
        logger.error(`Background OCR process failed for ${doc.id}: ${err.message}`);
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded and queued for AI OCR processing',
        data: doc,
      });
    } catch (error: any) {
      logger.error(`Failed uploading OCR document: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while uploading document',
      });
    }
  }

  async getAllDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all OCR documents');
      const docs = await prisma.oCRDocument.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: docs,
      });
    } catch (error: any) {
      logger.error(`Failed fetching OCR docs: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching documents',
      });
    }
  }

  async getDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching OCR document: ${id}`);

      const doc = await prisma.oCRDocument.findUnique({
        where: { id },
      });

      if (!doc) {
        res.status(404).json({
          success: false,
          message: 'Document not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error: any) {
      logger.error(`Failed fetching OCR doc details: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching document details',
      });
    }
  }

  async reviewDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      logger.info(`OCR Document marked as reviewed: ${id} by user: ${userId}`);

      const doc = await prisma.oCRDocument.findUnique({ where: { id } });
      if (!doc) {
        res.status(404).json({
          success: false,
          message: 'Document not found',
        });
        return;
      }

      const updated = await prisma.oCRDocument.update({
        where: { id },
        data: {
          reviewed: true,
          reviewedAt: new Date(),
          reviewedById: userId,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Document review state updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error(`Failed reviewing OCR doc: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while reviewing document',
      });
    }
  }
}
