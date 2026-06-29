import { prisma } from '../config/prisma';
import { Prisma, User, Session } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  async findSessionByToken(token: string): Promise<(Session & { user: User }) | null> {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteSessionByToken(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
