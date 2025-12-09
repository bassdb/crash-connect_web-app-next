'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTeamLogoUrl(
  teamId: string,
  logoUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Update team team_logo_url in database
    const { error: updateError } = await supabase
      .from('teams')
      .update({ team_logo_url: logoUrl })
      .eq('id', teamId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return { success: false, error: updateError.message }
    }

    // Revalidate the page to show updated data
    revalidatePath('/admin-dashboard/team-accounts/manage-example-teams')

    return { success: true }
  } catch (error) {
    console.error('Error updating team logo:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}
