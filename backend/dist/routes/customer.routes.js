"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const customer_validator_1 = require("../validators/customer.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const customerController = new customer_controller_1.CustomerController();
// Protect all customer routes with JWT authentication
router.use(auth_middleware_1.authenticateJWT);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', (0, validate_middleware_1.validate)(customer_validator_1.createCustomerSchema), customerController.createCustomer);
router.put('/:id', (0, validate_middleware_1.validate)(customer_validator_1.updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
exports.default = router;
