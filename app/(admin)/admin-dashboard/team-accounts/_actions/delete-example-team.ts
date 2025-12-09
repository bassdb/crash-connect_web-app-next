'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const deleteExampleTeamSchema = z.object({
  teamId: z.string().uuid(),
  teamName: z.string(),
})

export type DeleteExampleTeamInput = z.infer<typeof deleteExampleTeamSchema>

export async function deleteExampleTeam(input: DeleteExampleTeamInput) {
  try {
    // Validate input
    const validatedInput = deleteExampleTeamSchema.parse(input)

    const supabase = await createClient()

    // Delete team (this will cascade delete team_members and team_invitations)
    const { error } = await supabase.from('teams').delete().eq('id', validatedInput.teamId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate the manage-example-teams page to ensure UI reflects deletion
    revalidatePath('/admin-dashboard/team-accounts/manage-example-teams')
    return { success: true, data: validatedInput }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validierungsfehler: ' + error.errors.map((e) => e.message).join(', '),
      }
    }

    console.error('Error deleting example team:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}
