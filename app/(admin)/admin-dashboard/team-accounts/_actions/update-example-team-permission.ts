'use server'

import { createClient } from '@/server/supabase/server'
import { z } from 'zod'

const updateExampleTeamPermissionSchema = z.object({
  id: z.string().uuid(),
  other_creators_can_use_example_team: z.boolean(),
})

export type UpdateExampleTeamPermissionInput = z.infer<typeof updateExampleTeamPermissionSchema>

export async function updateExampleTeamPermission(input: UpdateExampleTeamPermissionInput) {
  try {
    // Validate input
    const validatedInput = updateExampleTeamPermissionSchema.parse(input)

    const supabase = await createClient()

    // Update only the permission field
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        other_creators_can_use_example_team: validatedInput.other_creators_can_use_example_team,
        updated_at: new Date().toISOString(),
      })
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

    console.error('Error updating example team permission:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}
