"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger");
const prisma_1 = require("./config/prisma");
const PORT = process.env.PORT || 5000;
const server = app_1.default.listen(PORT, () => {
    logger_1.logger.info(`=================================`);
    logger_1.logger.info(`  Server running on port ${PORT}`);
    logger_1.logger.info(`  Environment: ${process.env.NODE_ENV}`);
    logger_1.logger.info(`  Health check: http://localhost:${PORT}/api/health`);
    logger_1.logger.info(`=================================`);
});
// Clean shutdown handlers
const shutdown = async () => {
    logger_1.logger.info('Received shutdown signal. Closing server...');
    server.close(async () => {
        logger_1.logger.info('HTTP server closed.');
        // Disconnect Prisma Client
        await prisma_1.prisma.$disconnect();
        logger_1.logger.info('Database connection closed.');
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
