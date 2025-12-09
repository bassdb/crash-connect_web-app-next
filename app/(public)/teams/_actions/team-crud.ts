'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionClient } from '@/lib/safe-action'
import { uploadTeamAsset } from '../_lib/team-assets'
import { checkUserRole } from '@/lib/check-session-and-role'
import {
  createTeamSchema,
  updateTeamSchema,
  deleteTeamSchema,
  updateTeamColorsSchema,
} from './team-schemas'
import type { Team } from '@/types/teams-types'

// CRUD-Operationen für Teams
export const createTeam = actionClient.schema(createTeamSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nicht authentifiziert' }
  }

  // RBAC: Nur Creator und höher dürfen Teams erstellen
  const roleCheck = await checkUserRole()
  if (!roleCheck || !roleCheck.isCreatorOrAbove) {
    return { error: 'Nicht autorisiert: Sie benötigen mindestens die Rolle Creator.' }
  }

  // Check if slug already exists
  const { data: existingTeam } = await supabase
    .from('teams')
    .select('id')
    .eq('slug', parsedInput.slug)
    .single()

  if (existingTeam) {
    return { error: 'Ein Team mit diesem Slug existiert bereits' }
  }

  let logoUrl = parsedInput.team_logo_url || null

  // Create team with automatic owner assignment
  const { data: team, error: teamError } = await supabase.rpc('create_team_with_owner', {
    team_name: parsedInput.name,
    team_description: parsedInput.description || null,
    team_slug: parsedInput.slug,
    team_avatar_url: logoUrl,
  })

  // Nach Erstellung: optionale Updates (Farben, Default-Flag)
  if (team) {
    const updatePayload: Record<string, unknown> = {}
    if (parsedInput.colors && parsedInput.colors.length > 0) {
      updatePayload.colors = parsedInput.colors
    }
    if (parsedInput.is_default) {
      updatePayload.is_default = true
    }
    if (Object.keys(updatePayload).length > 0) {
      await supabase.from('teams').update(updatePayload).eq('id', team)
    }
  }

  if (teamError) {
    return { error: `Fehler beim Erstellen des Teams: ${teamError.message}` }
  }

  // Handle logo file upload if provided
  if (parsedInput.logo_file && team) {
    try {
      const uploadResult = await uploadTeamAsset(team, parsedInput.logo_file, 'logo')

      if (uploadResult) {
        // Update team with logo URL
        await supabase
          .from('teams')
          .update({ team_logo_url: uploadResult.publicUrl })
          .eq('id', team)
      }
    } catch (error) {
      console.error('Error uploading team logo:', error)
      // Don't fail team creation if logo upload fails
    }
  }

  revalidatePath('/teams')
  return { team_id: team }
})

export const updateTeam = actionClient.schema(updateTeamSchema).action(async ({ parsedInput }) => {
  const { team_id, ...updateData } = parsedInput

  // Prüfen ob Benutzer Owner ist
  const { checkTeamPermission } = await import('./team-permissions')
  const isOwner = await checkTeamPermission(team_id, 'owner')
  if (!isOwner) {
    return { error: 'Nur Team-Owner können Teams bearbeiten' }
  }

  const supabase = await createClient()

  // Wenn Slug geändert wird, prüfen ob er bereits existiert
  if (updateData.slug) {
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', updateData.slug)
      .neq('id', team_id)
      .single()

    if (existingTeam) {
      return { error: 'Ein Team mit diesem Slug existiert bereits' }
    }
  }

  const { data: team, error } = await supabase
    .from('teams')
    .update(updateData)
    .eq('id', team_id)
    .select()
    .single()

  if (error) {
    return { error: `Fehler beim Aktualisieren des Teams: ${error.message}` }
  }

  revalidatePath('/teams')
  revalidatePath(`/teams/${team.slug}`)
  return { team }
})

export const deleteTeam = actionClient.schema(deleteTeamSchema).action(async ({ parsedInput }) => {
  // Prüfen ob Benutzer Owner ist
  const { checkTeamPermission } = await import('./team-permissions')
  const isOwner = await checkTeamPermission(parsedInput.team_id, 'owner')
  if (!isOwner) {
    return { error: 'Nur Team-Owner können Teams löschen' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('teams').delete().eq('id', parsedInput.team_id)

  if (error) {
    return { error: `Fehler beim Löschen des Teams: ${error.message}` }
  }

  revalidatePath('/teams')
  return { success: true }
})

// Neue Server Action für Team-Farben
export const updateTeamColors = actionClient
  .schema(updateTeamColorsSchema)
  .action(async ({ parsedInput }) => {
    const { team_id, colors } = parsedInput

    // Prüfen ob Benutzer Owner oder Admin ist
    const { checkTeamPermission } = await import('./team-permissions')
    const isOwnerOrAdmin = await checkTeamPermission(team_id, 'admin')
    if (!isOwnerOrAdmin) {
      return { error: 'Nur Team-Owner und Admins können Team-Farben bearbeiten' }
    }

    const supabase = await createClient()

    const { data: team, error } = await supabase
      .from('teams')
      .update({ colors })
      .eq('id', team_id)
      .select()
      .single()

    if (error) {
      return { error: `Fehler beim Aktualisieren der Team-Farben: ${error.message}` }
    }

    revalidatePath('/teams')
    revalidatePath(`/teams/${team.slug}`)
    return { team }
  })

export const getTeam = async (teamId: string): Promise<Team | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single()

  if (error || !data) return null
  return data
}

export const getTeamBySlug = async (slug: string): Promise<Team | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase.from('teams').select('*').eq('slug', slug).single()

  if (error || !data) return null
  return data
}

export const getUserTeams = async (): Promise<Team[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      *,
      team_members!inner(user_id)
    `
    )
    .eq('team_members.user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data
}

export const getDefaultTeams = async (): Promise<Team[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('is_default', true)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data
}
