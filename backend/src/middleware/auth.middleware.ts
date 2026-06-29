import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: Missing or invalid Authorization header');
    res.status(401).json({
      success: false,
      message: 'Access token is required',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: UserRole;
    };

    req.user = decoded;
    next();
  } catch (error: any) {
    logger.warn(`Authentication failed: Invalid token - ${error.message}`);
    res.status(403).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('Role verification failed: Request user object is missing');
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Access denied: User ${req.user.userId} with role ${req.user.role} tried to access resource requiring [${allowedRoles.join(', ')}]`
      );
      res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions',
      });
      return;
    }

    next();
  };
};
