import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(2, 'First name must be at least 2 characters')
      .max(100)
      .trim(),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .min(2, 'Last name must be at least 2 characters')
      .max(100)
      .trim(),
    role: z.nativeEnum(UserRole, {
      required_error: 'A valid user role is required',
    }),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});
