import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { validate } from '../middleware/validate.middleware';
import { createInvoiceSchema, updateInvoiceStatusSchema } from '../validators/invoice.validator';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const invoiceController = new InvoiceController();

// Protect all invoice routes with JWT authentication
router.use(authenticateJWT);

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', validate(createInvoiceSchema), invoiceController.createInvoice);
router.put('/:id/status', validate(updateInvoiceStatusSchema), invoiceController.updateInvoiceStatus);
router.get('/:id/pdf', invoiceController.downloadInvoicePDF);

export default router;
