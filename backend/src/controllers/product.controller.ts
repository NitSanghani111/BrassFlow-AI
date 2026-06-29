import { Response, NextFunction } from 'express';
import { ProductRepository } from '../repositories/product.repository';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { StockTransactionType, StockReason } from '@prisma/client';

const productRepository = new ProductRepository();

export class ProductController {
  async getAllProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all products');
      const products = await productRepository.findMany();
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch products: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching products',
      });
    }
  }

  async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching product by ID: ${id}`);
      const product = await productRepository.findById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch product: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching product details',
      });
    }
  }

  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sku } = req.body;
      logger.info(`Creating product with SKU: ${sku}`);

      const existing = await productRepository.findBySku(sku);
      if (existing) {
        res.status(400).json({
          success: false,
          message: `Product SKU ${sku} already exists.`,
        });
        return;
      }

      const product = await productRepository.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      logger.error(`Failed to create product: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while creating product',
      });
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Updating product: ${id}`);

      const existing = await productRepository.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      const updated = await productRepository.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error(`Failed to update product: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while updating product',
      });
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Deleting product: ${id}`);

      const existing = await productRepository.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      await productRepository.delete(id);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully (soft-deleted)',
      });
    } catch (error: any) {
      logger.error(`Failed to delete product: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting product',
      });
    }
  }

  async adjustStock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity, type, reference } = req.body;
      const userId = req.user?.userId;

      logger.info(`Adjusting stock for product: ${id} by amount: ${quantity} (${type})`);

      const txType = type === 'ADD' ? StockTransactionType.IN : StockTransactionType.OUT;
      const product = await productRepository.adjustStock(
        id,
        quantity,
        txType,
        StockReason.STOCK_ADJUSTMENT,
        reference || 'Manual Stock Adjustment',
        'Manual stock entry from administration control panel',
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Stock adjusted successfully',
        data: product,
      });
    } catch (error: any) {
      logger.error(`Failed to adjust stock: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Error occurred while adjusting stock',
      });
    }
  }
}
