import { z } from 'zod'
import { UserRoles } from './supabase-types'

export const emailSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
})

export const otpSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  token: z.string().min(6, {
    message: 'OTP code must be at least 6 characters',
  }).max(6, {
    message: 'OTP code must be exactly 6 characters',
  }),
})

export const emailSchemaWithRole = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  role: z.nativeEnum(UserRoles),
})

export const userIdWithRoleSchema = z.object({
  userID: z.string(),
  role: z.nativeEnum(UserRoles),
})

export const userRoleSchema = z.object({
  role: z.nativeEnum(UserRoles),
})
