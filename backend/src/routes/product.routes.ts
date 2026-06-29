import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, adjustStockSchema } from '../validators/product.validator';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// Protect all product routes with JWT authentication
router.use(authenticateJWT);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', validate(createProductSchema), productController.createProduct);
router.put('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/adjust-stock', validate(adjustStockSchema), productController.adjustStock);

export default router;
