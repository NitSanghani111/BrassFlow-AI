import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      logger.info(`Login attempt for email: ${email}`);
      const result = await authService.login(email, password, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      logger.warn(`Login failed: ${error.message}`);
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid email or password',
      });
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      logger.info('Token refresh requested');
      const result = await authService.refresh(refreshToken, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      logger.warn(`Token refresh failed: ${error.message}`);
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid refresh token',
      });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      logger.info('Logout requested');
      await authService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error(`Logout error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout',
      });
    }
  }
}
