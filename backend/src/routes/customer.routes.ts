import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { validate } from '../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const customerController = new CustomerController();

// Protect all customer routes with JWT authentication
router.use(authenticateJWT);

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.put('/:id', validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
