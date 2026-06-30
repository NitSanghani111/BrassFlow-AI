import { prisma } from '../config/prisma';
import { BusinessProfile } from '@prisma/client';

export class BusinessProfileRepository {
  async get(): Promise<BusinessProfile | null> {
    return prisma.businessProfile.findFirst();
  }

  async upsert(data: {
    companyName: string;
    address: string;
    gstin?: string;
    pan?: string;
    email?: string;
    phone?: string;
    logoUrl?: string;
    smtpEmail?: string;
    smtpPassword?: string;
    smtpHost?: string;
    smtpPort?: number;
  }): Promise<BusinessProfile> {
    const existing = await prisma.businessProfile.findFirst();
    if (existing) {
      return prisma.businessProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return prisma.businessProfile.create({
        data,
      });
    }
  }
}
