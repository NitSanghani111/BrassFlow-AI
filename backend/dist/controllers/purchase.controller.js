"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseController = void 0;
const purchase_repository_1 = require("../repositories/purchase.repository");
const logger_1 = require("../utils/logger");
const purchaseRepository = new purchase_repository_1.PurchaseRepository();
class PurchaseController {
    async getAllPurchases(req, res, next) {
        try {
            logger_1.logger.info('Fetching all purchases');
            const purchases = await purchaseRepository.findMany();
            res.status(200).json({
                success: true,
                data: purchases,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch purchases: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching purchases',
            });
        }
    }
    async getPurchaseById(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Fetching purchase by ID: ${id}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch purchase: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching purchase details',
            });
        }
    }
    async createPurchase(req, res, next) {
        try {
            const userId = req.user?.userId;
            logger_1.logger.info(`Creating purchase entry requested by user: ${userId}`);
            const purchase = await purchaseRepository.create(req.body, userId);
            res.status(201).json({
                success: true,
                message: 'Purchase entry created successfully and stock adjusted',
                data: purchase,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to create purchase: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error occurred while creating purchase',
            });
        }
    }
    async updatePurchaseStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user?.userId;
            logger_1.logger.info(`Updating status of purchase: ${id} to ${status}`);
            const purchase = await purchaseRepository.updateStatus(id, status, userId);
            res.status(200).json({
                success: true,
                message: 'Purchase status updated successfully',
                data: purchase,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to update purchase status: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating purchase status',
            });
        }
    }
}
exports.PurchaseController = PurchaseController;
