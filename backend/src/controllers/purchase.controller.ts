import { Response, NextFunction } from 'express';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const purchaseRepository = new PurchaseRepository();

export class PurchaseController {
  async getAllPurchases(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all purchases');
      const purchases = await purchaseRepository.findMany();
      res.status(200).json({
        success: true,
        data: purchases,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch purchases: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching purchases',
      });
    }
  }

  async getPurchaseById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching purchase by ID: ${id}`);
      const purchase = await purchaseRepository.findById(id);

      if (!purchase) {
        res.status(404).json({
          success: false,
          message: 'Purchase not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: purchase,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch purchase: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching purchase details',
      });
    }
  }

  async createPurchase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      logger.info(`Creating purchase entry requested by user: ${userId}`);

      const purchase = await purchaseRepository.create(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Purchase entry created successfully and stock adjusted',
        data: purchase,
      });
    } catch (error: any) {
      logger.error(`Failed to create purchase: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Error occurred while creating purchase',
      });
    }
  }

  async updatePurchaseStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;
      logger.info(`Updating status of purchase: ${id} to ${status}`);

      const purchase = await purchaseRepository.updateStatus(id, status, userId);
      res.status(200).json({
        success: true,
        message: 'Purchase status updated successfully',
        data: purchase,
      });
    } catch (error: any) {
      logger.error(`Failed to update purchase status: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating purchase status',
      });
    }
  }
}
