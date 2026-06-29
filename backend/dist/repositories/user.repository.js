"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../config/prisma");
class UserRepository {
    async findByEmail(email) {
        return prisma_1.prisma.user.findFirst({
            where: {
                email,
                isDeleted: false,
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.user.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }
    async createUser(data) {
        return prisma_1.prisma.user.create({
            data,
        });
    }
    async createSession(data) {
        return prisma_1.prisma.session.create({
            data,
        });
    }
    async findSessionByToken(token) {
        return prisma_1.prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });
    }
    async deleteSessionByToken(token) {
        await prisma_1.prisma.session.deleteMany({
            where: { token },
        });
    }
    async deleteExpiredSessions() {
        await prisma_1.prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
}
exports.UserRepository = UserRepository;
