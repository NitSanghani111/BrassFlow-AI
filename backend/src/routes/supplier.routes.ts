import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { validate } from '../middleware/validate.middleware';
import { createSupplierSchema, updateSupplierSchema } from '../validators/supplier.validator';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const supplierController = new SupplierController();

// Protect all supplier routes with JWT authentication
router.use(authenticateJWT);

router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', validate(createSupplierSchema), supplierController.createSupplier);
router.put('/:id', validate(updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

export default router;
