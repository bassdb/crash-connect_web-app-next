'use server'

import { createClient } from '@/server/supabase/server'
import type { TeamMemberRole } from '@/types/teams-types'

// Hilfsfunktionen für Berechtigungen
export async function getUserTeamRole(teamId: string, userId: string): Promise<TeamMemberRole | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.role
}

export async function checkTeamPermission(
  teamId: string,
  requiredRole: TeamMemberRole | TeamMemberRole[]
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const userRole = await getUserTeamRole(teamId, user.id)
  if (!userRole) return false

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }

  return userRole === requiredRole
} 