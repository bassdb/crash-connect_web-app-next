import { createSuperClient } from '@/server/supabase/superadmin'
import { encodedRedirect } from '@/utils/utils'
import { checkUserRole } from '@/lib/check-session-and-role'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, Eye, Users } from 'lucide-react'
import Link from 'next/link'
import DeleteExampleTeam from './delete-example-team'

interface DefaultTeam {
  id: string
  name: string
  description: string | null
  slug: string
  team_logo_url: string | null
  is_default: boolean
  status: 'active' | 'inactive' | 'archived'
  colors: any
  created_at: string
  updated_at: string
  member_count?: number
  category?: TeamCategory[] | TeamCategory | null
}

interface TeamCategory {
  id: string
  name: string
}

export default async function ManageExampleTeamsPage() {
  // RBAC: nur Admins und darüber (inkl. Product Owner/Owner, Superadmin)
  const role = await checkUserRole()
  if (!role) {
    return encodedRedirect('error', '/auth-feedback', 'Fehler beim Rollen-Check.')
  }
  const { isAdminOrAbove } = role
  if (!isAdminOrAbove) {
    return encodedRedirect('error', '/auth-feedback', 'Nicht autorisiert.')
  }

  const supabaseAdmin = await createSuperClient()

  // Alle Standard-Teams abrufen
  const { data: defaultTeams, error } = await supabaseAdmin
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
      updated_at,
      category:team_categories ( id, name )
    `
    )
    .eq('is_default', true)
    .order('created_at', { ascending: false })

  if (error) {
    return encodedRedirect('error', '/auth-feedback', 'Fehler beim Laden der Standard-Teams.')
  }

  // Mitgliederanzahl für jedes Team abrufen
  const teamsWithMemberCount: DefaultTeam[] = await Promise.all(
    (defaultTeams || []).map(async (team) => {
      const { count } = await supabaseAdmin
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)

      return {
        ...team,
        member_count: count || 0,
      }
    })
  )

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Beispiel-Teams verwalten</h1>
          <p className='text-muted-foreground'>
            Verwalten Sie die vordefinierten Beispiel-Teams, die neuen Benutzern zur Verfügung
            gestellt werden.
          </p>
        </div>
        <Link href='/admin-dashboard/team-accounts/create-example-team'>
          <Button>
            <Users className='mr-2 h-4 w-4' />
            Neues Beispiel-Team erstellen
          </Button>
        </Link>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Gesamt Standard-Teams</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{teamsWithMemberCount.length}</div>
            <p className='text-xs text-muted-foreground'>Vordefinierte Teams im System</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Aktive Teams</CardTitle>
            <Badge variant='default' className='h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {teamsWithMemberCount.filter((t) => t.status === 'active').length}
            </div>
            <p className='text-xs text-muted-foreground'>Teams mit aktivem Status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Gesamt Mitglieder</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {teamsWithMemberCount.reduce((sum, team) => sum + (team.member_count || 0), 0)}
            </div>
            <p className='text-xs text-muted-foreground'>Alle Mitglieder in Standard-Teams</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Standard-Teams Übersicht</CardTitle>
          <CardDescription>
            Diese Teams werden neuen Benutzern als Beispiele angezeigt und können als Vorlagen
            verwendet werden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamsWithMemberCount.length === 0 ? (
            <div className='h-24 flex items-center justify-center text-center text-sm text-muted-foreground'>
              Keine Standard-Teams gefunden.
            </div>
          ) : (
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {teamsWithMemberCount.map((team) => (
                <div
                  key={team.id}
                  className='rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden h-full flex flex-col'
                >
                  <div className='p-6 flex flex-col items-center justify-center'>
                    <Avatar className='h-16 w-16'>
                      <AvatarImage src={team.team_logo_url || ''} alt={team.name} />
                      <AvatarFallback className='bg-primary text-primary-foreground text-xl'>
                        {team.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='mt-4 text-center'>
                      <Link
                        href={`/admin-dashboard/team-accounts/edit-example-team/${team.id}`}
                        className='font-semibold hover:underline'
                        title='Team bearbeiten'
                      >
                        {team.name}
                      </Link>
                      {team.is_default && (
                        <div className='mt-1'>
                          <Badge variant='secondary'>Standard</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='px-6 pb-4 flex-1'>
                    <div className='flex items-center justify-between text-sm mb-2'>
                      <span className='text-muted-foreground'>Kategorie</span>
                      <span className='font-medium'>
                        {Array.isArray(team.category)
                          ? (team.category[0]?.name ?? '—')
                          : (team.category?.name ?? '—')}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm mb-2'>
                      <span className='text-muted-foreground'>Status</span>
                      <span>
                        <Badge
                          variant={
                            team.status === 'active'
                              ? 'default'
                              : team.status === 'inactive'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {team.status === 'active'
                            ? 'Aktiv'
                            : team.status === 'inactive'
                              ? 'Inaktiv'
                              : 'Archiviert'}
                        </Badge>
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm mb-2'>
                      <span className='text-muted-foreground'>Mitglieder</span>
                      <span className='font-medium flex items-center gap-1'>
                        <Users className='h-4 w-4 text-muted-foreground' />
                        {team.member_count}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='flex gap-1'>
                        {team.colors &&
                          Object.entries(team.colors)
                            .slice(0, 4)
                            .map(([key, color]) => (
                              <div
                                key={key}
                                className='w-4 h-4 rounded-md border border-border'
                                style={{ backgroundColor: color as string }}
                                title={`${key}: ${color}`}
                              />
                            ))}
                      </div>
                    </div>
                  </div>
                  <div className='border-t bg-muted/50 px-4 py-3 flex items-center justify-between mt-auto'>
                    <div className='flex items-center gap-2'>
                      <DeleteExampleTeam teamId={team.id} teamName={team.name} />
                    </div>
                    <div className='flex items-center gap-2'>
                      <Link href={`/teams/${team.slug}`}>
                        <Button variant='ghost' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </Link>
                      <Link href={`/admin-dashboard/team-accounts/edit-example-team/${team.id}`}>
                        <Button
                          variant='outline'
                          size='sm'
                          aria-label={`Team ${team.name} bearbeiten`}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
