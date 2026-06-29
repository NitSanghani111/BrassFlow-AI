"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supplier_controller_1 = require("../controllers/supplier.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const supplier_validator_1 = require("../validators/supplier.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const supplierController = new supplier_controller_1.SupplierController();
// Protect all supplier routes with JWT authentication
router.use(auth_middleware_1.authenticateJWT);
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', (0, validate_middleware_1.validate)(supplier_validator_1.createSupplierSchema), supplierController.createSupplier);
router.put('/:id', (0, validate_middleware_1.validate)(supplier_validator_1.updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);
exports.default = router;
