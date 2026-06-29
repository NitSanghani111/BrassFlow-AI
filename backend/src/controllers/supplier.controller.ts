import { Request, Response, NextFunction } from 'express';
import { SupplierRepository } from '../repositories/supplier.repository';
import { logger } from '../utils/logger';

const supplierRepository = new SupplierRepository();

export class SupplierController {
  async getAllSuppliers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all suppliers');
      const suppliers = await supplierRepository.findMany();
      res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch suppliers: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching suppliers',
      });
    }
  }

  async getSupplierById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching supplier by ID: ${id}`);
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
    } catch (error: any) {
      logger.error(`Failed to fetch supplier: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching supplier details',
      });
    }
  }

  async createSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Creating supplier: ${req.body.companyName}`);
      const supplier = await supplierRepository.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier,
      });
    } catch (error: any) {
      logger.error(`Failed to create supplier: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while creating supplier',
      });
    }
  }

  async updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Updating supplier: ${id}`);

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
    } catch (error: any) {
      logger.error(`Failed to update supplier: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while updating supplier',
      });
    }
  }

  async deleteSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Deleting supplier: ${id}`);

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
    } catch (error: any) {
      logger.error(`Failed to delete supplier: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting supplier',
      });
    }
  }
}
