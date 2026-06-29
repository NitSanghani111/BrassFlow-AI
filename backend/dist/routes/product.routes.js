"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const product_validator_1 = require("../validators/product.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// Protect all product routes with JWT authentication
router.use(auth_middleware_1.authenticateJWT);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', (0, validate_middleware_1.validate)(product_validator_1.createProductSchema), productController.createProduct);
router.put('/:id', (0, validate_middleware_1.validate)(product_validator_1.updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/adjust-stock', (0, validate_middleware_1.validate)(product_validator_1.adjustStockSchema), productController.adjustStock);
exports.default = router;
