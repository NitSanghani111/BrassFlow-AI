import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import app from './app';
import { logger } from './utils/logger';
import { prisma } from './config/prisma';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`=================================`);
  logger.info(`  Server running on port ${PORT}`);
  logger.info(`  Environment: ${process.env.NODE_ENV}`);
  logger.info(`  Health check: http://localhost:${PORT}/api/health`);
  logger.info(`=================================`);
});

// Clean shutdown handlers
const shutdown = async () => {
  logger.info('Received shutdown signal. Closing server...');
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    // Disconnect Prisma Client
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
