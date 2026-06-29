"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const supplier_repository_1 = require("../repositories/supplier.repository");
const logger_1 = require("../utils/logger");
const supplierRepository = new supplier_repository_1.SupplierRepository();
class SupplierController {
    async getAllSuppliers(req, res, next) {
        try {
            logger_1.logger.info('Fetching all suppliers');
            const suppliers = await supplierRepository.findMany();
            res.status(200).json({
                success: true,
                data: suppliers,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch suppliers: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching suppliers',
            });
        }
    }
    async getSupplierById(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Fetching supplier by ID: ${id}`);
            const supplier = await supplierRepository.findById(id);
            if (!supplier) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: supplier,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch supplier: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching supplier details',
            });
        }
    }
    async createSupplier(req, res, next) {
        try {
            logger_1.logger.info(`Creating supplier: ${req.body.companyName}`);
            const supplier = await supplierRepository.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Supplier created successfully',
                data: supplier,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to create supplier: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error while creating supplier',
            });
        }
    }
    async updateSupplier(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Updating supplier: ${id}`);
            const existing = await supplierRepository.findById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found',
                });
                return;
            }
            const updated = await supplierRepository.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Supplier updated successfully',
                data: updated,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to update supplier: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error while updating supplier',
            });
        }
    }
    async deleteSupplier(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Deleting supplier: ${id}`);
            const existing = await supplierRepository.findById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Supplier not found',
                });
                return;
            }
            await supplierRepository.delete(id);
            res.status(200).json({
                success: true,
                message: 'Supplier deleted successfully (soft-deleted)',
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete supplier: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while deleting supplier',
            });
        }
    }
}
exports.SupplierController = SupplierController;
