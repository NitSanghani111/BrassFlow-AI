"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reminder_controller_1 = require("../controllers/reminder.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const reminder_validator_1 = require("../validators/reminder.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const reminderController = new reminder_controller_1.PaymentReminderController();
// Protect all reminder routes
router.use(auth_middleware_1.authenticateJWT);
router.get('/', reminderController.getAllReminders);
router.post('/', (0, validate_middleware_1.validate)(reminder_validator_1.createReminderSchema), reminderController.createReminder);
router.post('/:id/trigger', reminderController.triggerReminderManual);
router.get('/logs', reminderController.getReminderLogs);
exports.default = router;
