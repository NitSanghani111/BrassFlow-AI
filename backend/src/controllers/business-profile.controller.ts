import { Request, Response, NextFunction } from 'express';
import { BusinessProfileRepository } from '../repositories/business-profile.repository';
import { logger } from '../utils/logger';

const profileRepository = new BusinessProfileRepository();

export class BusinessProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching business profile settings');
      let profile = await profileRepository.get();
      if (!profile) {
        // Return default placeholder parameters matching env or seed defaults
        profile = {
          id: '00000000-0000-0000-0000-000000000000',
          companyName: process.env.OWNER_COMPANY_NAME || 'BRASSFLOW INDUSTRIES',
          address: process.env.OWNER_ADDRESS || 'Plot 42, GIDC Industrial Estate Phase II, Jamnagar, Gujarat, 361004',
          gstin: process.env.OWNER_GSTIN || '24AAACB1234A1Z0',
          pan: process.env.OWNER_PAN || 'AAACB1234A',
          email: process.env.OWNER_EMAIL || 'accounts@brassflow.in',
          phone: process.env.OWNER_PHONE || '+91 98765 43210',
          logoUrl: process.env.OWNER_LOGO_PATH || '',
          smtpEmail: process.env.SMTP_USER || '',
          smtpPassword: process.env.SMTP_PASS || '',
          smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
          smtpPort: Number(process.env.SMTP_PORT) || 587,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch business profile: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching settings',
      });
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Updating business profile setting: ${req.body.companyName}`);
      const profile = await profileRepository.upsert(req.body);
      res.status(200).json({
        success: true,
        message: 'Business profile updated successfully',
        data: profile,
      });
    } catch (error: any) {
      logger.error(`Failed to update business profile: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while saving settings',
      });
    }
  }
}
