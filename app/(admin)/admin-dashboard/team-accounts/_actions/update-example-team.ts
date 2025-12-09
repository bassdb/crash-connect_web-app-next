'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateExampleTeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Team-Name ist erforderlich'),
  description: z.string().nullable(),
  slug: z
    .string()
    .min(1, 'Slug ist erforderlich')
    .regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt'),
  status: z.enum(['active', 'inactive', 'archived']),
  is_default: z.boolean(),
  team_logo_url: z.string().nullable(),
  colors: z
    .array(
      z.object({
        name: z.string().min(1, 'Farbname ist erforderlich'),
        value: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Gültiger Hex-Farbcode erforderlich'),
        label: z.string().min(1, 'Farbbezeichnung ist erforderlich'),
      })
    )
    .optional(),
})

export type UpdateExampleTeamInput = z.infer<typeof updateExampleTeamSchema>

export async function updateExampleTeam(input: UpdateExampleTeamInput) {
  try {
    // Validate input
    const validatedInput = updateExampleTeamSchema.parse(input)

    const supabase = await createClient()

    // Prepare update data
    const updateData: Record<string, any> = {
      name: validatedInput.name,
      description: validatedInput.description,
      slug: validatedInput.slug,
      status: validatedInput.status,
      is_default: validatedInput.is_default,
      team_logo_url: validatedInput.team_logo_url,
      updated_at: new Date().toISOString(),
    }

    // Add colors if provided
    if (validatedInput.colors) {
      updateData.colors = validatedInput.colors
    }

    // Update team data
    const { error: updateError } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', validatedInput.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, data: validatedInput }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validierungsfehler: ' + error.errors.map((e) => e.message).join(', '),
      }
    }

    console.error('Error updating example team:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}
