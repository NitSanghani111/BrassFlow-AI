"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger_1.logger.warn('Authentication failed: Missing or invalid Authorization header');
        res.status(401).json({
            success: false,
            message: 'Access token is required',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.logger.warn(`Authentication failed: Invalid token - ${error.message}`);
        res.status(403).json({
            success: false,
            message: 'Invalid or expired access token',
        });
    }
};
exports.authenticateJWT = authenticateJWT;
const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            logger_1.logger.warn('Role verification failed: Request user object is missing');
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            logger_1.logger.warn(`Access denied: User ${req.user.userId} with role ${req.user.role} tried to access resource requiring [${allowedRoles.join(', ')}]`);
            res.status(403).json({
                success: false,
                message: 'Access denied: Insufficient permissions',
            });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
