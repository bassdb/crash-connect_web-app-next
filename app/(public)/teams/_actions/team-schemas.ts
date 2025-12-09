import { z } from 'zod'

// Team Color Schema
export const teamColorSchema = z.object({
  name: z.string().min(1, 'Farbname ist erforderlich'),
  value: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültiger Hex-Farbcode'),
  label: z.string().min(1, 'Farbbezeichnung ist erforderlich'),
})

// Schema Validierung
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team-Name ist erforderlich').max(255),
  description: z.string().optional(),
  slug: z
    .string()
    .min(1, 'Slug ist erforderlich')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten'),
  team_logo_url: z.string().url().optional().or(z.literal('')),
  logo_file: z.any().optional(), // Add this for file upload
  colors: z.array(teamColorSchema).optional().default([]),
  // Optional, wird serverseitig bei Admin-Flow erzwungen
  is_default: z.boolean().optional().default(false),
})

export const updateTeamSchema = z.object({
  team_id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  team_logo_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  colors: z.array(teamColorSchema).optional(),
})

export const inviteMemberSchema = z.object({
  team_id: z.string().uuid(),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  role: z.enum(['owner', 'admin', 'member']),
})

export const updateMemberSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'member']),
})

export const removeMemberSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
})

export const acceptInvitationSchema = z.object({
  token: z.string(),
})

export const updateTeamLogoSchema = z.object({
  team_id: z.string().uuid(),
  team_logo_url: z.string().url(),
})

export const removeTeamLogoSchema = z.object({
  team_id: z.string().uuid(),
})

export const deleteTeamSchema = z.object({
  team_id: z.string().uuid(),
})

export const updateTeamColorsSchema = z.object({
  team_id: z.string().uuid(),
  colors: z.array(teamColorSchema),
})
