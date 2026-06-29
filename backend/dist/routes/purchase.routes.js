"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchase_controller_1 = require("../controllers/purchase.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const purchase_validator_1 = require("../validators/purchase.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const purchaseController = new purchase_controller_1.PurchaseController();
// Protect all purchase routes with JWT authentication
router.use(auth_middleware_1.authenticateJWT);
router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', (0, validate_middleware_1.validate)(purchase_validator_1.createPurchaseSchema), purchaseController.createPurchase);
router.put('/:id/status', (0, validate_middleware_1.validate)(purchase_validator_1.updatePurchaseStatusSchema), purchaseController.updatePurchaseStatus);
exports.default = router;
