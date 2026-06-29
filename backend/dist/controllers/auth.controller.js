"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("../utils/logger");
const authService = new auth_service_1.AuthService();
class AuthController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];
            logger_1.logger.info(`Login attempt for email: ${email}`);
            const result = await authService.login(email, password, ipAddress, userAgent);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.warn(`Login failed: ${error.message}`);
            res.status(401).json({
                success: false,
                message: error.message || 'Invalid email or password',
            });
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];
            logger_1.logger.info('Token refresh requested');
            const result = await authService.refresh(refreshToken, ipAddress, userAgent);
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.warn(`Token refresh failed: ${error.message}`);
            res.status(401).json({
                success: false,
                message: error.message || 'Invalid refresh token',
            });
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            logger_1.logger.info('Logout requested');
            await authService.logout(refreshToken);
            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            logger_1.logger.error(`Logout error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'An error occurred during logout',
            });
        }
    }
}
exports.AuthController = AuthController;
