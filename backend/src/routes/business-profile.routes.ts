import { Router } from 'express';
import { BusinessProfileController } from '../controllers/business-profile.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();
const controller = new BusinessProfileController();

// Protect all settings with JWT
router.use(authenticateJWT);

router.get('/', controller.getProfile);
router.post('/', controller.updateProfile);

export default router;
