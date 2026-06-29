"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_repository_1 = require("../repositories/product.repository");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const productRepository = new product_repository_1.ProductRepository();
class ProductController {
    async getAllProducts(req, res, next) {
        try {
            logger_1.logger.info('Fetching all products');
            const products = await productRepository.findMany();
            res.status(200).json({
                success: true,
                data: products,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch products: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching products',
            });
        }
    }
    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Fetching product by ID: ${id}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch product: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching product details',
            });
        }
    }
    async createProduct(req, res, next) {
        try {
            const { sku } = req.body;
            logger_1.logger.info(`Creating product with SKU: ${sku}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to create product: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error while creating product',
            });
        }
    }
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Updating product: ${id}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to update product: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error while updating product',
            });
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info(`Deleting product: ${id}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete product: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal server error while deleting product',
            });
        }
    }
    async adjustStock(req, res, next) {
        try {
            const { id } = req.params;
            const { quantity, type, reference } = req.body;
            const userId = req.user?.userId;
            logger_1.logger.info(`Adjusting stock for product: ${id} by amount: ${quantity} (${type})`);
            const txType = type === 'ADD' ? client_1.StockTransactionType.IN : client_1.StockTransactionType.OUT;
            const product = await productRepository.adjustStock(id, quantity, txType, client_1.StockReason.STOCK_ADJUSTMENT, reference || 'Manual Stock Adjustment', 'Manual stock entry from administration control panel', userId);
            res.status(200).json({
                success: true,
                message: 'Stock adjusted successfully',
                data: product,
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to adjust stock: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error occurred while adjusting stock',
            });
        }
    }
}
exports.ProductController = ProductController;
