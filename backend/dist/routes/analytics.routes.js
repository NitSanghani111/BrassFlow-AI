"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const analyticsController = new analytics_controller_1.AnalyticsController();
// Protect analytics routes with JWT authentication
router.use(auth_middleware_1.authenticateJWT);
router.get('/dashboard', analyticsController.getDashboardStats);
exports.default = router;
