"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email('Invalid email address')
            .trim()
            .toLowerCase(),
        password: zod_1.z
            .string({ required_error: 'Password is required' })
            .min(6, 'Password must be at least 6 characters long'),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email('Invalid email address')
            .trim()
            .toLowerCase(),
        password: zod_1.z
            .string({ required_error: 'Password is required' })
            .min(6, 'Password must be at least 6 characters long'),
        firstName: zod_1.z
            .string({ required_error: 'First name is required' })
            .min(2, 'First name must be at least 2 characters')
            .max(100)
            .trim(),
        lastName: zod_1.z
            .string({ required_error: 'Last name is required' })
            .min(2, 'Last name must be at least 2 characters')
            .max(100)
            .trim(),
        role: zod_1.z.nativeEnum(client_1.UserRole, {
            required_error: 'A valid user role is required',
        }),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string({ required_error: 'Refresh token is required' }),
    }),
});
