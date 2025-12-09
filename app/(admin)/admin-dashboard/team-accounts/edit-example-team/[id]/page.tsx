import { createClient } from '@/server/supabase/server'
import { encodedRedirect } from '@/utils/utils'
import { checkUserRole } from '@/lib/check-session-and-role'
import { notFound } from 'next/navigation'
import EditExampleTeamForm from './edit-example-team-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditExampleTeamPage({ params }: PageProps) {
  // RBAC: nur Admins und darüber (inkl. Product Owner/Owner, Superadmin)
  const role = await checkUserRole()
  if (!role) {
    return encodedRedirect('error', '/auth-feedback', 'Fehler beim Rollen-Check.')
  }
  const { isAdminOrAbove } = role
  if (!isAdminOrAbove) {
    return encodedRedirect('error', '/auth-feedback', 'Nicht autorisiert.')
  }

  const { id } = await params
  const supabase = await createClient()

  // Team-Daten abrufen
  const { data: team, error } = await supabase
    .from('teams')
    .select(
      `
      id, 
      name, 
      description, 
      slug, 
      team_logo_url, 
      is_default, 
      status, 
      colors, 
      created_at, 
      updated_at
    `
    )
    .eq('id', id)
    .eq('is_default', true)
    .single()

  if (error || !team) {
    notFound()
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Beispiel Team bearbeiten</h1>
        <p className='text-muted-foreground'>Bearbeiten Sie die Eigenschaften von"{team.name}".</p>
      </div>

      <EditExampleTeamForm team={{ ...team, other_creators_can_use_example_team: false }} />
    </div>
  )
}
