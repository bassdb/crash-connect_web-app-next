import { createClient } from '@/server/supabase/server'
import { createSuperClient } from '@/server/supabase/superadmin'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Shield, Crown, User, CheckCircle, XCircle, Clock, X, LogIn } from 'lucide-react'
import Link from 'next/link'
import { AcceptInvitationForm } from './accept-invitation-form'

interface InvitePageProps {
  params: Promise<{
    token: string
  }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const supabase = await createClient()
  const superClient = await createSuperClient()
  const { token } = await params

  console.log('Token from params:', token)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Einladung mit Team-Details abrufen (mit Service Role für Policy-Umgehung)
  const { data: invitation, error: invitationError } = await superClient
    .from('team_invitations')
    .select(
      `
      *,
      teams (
        id,
        name,
        slug,
        team_logo_url
      )
    `
    )
    .eq('token', token)
    .single()

  console.log('Invitation query result:', { invitation, invitationError })

  if (invitationError) {
    console.error('Database error fetching invitation:', invitationError)
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <XCircle className='w-12 h-12 text-destructive' />
            </div>
            <CardTitle>Fehler beim Laden der Einladung</CardTitle>
            <CardDescription>
              Es gab einen Fehler beim Laden der Einladung. Bitte versuchen Sie es erneut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href='/teams'>
              <Button className='w-full'>Zu den Teams</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    console.log('No invitation found for token:', token)
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <XCircle className='w-12 h-12 text-destructive' />
            </div>
            <CardTitle>Einladung nicht gefunden</CardTitle>
            <CardDescription>
              Die angeforderte Einladung konnte nicht gefunden werden. Möglicherweise ist der Link
              ungültig oder abgelaufen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href='/teams'>
              <Button className='w-full'>Zu den Teams</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prüfen ob ein Profil mit der Einladungs-E-Mail existiert
  const { data: existingProfile } = await superClient
    .from('profiles')
    .select('id, email')
    .eq('email', invitation.email)
    .maybeSingle()

  console.log('existingProfile: ', existingProfile)

  // Profildaten des Einladers abrufen (mit Service Role)
  const { data: inviterProfile, error: inviterError } = await superClient
    .from('profiles')
    .select('id, full_name, username')
    .eq('id', invitation.invited_by)
    .single()

  if (inviterError) {
    console.log('inviterError: ', inviterError)
  }
  console.log('inviterProfile: ', inviterProfile)

  // Prüfen ob Einladung abgelaufen ist
  const isExpired = new Date(invitation.expires_at) < new Date()
  if (isExpired) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <XCircle className='w-12 h-12 text-destructive' />
            </div>
            <CardTitle>Einladung abgelaufen</CardTitle>
            <CardDescription>
              Diese Einladung ist nicht mehr gültig. Bitte kontaktieren Sie das Team für eine neue
              Einladung.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href='/teams'>
              <Button className='w-full'>Zu den Teams</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prüfen ob Einladung bereits angenommen wurde
  if (invitation.accepted_at) {
    return (
      <div className='flex flex-grow items-center justify-center bg-background'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <CheckCircle className='w-12 h-12 text-green-600 dark:text-green-400' />
            </div>
            <CardTitle>Einladung bereits angenommen</CardTitle>
            <CardDescription>Diese Einladung wurde bereits angenommen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/teams/${invitation.team_id}`}>
              <Button className='w-full'>Zum Team</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
        return 'Administrator'
      case 'member':
        return 'Mitglied'
      default:
        return 'Mitglied'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Fall 1: Benutzer existiert und ist angemeldet
  if (existingProfile && user && user.email === invitation.email) {
    return (
      <div className='flex flex-grow items-center justify-center bg-background'>
        <div className='w-full max-w-md'>
          {/* Team Header */}
          <div className='text-center mb-6'>
            <div className='mx-auto mb-4'>
              <Avatar className='w-16 h-16 mx-auto'>
                <AvatarImage
                  src={invitation.teams?.avatar_url || ''}
                  alt={invitation.teams?.name || 'Team'}
                />
                <AvatarFallback className='text-lg font-semibold'>
                  {getInitials(invitation.teams?.name || 'Team')}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className='text-2xl font-bold'>Team-Einladung</h1>
            <p className='text-muted-foreground'>
              Sie wurden eingeladen, dem Team{' '}
              <strong>{invitation.teams?.name || 'Unbekanntes Team'}</strong> beizutreten
            </p>
          </div>

          {/* Grüne Karte - Benutzer kann Einladung annehmen */}
          <Card>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4'>
                <CheckCircle className='w-12 h-12 text-green-600 dark:text-green-400' />
              </div>
              <CardTitle>Einladung annehmen</CardTitle>
              <CardDescription>
                Sie sind als <strong>{user.email}</strong> angemeldet und können die Einladung jetzt
                annehmen.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <span className='text-sm text-muted-foreground'>Rolle:</span>
                <Badge variant='outline' className='gap-1'>
                  {getRoleIcon(invitation.role)}
                  {getRoleLabel(invitation.role)}
                </Badge>
              </div>

              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <span className='text-sm text-muted-foreground'>Eingeladen von:</span>
                <span className='text-sm font-medium'>
                  {inviterProfile?.full_name || inviterProfile?.username || 'Unbekannt'}
                </span>
              </div>

              <AcceptInvitationForm token={token} teamId={invitation.team_id} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fall 1.5: Benutzer ist angemeldet, aber die Einladung ist für eine andere E-Mail-Adresse
  if (user && user.email !== invitation.email) {
    return (
      <div className='flex flex-grow items-center justify-center bg-background'>
        <div className='w-full max-w-md'>
          {/* Team Header */}
          <div className='text-center mb-6'>
            <div className='mx-auto mb-4'>
              <Avatar className='w-16 h-16 mx-auto'>
                <AvatarImage
                  src={invitation.teams?.avatar_url || ''}
                  alt={invitation.teams?.name || 'Team'}
                />
                <AvatarFallback className='text-lg font-semibold'>
                  {getInitials(invitation.teams?.name || 'Team')}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className='text-2xl font-bold'>Team-Einladung</h1>
            <p className='text-muted-foreground'>
              Sie wurden eingeladen, dem Team{' '}
              <strong>{invitation.teams?.name || 'Unbekanntes Team'}</strong> beizutreten
            </p>
          </div>

          {/* Rote Karte - Falsche E-Mail-Adresse */}
          <Card>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4'>
                <XCircle className='w-12 h-12 text-red-600 dark:text-red-400' />
              </div>
              <CardTitle>Falsche E-Mail-Adresse</CardTitle>
              <CardDescription>
                Diese Einladung ist für <strong>{invitation.email}</strong> bestimmt, aber Sie sind
                als <strong>{user.email}</strong> angemeldet.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <span className='text-sm text-muted-foreground'>Rolle:</span>
                <Badge variant='outline' className='gap-1'>
                  {getRoleIcon(invitation.role)}
                  {getRoleLabel(invitation.role)}
                </Badge>
              </div>

              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <span className='text-sm text-muted-foreground'>Eingeladen von:</span>
                <span className='text-sm font-medium'>
                  {inviterProfile?.full_name || inviterProfile?.username || 'Unbekannt'}
                </span>
              </div>

              <div className='space-y-3'>
                <div className='text-center'>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Um diese Einladung anzunehmen, müssen Sie sich mit der korrekten E-Mail-Adresse
                    anmelden.
                  </p>
                </div>

                <div className='space-y-2'>
                  <Link href={`/sign-in?invitation_token=${token}`} className='block'>
                    <Button variant='outline' className='w-full gap-2'>
                      <LogIn className='w-4 h-4' />
                      Mit anderer E-Mail anmelden
                    </Button>
                  </Link>

                  <Link href='/teams' className='block'>
                    <Button variant='ghost' className='w-full'>
                      Zu den Teams
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fall 2: Benutzer existiert, ist aber nicht angemeldet
  if (existingProfile && (!user || user.email !== invitation.email)) {
    return (
      <div className='flex flex-grow items-center justify-center bg-background'>
        <div className='w-full max-w-md'>
          {/* Team Header */}
          <div className='text-center mb-6'>
            <div className='mx-auto mb-4'>
              <Avatar className='w-16 h-16 mx-auto'>
                <AvatarImage
                  src={invitation.teams?.avatar_url || ''}
                  alt={invitation.teams?.name || 'Team'}
                />
                <AvatarFallback className='text-lg font-semibold'>
                  {getInitials(invitation.teams?.name || 'Team')}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className='text-2xl font-bold'>Team-Einladung</h1>
            <p className='text-muted-foreground'>
              Sie wurden eingeladen, dem Team{' '}
              <strong>{invitation.teams?.name || 'Unbekanntes Team'}</strong> beizutreten
            </p>
          </div>

          {/* Blaue Karte - Anmeldung erforderlich */}
          <Card>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4'>
                <LogIn className='w-12 h-12 text-blue-600 dark:text-blue-400' />
              </div>
              <CardTitle>Anmeldung erforderlich</CardTitle>
              <CardDescription>
                Ein Konto mit der E-Mail-Adresse <strong>{invitation.email}</strong> existiert
                bereits. Bitte melden Sie sich an, um die Einladung anzunehmen.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <span className='text-sm text-muted-foreground'>Rolle:</span>
                <Badge variant='outline' className='gap-1'>
                  {getRoleIcon(invitation.role)}
                  {getRoleLabel(invitation.role)}
                </Badge>
              </div>

              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <span className='text-sm text-muted-foreground'>Eingeladen von:</span>
                <span className='text-sm font-medium'>
                  {inviterProfile?.full_name || inviterProfile?.username || 'Unbekannt'}
                </span>
              </div>

              <div className='space-y-3'>
                <Link href={`/sign-in?invitation_token=${token}`} className='block'>
                  <Button className='w-full gap-2 bg-blue-600 hover:bg-blue-700'>
                    <LogIn className='w-4 h-4' />
                    Anmelden
                  </Button>
                </Link>
                <div className='text-center'>
                  <p className='text-xs text-blue-600 dark:text-blue-400'>
                    Nach der Anmeldung können Sie die Einladung annehmen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fall 3: Benutzer existiert nicht - Registrierung erforderlich
  return (
    <div className='flex flex-grow items-center justify-center bg-background'>
      <div className='w-full max-w-md'>
        {/* Team Header */}
        <div className='text-center mb-6'>
          <div className='mx-auto mb-4'>
            <Avatar className='w-16 h-16 mx-auto'>
              <AvatarImage
                src={invitation.teams?.avatar_url || ''}
                alt={invitation.teams?.name || 'Team'}
              />
              <AvatarFallback className='text-lg font-semibold'>
                {getInitials(invitation.teams?.name || 'Team')}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className='text-2xl font-bold'>Team-Einladung</h1>
          <p className='text-muted-foreground'>
            Sie wurden eingeladen, dem Team{' '}
            <strong>{invitation.teams?.name || 'Unbekanntes Team'}</strong> beizutreten
          </p>
        </div>

        {/* Orange Karte - Registrierung erforderlich */}
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <User className='w-12 h-12 text-emerald-600 dark:text-emerald-400' />
            </div>
            <CardTitle>Konto erstellen</CardTitle>
            <CardDescription>
              Um der Einladung beizutreten, müssen Sie ein Konto mit der E-Mail-Adresse{' '}
              <strong>{invitation.email}</strong> erstellen.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
              <span className='text-sm text-muted-foreground'>Rolle:</span>
              <Badge variant='outline' className='gap-1'>
                {getRoleIcon(invitation.role)}
                {getRoleLabel(invitation.role)}
              </Badge>
            </div>

            <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
              <span className='text-sm text-muted-foreground'>Eingeladen von:</span>
              <span className='text-sm font-medium'>
                {inviterProfile?.full_name || inviterProfile?.username || 'Unbekannt'}
              </span>
            </div>

            <div className='space-y-3'>
              <div className='text-sm text-muted-foreground space-y-2'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-500 flex items-center justify-center text-xs font-bold'>
                    1
                  </div>
                  <span>Konto mit E-Mail {invitation.email} erstellen</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-500 flex items-center justify-center text-xs font-bold'>
                    2
                  </div>
                  <span>E-Mail-Adresse bestätigen</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-500 flex items-center justify-center text-xs font-bold'>
                    3
                  </div>
                  <span>Einladung automatisch annehmen</span>
                </div>
              </div>

              <Link href={`/sign-up?invitation_token=${token}`} className='block'>
                <Button className='w-full gap-2'>
                  <User className='w-4 h-4' />
                  Konto erstellen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
