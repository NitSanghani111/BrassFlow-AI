import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { Response } from 'express';

const router = Router();
const authController = new AuthController();
const userRepository = new UserRepository();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', validate(refreshTokenSchema), authController.logout);

// Protected routes test & fetch current user profile
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
