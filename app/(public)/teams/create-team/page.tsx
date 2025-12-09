import { createClient } from '@/server/supabase/server'
import { redirect } from 'next/navigation'
import { TeamsPageClient } from '../_components/teams-page-client'
import { getUserTeams } from '@/app/(public)/teams/_actions'
import type { Team } from '@/types/teams-types'

export default async function CreateTeamPage() {
  const supabase = await createClient()

  // Benutzerautorisierungsprüfung
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Benutzer-Teams abrufen
  const userTeams = await getUserTeams()

  // Teams mit Benutzerrolle erweitern
  const { data: teamMemberships } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)

  const teamsWithUserRole: (Team & { userRole: string })[] = userTeams.map((team) => {
    const membership = teamMemberships?.find((m) => m.team_id === team.id)
    return {
      ...team,
      userRole: membership?.role || 'member',
    }
  })

  return <TeamsPageClient initialTeams={teamsWithUserRole} />
}
