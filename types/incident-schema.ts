import { z } from 'zod'

// Step 01 - Incident Type
export const incidentTypeSchema = z.object({
  qrToken: z.string().uuid(),
  incidentType: z.enum(['damage', 'theft', 'accident', 'vandalism', 'other']),
  turnstileToken: z.string().min(1),
  honeypot: z.string().optional().refine((val) => !val, {
    message: 'Bot detected'
  })
})

// Step 02 - Reporter Info
export const reporterInfoSchema = z.object({
  qrToken: z.string().uuid(),
  reporterName: z.string().min(2).max(100),
  reporterPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  reporterEmail: z.string().email().optional(),
  honeypot: z.string().optional()
})

// Step 03 - Incident Details
export const incidentDetailsSchema = z.object({
  qrToken: z.string().uuid(),
  incidentDescription: z.string().min(10).max(2000),
  incidentDate: z.string().datetime(),
  honeypot: z.string().optional()
})

// Step 04 - Phone Verification
export const phoneVerificationSchema = z.object({
  incidentId: z.string().uuid(),
  verificationCode: z.string().length(6).regex(/^\d{6}$/)
})

// Complete Incident Submission (merged schema)
export const completeIncidentSchema = incidentTypeSchema
  .merge(reporterInfoSchema)
  .merge(incidentDetailsSchema)

// Resend verification code schema
export const resendVerificationCodeSchema = z.object({
  incidentId: z.string().uuid()
})

