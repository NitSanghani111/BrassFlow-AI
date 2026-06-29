import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Protect analytics routes with JWT authentication
router.use(authenticateJWT);

router.get('/dashboard', analyticsController.getDashboardStats);

export default router;
