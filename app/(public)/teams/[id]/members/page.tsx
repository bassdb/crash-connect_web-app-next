import { createClient } from '@/server/supabase/server'
import { createSuperClient } from '@/server/supabase/superadmin'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Plus,
  ArrowLeft,
  User,
  Shield,
  Crown,
  Mail,
  Search,
  MoreHorizontal,
  Settings,
  Trash2,
  Calendar,
  Mail as MailIcon,
  Clock,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { InviteMemberForm } from './invite-member-form'
import { PendingInvitationActions } from './pending-invitation-actions'

interface MembersPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const supabase = await createClient()
  const superClient = await createSuperClient()

  // Await params for Next.js 15 compatibility
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Fetch team details
  const { data: team, error: teamError } = await superClient
    .from('teams')
    .select('id, name, team_logo_url, slug')
    .eq('id', id)
    .single()

  if (teamError || !team) {
    return notFound()
  }

  // Fetch user's role in this team
  const { data: userMembership, error: membershipError } = await superClient
    .from('team_members')
    .select('role')
    .eq('team_id', id)
    .eq('user_id', user.id)
    .single()

  if (membershipError || !userMembership) {
    return redirect('/teams')
  }

  // Fetch team members
  const { data: teamMembers, error: membersError } = await superClient
    .from('team_members')
    .select('role, joined_at, user_id')
    .eq('team_id', id)
    .order('joined_at', { ascending: true })

  // Fetch profiles for team members
  let memberProfiles: any[] = []
  if (teamMembers && teamMembers.length > 0) {
    const userIds = teamMembers.map((member) => member.user_id)
    const { data: profiles, error: profilesError } = await superClient
      .from('profiles')
      .select('id, full_name, username, team_logo_url, email')
      .in('id', userIds)

    if (!profilesError && profiles) {
      memberProfiles = profiles
    }
  }

  // Fetch pending invitations (only not yet accepted)
  const { data: pendingInvitations, error: invitationsError } = await superClient
    .from('team_invitations')
    .select(
      `
      id,
      team_id,
      email,
      role,
      invited_by,
      token,
      expires_at,
      accepted_at,
      created_at
    `
    )
    .eq('team_id', id)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })

  // Fetch profiles for inviters
  let inviterProfiles: any[] = []
  if (pendingInvitations && pendingInvitations.length > 0) {
    const inviterIds = Array.from(
      new Set(
        pendingInvitations
          .map((invitation) => invitation.invited_by)
          .filter((val): val is string => Boolean(val))
      )
    )
    if (inviterIds.length > 0) {
      const { data: profiles, error: profilesError } = await superClient
        .from('profiles')
        .select('id, full_name, username, team_logo_url, email')
        .in('id', inviterIds)

      if (!profilesError && profiles) {
        inviterProfiles = profiles
      }
    }
  }

  if (membersError) {
    console.error('Error fetching team members:', membersError)
  }

  if (invitationsError) {
    console.error('Error fetching pending invitations:', invitationsError)
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
  const isOwner = userMembership.role === 'owner'

  return (
    <div className='w-full px-4'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex flex-col items-start gap-4'>
          <Link href={`/teams/${id}`}>
            <Button variant='ghost' size='sm' className='gap-2'>
              <ArrowLeft className='w-4 h-4' />
              Zurück zum Team
            </Button>
          </Link>
          <div className='flex items-center gap-3'>
            <Avatar className='w-12 h-12'>
              <AvatarImage src={team.team_logo_url || ''} alt={team.name} />
              <AvatarFallback className='text-lg font-semibold'>
                {getInitials(team.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-2xl font-bold'>Team-Mitglieder</h1>
              <p className='text-muted-foreground'>{team.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
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
              <div className='flex items-center gap-4'>
                <Crown className='w-8 h-8 text-muted-foreground' />
                <div>
                  <p className='text-2xl font-bold'>
                    {teamMembers?.filter((m) => m.role === 'owner').length || 0}
                  </p>
                  <p className='text-sm text-muted-foreground'>Besitzer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <Shield className='w-8 h-8 text-muted-foreground' />
                <div>
                  <p className='text-2xl font-bold'>
                    {teamMembers?.filter((m) => m.role === 'admin').length || 0}
                  </p>
                  <p className='text-sm text-muted-foreground'>Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <Clock className='w-8 h-8 text-muted-foreground' />
                <div>
                  <p className='text-2xl font-bold'>{pendingInvitations?.length || 0}</p>
                  <p className='text-sm text-muted-foreground'>Ausstehende Einladungen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add Member */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'></div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col items-start gap-2'>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Mitglieder ({teamMembers?.length || 0})
                </CardTitle>
                <CardDescription>Alle Mitglieder dieses Teams und ihre Rollen</CardDescription>
              </div>
              <div className='relative w-full sm:w-80'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input placeholder='Mitglieder durchsuchen...' className='pl-10' />
              </div>
              <div className='flex items-center gap-2'>
                {isOwnerOrAdmin && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className='gap-2'>
                        <Plus className='w-4 h-4' />
                        Mitglied einladen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Neues Mitglied einladen</DialogTitle>
                        <DialogDescription>
                          Laden Sie eine neue Person zu Ihrem Team ein. Sie erhalten eine
                          E-Mail-Einladung.
                        </DialogDescription>
                      </DialogHeader>
                      <InviteMemberForm teamId={id} userRole={userMembership.role} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {teamMembers && teamMembers.length > 0 ? (
              <div className='space-y-3'>
                {teamMembers.map((member, index) => {
                  const profile = memberProfiles.find((p) => p.id === member.user_id)
                  const isCurrentUser = member.user_id === user.id
                  const canManageMember =
                    isOwnerOrAdmin && !isCurrentUser && (isOwner || member.role !== 'owner')

                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors'
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
                          <div className='flex items-center gap-2'>
                            <p className='font-medium'>
                              {profile?.full_name || 'Unbekannter Benutzer'}
                            </p>
                            {isCurrentUser && (
                              <Badge variant='outline' className='text-xs'>
                                Sie
                              </Badge>
                            )}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            {profile?.username && <span>@{profile.username}</span>}
                            {profile?.email && (
                              <>
                                <span>•</span>
                                <span className='flex items-center gap-1'>
                                  <MailIcon className='w-3 h-3' />
                                  {profile.email}
                                </span>
                              </>
                            )}
                          </div>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
                            <Calendar className='w-3 h-3' />
                            Seit {formatDate(member.joined_at)}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Badge variant={getRoleBadgeVariant(member.role)} className='gap-1'>
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </Badge>
                        {canManageMember && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className='gap-2'>
                                <Settings className='w-4 h-4' />
                                Rolle ändern
                              </DropdownMenuItem>
                              <DropdownMenuItem className='gap-2 text-destructive'>
                                <Trash2 className='w-4 h-4' />
                                Aus Team entfernen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Users className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>Noch keine Mitglieder in diesem Team</p>
                {isOwnerOrAdmin && (
                  <Button className='mt-4 gap-2'>
                    <Plus className='w-4 h-4' />
                    Erstes Mitglied einladen
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='w-5 h-5' />
                Ausstehende Einladungen ({pendingInvitations.length})
              </CardTitle>
              <CardDescription>Einladungen, die noch nicht angenommen wurden</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {pendingInvitations.map((invitation) => {
                  const isExpired = new Date(invitation.expires_at) < new Date()
                  const invitedByProfile = inviterProfiles.find(
                    (profile) => profile.id === invitation.invited_by
                  )

                  return (
                    <div
                      key={invitation.id}
                      className='flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                          <AvatarFallback className='text-sm font-medium bg-muted'>
                            <Mail className='w-4 h-4' />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium'>{invitation.email}</p>
                            {isExpired && (
                              <Badge variant='destructive' className='text-xs'>
                                Abgelaufen
                              </Badge>
                            )}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <Badge
                                variant={getRoleBadgeVariant(invitation.role)}
                                className='gap-1 text-xs'
                              >
                                {getRoleIcon(invitation.role)}
                                {getRoleLabel(invitation.role)}
                              </Badge>
                            </span>
                            <span>•</span>
                            <span>Eingeladen von {invitedByProfile?.full_name || 'Unbekannt'}</span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
                            <Calendar className='w-3 h-3' />
                            Eingeladen am {formatDate(invitation.created_at)}
                            {!isExpired && (
                              <>
                                <span>•</span>
                                <span>Läuft ab am {formatDate(invitation.expires_at)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        {isOwnerOrAdmin && (
                          <PendingInvitationActions
                            invitationId={invitation.id}
                            currentRole={invitation.role}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
