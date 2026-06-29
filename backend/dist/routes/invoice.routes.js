"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const invoice_validator_1 = require("../validators/invoice.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const invoiceController = new invoice_controller_1.InvoiceController();
// Protect all invoice routes with JWT authentication
router.use(auth_middleware_1.authenticateJWT);
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', (0, validate_middleware_1.validate)(invoice_validator_1.createInvoiceSchema), invoiceController.createInvoice);
router.put('/:id/status', (0, validate_middleware_1.validate)(invoice_validator_1.updateInvoiceStatusSchema), invoiceController.updateInvoiceStatus);
router.get('/:id/pdf', invoiceController.downloadInvoicePDF);
exports.default = router;
