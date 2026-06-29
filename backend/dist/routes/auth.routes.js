"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_repository_1 = require("../repositories/user.repository");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
const userRepository = new user_repository_1.UserRepository();
router.post('/login', (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), authController.login);
router.post('/refresh', (0, validate_middleware_1.validate)(auth_validator_1.refreshTokenSchema), authController.refresh);
router.post('/logout', (0, validate_middleware_1.validate)(auth_validator_1.refreshTokenSchema), authController.logout);
// Protected routes test & fetch current user profile
router.get('/me', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const user = await userRepository.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const { passwordHash: _, ...userWithoutHash } = user;
        res.status(200).json({
            success: true,
            data: userWithoutHash,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
