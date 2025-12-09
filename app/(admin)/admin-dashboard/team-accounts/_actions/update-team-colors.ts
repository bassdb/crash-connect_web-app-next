'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateTeamColorsSchema = z.object({
  team_id: z.string().uuid(),
  colors: z.array(
    z.object({
      name: z.string().min(1, 'Farbname ist erforderlich'),
      value: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Gültiger Hex-Farbcode erforderlich'),
      label: z.string().min(1, 'Farbbezeichnung ist erforderlich'),
    })
  ),
})

export type UpdateTeamColorsInput = z.infer<typeof updateTeamColorsSchema>

export async function updateTeamColors(input: UpdateTeamColorsInput) {
  try {
    // Validate input
    const validatedInput = updateTeamColorsSchema.parse(input)

    const supabase = await createClient()

    // Update team colors
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        colors: validatedInput.colors,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedInput.team_id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Revalidate the page to show updated data
    revalidatePath('/admin-dashboard/team-accounts/manage-example-teams')

    return { success: true, data: validatedInput }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validierungsfehler: ' + error.errors.map((e) => e.message).join(', '),
      }
    }

    console.error('Error updating team colors:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}
