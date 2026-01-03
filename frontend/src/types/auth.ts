import { z } from 'zod'

// User roles
export const userRoleSchema = z.enum(['user', 'helpdesk_agent', 'admin'])
export type UserRole = z.infer<typeof userRoleSchema>

// User schema
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  role_label: z.string(),
  created_at: z.string(),
})
export type User = z.infer<typeof userSchema>

// Login credentials
export const loginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>

// Login response from backend
export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: userSchema,
    token: z.string(),
  }),
})
export type LoginResponse = z.infer<typeof loginResponseSchema>

// Password reset request
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>

// Password reset confirm
export const passwordResetConfirmSchema = z
  .object({
    token: z.string(),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>
