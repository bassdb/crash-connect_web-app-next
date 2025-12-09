import { createClient } from '@/server/supabase/server'
import { createSuperClient } from '@/server/supabase/superadmin'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Calendar, ArrowRight, Eye, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { Team } from '@/types/teams-types'

export default async function TeamsPage() {
  const supabase = await createClient()
  const superClient = await createSuperClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Fetch user's teams with full team data
  const { data: teamMemberships, error: teamMembershipsError } = await supabase
    .from('team_members')
    .select(
      `
      team_id,
      role,
      teams (
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
      )
    `
    )
    .eq('user_id', user.id)

  if (teamMembershipsError) {
    console.error(teamMembershipsError)
  }

  // Transform data to include team info and user role
  const userTeams =
    teamMemberships?.map((membership) => ({
      ...(membership.teams as unknown as Team),
      userRole: membership.role,
    })) || []

  // Ausstehende Einladungen für den angemeldeten Benutzer laden
  interface PendingInvitation {
    id: string
    team_id: string
    email: string
    role: 'owner' | 'admin' | 'member'
    token: string
    expires_at: string
    created_at: string
    teams: {
      id: string
      name: string
      slug: string
      team_logo_url: string | null
    } | null
  }

  const nowIso = new Date().toISOString()
  const { data: pendingInvitationsRaw, error: pendingInvitationsError } = await superClient
    .from('team_invitations')
    .select(
      `
      id,
      team_id,
      email,
      role,
      token,
      expires_at,
      created_at,
      teams (
        id,
        name,
        slug,
        team_logo_url
      )
    `
    )
    .eq('email', user.email as string)
    .is('accepted_at', null)
    .gt('expires_at', nowIso)

  if (pendingInvitationsError) {
    console.error(pendingInvitationsError)
  }

  const pendingInvitations = (pendingInvitationsRaw as unknown as PendingInvitation[]) || []

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'member':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className='container mx-auto'>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Deine Teams</h1>
          <Link href='/teams/create-team'>
            <Button className='gap-2'>
              <Plus className='w-4 h-4' />
              Neues Team
            </Button>
          </Link>
        </div>

        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ausstehende Einladungen</CardTitle>
              <CardDescription>
                Du wurdest zu {pendingInvitations.length} Team
                {pendingInvitations.length > 1 ? 's' : ''} eingeladen
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <Avatar className='w-8 h-8'>
                      <AvatarImage
                        src={inv.teams?.team_logo_url || ''}
                        alt={inv.teams?.name || 'Team'}
                      />
                      <AvatarFallback className='text-xs font-medium'>
                        {inv.teams?.name
                          ? inv.teams.name
                              .split(' ')
                              .map((w) => w.charAt(0))
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : 'TM'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium truncate'>
                          {inv.teams?.name || 'Unbekanntes Team'}
                        </span>
                        <Badge variant={getRoleBadgeVariant(inv.role)} className='text-xs'>
                          {inv.role === 'owner'
                            ? 'Besitzer'
                            : inv.role === 'admin'
                              ? 'Admin'
                              : 'Mitglied'}
                        </Badge>
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Eingeladen am {formatDate(inv.created_at)} · Läuft ab{' '}
                        {formatDate(inv.expires_at)}
                      </div>
                    </div>
                  </div>
                  <div className='shrink-0'>
                    <Link href={`/teams/invite/${inv.token}`}>
                      <Button size='sm' className='gap-2'>
                        Einladung ansehen
                        <ArrowUpRight className='w-4 h-4' />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {userTeams.length === 0 ? (
          <Card className='text-center'>
            <CardContent>
              <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='w-8 h-8 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Du bist noch kein Teil eines Teams.</h3>
              <p className='text-muted-foreground mb-6'>Erstelle jetzt ein neues Team.</p>
              <Link href='/teams/create-team'>
                <Button className='gap-2'>
                  <Plus className='w-4 h-4' />
                  Neues Team erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {userTeams.map((team) => (
              <Card
                key={team.id}
                className='hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-3'>
                      <Avatar className='w-12 h-12'>
                        <AvatarImage src={team.team_logo_url || ''} alt={team.name} />
                        <AvatarFallback className='text-sm font-medium'>
                          {getInitials(team.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className='text-lg'>{team.name}</CardTitle>
                        <Badge variant={getRoleBadgeVariant(team.userRole)} className='text-xs'>
                          {team.userRole === 'owner'
                            ? 'Besitzer'
                            : team.userRole === 'admin'
                              ? 'Admin'
                              : 'Mitglied'}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/teams/${team.id}`}>
                      <Button variant='ghost' size='sm' className='gap-2'>
                        <ArrowRight className='w-4 h-4 text-muted-foreground' />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  {team.description && (
                    <CardDescription className='mb-3 line-clamp-2'>
                      {team.description}
                    </CardDescription>
                  )}
                  <div className='flex items-center text-xs text-muted-foreground mb-3'>
                    <Calendar className='w-3 h-3 mr-1' />
                    Erstellt am {formatDate(team.created_at)}
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='text-xs text-muted-foreground'>
                      Status:{' '}
                      {team.status === 'active'
                        ? 'Aktiv'
                        : team.status === 'inactive'
                          ? 'Inaktiv'
                          : 'Archiviert'}
                    </div>
                    {team.colors && team.colors.length > 0 && (
                      <div className='flex gap-1'>
                        {team.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className='w-3 h-3 rounded-full border border-border'
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                        {team.colors.length > 3 && (
                          <div className='text-xs text-muted-foreground flex items-center'>
                            +{team.colors.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className='flex justify-end pt-2'>
                  <Link href={`/teams/${team.id}`}>
                    <Button variant='ghost' size='sm' className='gap-2'>
                      <Eye className='w-4 h-4' />
                      Anzeigen
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
