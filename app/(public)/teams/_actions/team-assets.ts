'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionClient } from '@/lib/safe-action'
import { updateTeamLogoSchema, removeTeamLogoSchema } from './team-schemas'
import type { Team } from '@/types/teams-types'

// Asset-Verwaltung (Logo)
export const updateTeamLogo = actionClient
  .schema(updateTeamLogoSchema)
  .action(async ({ parsedInput }) => {
    const { team_id, team_logo_url } = parsedInput

    // Prüfen ob Benutzer Owner oder Admin ist
    const { checkTeamPermission } = await import('./team-permissions')
    const canUpdate = await checkTeamPermission(team_id, ['owner', 'admin'])
    if (!canUpdate) {
      return { error: 'Nur Team-Owner und Admins können das Logo ändern' }
    }

    const supabase = await createClient()

    const { data: team, error } = await supabase
      .from('teams')
      .update({ avatar_url: team_logo_url })
      .eq('id', team_id)
      .select()
      .single()

    if (error) {
      return { error: `Fehler beim Aktualisieren des Team-Logos: ${error.message}` }
    }

    revalidatePath('/teams')
    revalidatePath(`/teams/${team.slug}`)
    return { team }
  })

export const removeTeamLogo = actionClient
  .schema(removeTeamLogoSchema)
  .action(async ({ parsedInput }) => {
    const { team_id } = parsedInput

    // Prüfen ob Benutzer Owner oder Admin ist
    const { checkTeamPermission } = await import('./team-permissions')
    const canUpdate = await checkTeamPermission(team_id, ['owner', 'admin'])
    if (!canUpdate) {
      return { error: 'Nur Team-Owner und Admins können das Logo entfernen' }
    }

    const supabase = await createClient()

    const { data: team, error } = await supabase
      .from('teams')
      .update({ avatar_url: null })
      .eq('id', team_id)
      .select()
      .single()

    if (error) {
      return { error: `Fehler beim Entfernen des Team-Logos: ${error.message}` }
    }

    revalidatePath('/teams')
    revalidatePath(`/teams/${team.slug}`)
    return { team }
  }) 