import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { validate } from '../middleware/validate.middleware';
import { createPurchaseSchema, updatePurchaseStatusSchema } from '../validators/purchase.validator';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const purchaseController = new PurchaseController();

// Protect all purchase routes with JWT authentication
router.use(authenticateJWT);

router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', validate(createPurchaseSchema), purchaseController.createPurchase);
router.put('/:id/status', validate(updatePurchaseStatusSchema), purchaseController.updatePurchaseStatus);

export default router;
