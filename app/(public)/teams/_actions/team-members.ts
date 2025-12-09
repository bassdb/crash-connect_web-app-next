'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionClient } from '@/lib/safe-action'
import { 
  inviteMemberSchema, 
  updateMemberSchema, 
  removeMemberSchema 
} from './team-schemas'
import type { TeamMember } from '@/types/teams-types'

// Mitgliederverwaltung
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
      *,
      profiles!user_id(id, email, full_name, avatar_url)
    `
    )
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true })

  if (error || !data) return []
  return data
}

export const updateTeamMember = actionClient
  .schema(updateMemberSchema)
  .action(async ({ parsedInput }) => {
    // Prüfen ob Benutzer Admin oder Owner ist
    const { checkTeamPermission } = await import('./team-permissions')
    const canUpdate = await checkTeamPermission(parsedInput.team_id, ['owner', 'admin'])
    if (!canUpdate) {
      return { error: 'Nur Team-Owner und Admins können Mitglieder bearbeiten' }
    }

    const supabase = await createClient()

    const { data: member, error } = await supabase
      .from('team_members')
      .update({ role: parsedInput.role })
      .eq('team_id', parsedInput.team_id)
      .eq('user_id', parsedInput.user_id)
      .select()
      .single()

    if (error) {
      return { error: `Fehler beim Aktualisieren des Mitglieds: ${error.message}` }
    }

    revalidatePath(`/teams/${parsedInput.team_id}/members`)
    return { member }
  })

export const removeTeamMember = actionClient
  .schema(removeMemberSchema)
  .action(async ({ parsedInput }) => {
    // Prüfen ob Benutzer Owner ist
    const { checkTeamPermission } = await import('./team-permissions')
    const isOwner = await checkTeamPermission(parsedInput.team_id, 'owner')
    if (!isOwner) {
      return { error: 'Nur Team-Owner können Mitglieder entfernen' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', parsedInput.team_id)
      .eq('user_id', parsedInput.user_id)

    if (error) {
      return { error: `Fehler beim Entfernen des Mitglieds: ${error.message}` }
    }

    revalidatePath(`/teams/${parsedInput.team_id}/members`)
    return { success: true }
  }) 