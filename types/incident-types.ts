import { z } from 'zod'
import type { incidentTypeSchema, phoneVerificationSchema, completeIncidentSchema } from './incident-schema'

export type IncidentType = z.infer<typeof incidentTypeSchema>['incidentType']

export type PhoneVerificationInput = z.infer<typeof phoneVerificationSchema>

export type CompleteIncidentInput = z.infer<typeof completeIncidentSchema>

export interface IncidentTypeOption {
  value: IncidentType
  label: string
  icon: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export interface IncidentSubmissionResult {
  success?: string
  error?: string
  incidentId?: string
}

export interface PhoneVerificationResult {
  success?: string
  error?: string
  incidentId?: string
}

