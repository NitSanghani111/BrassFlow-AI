"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_repository_1 = require("../repositories/user.repository");
const userRepository = new user_repository_1.UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
class AuthService {
    async login(email, password, ipAddress, userAgent) {
        // 1. Fetch user by email
        const user = await userRepository.findByEmail(email);
        if (!user || !user.isActive) {
            throw new Error('Invalid email or password');
        }
        // 2. Validate password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // 3. Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
        // 4. Calculate expiration timestamp for the session
        const refreshExpiresInDays = parseInt(JWT_REFRESH_EXPIRES_IN) || 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshExpiresInDays);
        // 5. Store session in DB
        await userRepository.createSession({
            userId: user.id,
            token: refreshToken,
            expiresAt,
            ipAddress,
            userAgent,
        });
        const { passwordHash: _, ...userWithoutHash } = user;
        return {
            accessToken,
            refreshToken,
            user: userWithoutHash,
        };
    }
    async refresh(token, ipAddress, userAgent) {
        // 1. Find session in DB
        const session = await userRepository.findSessionByToken(token);
        if (!session || session.expiresAt < new Date()) {
            if (session) {
                await userRepository.deleteSessionByToken(token);
            }
            throw new Error('Session expired or invalid');
        }
        // 2. Verify JWT signature
        try {
            jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        }
        catch {
            await userRepository.deleteSessionByToken(token);
            throw new Error('Session expired or invalid');
        }
        // 3. Generate new tokens
        const accessToken = jsonwebtoken_1.default.sign({ userId: session.userId, role: session.user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const newRefreshToken = jsonwebtoken_1.default.sign({ userId: session.userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
        // 4. Delete old session and store new one
        await userRepository.deleteSessionByToken(token);
        const refreshExpiresInDays = parseInt(JWT_REFRESH_EXPIRES_IN) || 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshExpiresInDays);
        await userRepository.createSession({
            userId: session.userId,
            token: newRefreshToken,
            expiresAt,
            ipAddress,
            userAgent,
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(token) {
        await userRepository.deleteSessionByToken(token);
    }
}
exports.AuthService = AuthService;
