import { createClient } from '@/server/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Calendar,
  Settings,
  Plus,
  ArrowLeft,
  User,
  Shield,
  Crown,
  Upload,
  Trash,
  Image,
  Palette,
  Link as LinkIcon,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import type { Team } from '@/types/teams-types'
import { TeamLogoUpload } from '../_components/team-logo-upload'

interface TeamPageProps {
  params: {
    id: string
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const supabase = await createClient()

  // Await params for Next.js 15 compatibility
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Fetch team details
  const { data: team, error: teamError } = await supabase
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
    .single()

  if (teamError || !team) {
    return notFound()
  }

  // Fetch user's role in this team
  const { data: userMembership, error: membershipError } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', id)
    .eq('user_id', user.id)
    .single()

  if (membershipError || !userMembership) {
    return redirect('/teams')
  }

  // Fetch team members
  const { data: teamMembers, error: membersError } = await supabase
    .from('team_members')
    .select('role, joined_at, user_id')
    .eq('team_id', id)

  // Fetch profiles for team members
  let memberProfiles: any[] = []
  if (teamMembers && teamMembers.length > 0) {
    const userIds = teamMembers.map((member) => member.user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, team_logo_url')
      .in('id', userIds)

    if (!profilesError && profiles) {
      memberProfiles = profiles
    }
  }

  if (membersError) {
    console.error('Error fetching team members:', membersError)
  }

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className='w-4 h-4' />
      case 'admin':
        return <Shield className='w-4 h-4' />
      case 'member':
        return <User className='w-4 h-4' />
      default:
        return <User className='w-4 h-4' />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Besitzer'
      case 'admin':
        return 'Admin'
      case 'member':
        return 'Mitglied'
      default:
        return 'Mitglied'
    }
  }

  const isOwnerOrAdmin = userMembership.role === 'owner' || userMembership.role === 'admin'

  return (
    <div className='w-full px-4'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <Link href='/teams'>
          <Button variant='ghost' size='sm' className='gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Zurück zu allen Teams
          </Button>
        </Link>
        <div className='flex flex-row items-start gap-6'>
          <div className='flex flex-col items-start gap-4'>
            <div className='flex items-center gap-3'>
              <Avatar className='w-12 h-12'>
                <AvatarImage src={team.team_logo_url || ''} alt={team.name} />
                <AvatarFallback className='text-lg font-semibold'>
                  {getInitials(team.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className='text-2xl font-bold'>{team.name}</h1>
                <div className='flex items-center gap-2'>
                  <Badge variant={getRoleBadgeVariant(userMembership.role)} className='text-xs'>
                    {getRoleLabel(userMembership.role)}
                  </Badge>
                  <span className='text-sm text-muted-foreground'>
                    Erstellt am {formatDate(team.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className='flex items-center mx-4'>
            <div className='h-16 w-px bg-border' />
          </div>
          <div className='flex flex-col justify-center'>
            <h2 className='text-2xl font-bold'>Dashboard</h2>
          </div>
        </div>

        {/* Team Navigation Submenu */}
        <div className='w-full'>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
            <Link href={`/teams/${id}/members`}>
              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                    <Users className='w-5 h-5 text-primary' />
                  </div>
                  <span className='text-sm font-medium'>Mitglieder</span>
                  <span className='text-xs text-muted-foreground'>Verwalten</span>
                </div>
              </div>
            </Link>

            <Link href={`/teams/${id}/assets`}>
              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div className='w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors'>
                    <Image className='w-5 h-5 text-blue-500' />
                  </div>
                  <span className='text-sm font-medium'>Assets</span>
                  <span className='text-xs text-muted-foreground'>Medien</span>
                </div>
              </div>
            </Link>

            <Link href={`/teams/${id}/designs`}>
              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors'>
                    <Palette className='w-5 h-5 text-green-500' />
                  </div>
                  <span className='text-sm font-medium'>Designs</span>
                  <span className='text-xs text-muted-foreground'>Erstellt</span>
                </div>
              </div>
            </Link>

            <Link href={`/teams/${id}/connections`}>
              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div className='w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors'>
                    <LinkIcon className='w-5 h-5 text-purple-500' />
                  </div>
                  <span className='text-sm font-medium'>Verbindungen</span>
                  <span className='text-xs text-muted-foreground'>Integrationen</span>
                </div>
              </div>
            </Link>

            <Link href={`/teams/${id}/scheduler`}>
              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div className='w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors'>
                    <Clock className='w-5 h-5 text-orange-500' />
                  </div>
                  <span className='text-sm font-medium'>Scheduler</span>
                  <span className='text-xs text-muted-foreground'>Planung</span>
                </div>
              </div>
            </Link>

            <Link href={`/teams/${id}/colors`}>
              <div className='p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div className='w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors'>
                    <Palette className='w-5 h-5 text-pink-500' />
                  </div>
                  <span className='text-sm font-medium'>Farben</span>
                  <span className='text-xs text-muted-foreground'>Branding</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Team Description */}
        {team.description && (
          <Card>
            <CardContent className='pt-6'>
              <p className='text-muted-foreground leading-relaxed'>{team.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Team Stats */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <Users className='w-8 h-8 text-muted-foreground' />
                <div>
                  <p className='text-2xl font-bold'>{teamMembers?.length || 0}</p>
                  <p className='text-sm text-muted-foreground'>Mitglieder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <Calendar className='w-8 h-8 text-muted-foreground' />
                <div>
                  <p className='text-2xl font-bold'>{formatDate(team.created_at)}</p>
                  <p className='text-sm text-muted-foreground'>Erstellt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                  <span className='text-primary font-semibold text-sm'>
                    {team.status === 'active' ? 'A' : team.status === 'inactive' ? 'I' : 'V'}
                  </span>
                </div>
                <div>
                  <p className='text-2xl font-bold capitalize'>
                    {team.status === 'active'
                      ? 'Aktiv'
                      : team.status === 'inactive'
                        ? 'Inaktiv'
                        : 'Archiviert'}
                  </p>
                  <p className='text-sm text-muted-foreground'>Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Team-Mitglieder
                </CardTitle>
                <CardDescription>
                  {teamMembers?.length || 0} Mitglieder in diesem Team
                </CardDescription>
              </div>
              {isOwnerOrAdmin && (
                <Button asChild>
                  <Link href={`/teams/${id}/members`} className='gap-2'>
                    <Plus className='w-4 h-4' />
                    Mitglied verwalten
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {teamMembers && teamMembers.length > 0 ? (
              <div className='space-y-3'>
                {teamMembers.map((member, index) => {
                  const profile = memberProfiles.find((p) => p.id === member.user_id)
                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 rounded-lg border'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                          <AvatarImage
                            src={profile?.team_logo_url || ''}
                            alt={profile?.full_name || 'User'}
                          />
                          <AvatarFallback className='text-sm font-medium'>
                            {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>
                            {profile?.full_name || 'Unbekannter Benutzer'}
                          </p>
                          {profile?.username && (
                            <p className='text-sm text-muted-foreground'>@{profile.username}</p>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant={getRoleBadgeVariant(member.role)} className='gap-1'>
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          Seit {formatDate(member.joined_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Users className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>Noch keine Mitglieder in diesem Team</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Actions */}
        {isOwnerOrAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='w-5 h-5' />
                Team-Verwaltung
              </CardTitle>
              <CardDescription>
                Verwalten Sie die Einstellungen und Mitglieder Ihres Teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-3'>
                <Button variant='outline' className='gap-2'>
                  <Settings className='w-4 h-4' />
                  Einstellungen bearbeiten
                </Button>
                <Button variant='outline' className='gap-2'>
                  <Plus className='w-4 h-4' />
                  Mitglieder verwalten
                </Button>
                {userMembership.role === 'owner' && (
                  <Button variant='destructive' className='gap-2'>
                    <Trash className='w-4 h-4' />
                    Team löschen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logo Upload Section */}
        {isOwnerOrAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Upload className='w-5 h-5' />
                Team-Logo verwalten
              </CardTitle>
              <CardDescription>
                Laden Sie ein Logo für Ihr Team hoch oder ändern Sie das aktuelle Logo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamLogoUpload teamId={team.id} currentLogoUrl={team.team_logo_url} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
