import { createClient } from '@/server/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TeamColorPicker } from '../../_components/team-color-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Palette } from 'lucide-react'
import Link from 'next/link'
import type { TeamColor } from '@/types/teams-types'

interface TeamColorsPageProps {
  params: {
    id: string
  }
}

export default async function TeamColorsPage({ params }: TeamColorsPageProps) {
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

  // Check if user has permission to edit colors (owner or admin)
  const canEditColors = userMembership.role === 'owner' || userMembership.role === 'admin'

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href={`/teams/${id}`}>
              <ArrowLeft className='w-5 h-5 text-muted-foreground hover:text-foreground transition-colors' />
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>Team-Farben</h1>
              <p className='text-muted-foreground'>Farben für {team.name}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant={userMembership.role === 'owner' ? 'default' : 'secondary'}>
              {userMembership.role === 'owner' ? 'Besitzer' : 'Admin'}
            </Badge>
          </div>
        </div>

        {/* Team Info Card */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-lg bg-muted flex items-center justify-center'>
                {team.team_logo_url ? (
                  <img
                    src={team.team_logo_url}
                    alt={team.name}
                    className='w-12 h-12 rounded-lg object-cover'
                  />
                ) : (
                  <span className='text-lg font-semibold text-muted-foreground'>
                    {getInitials(team.name)}
                  </span>
                )}
              </div>
              <div>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  {team.description || 'Keine Beschreibung verfügbar'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Color Picker */}
        {canEditColors ? (
          <TeamColorPicker teamId={team.id} initialColors={team.colors || []} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Palette className='w-5 h-5' />
                Team-Farben
              </CardTitle>
              <CardDescription>
                Sie haben keine Berechtigung, die Team-Farben zu bearbeiten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {(team.colors || []).map((color: TeamColor, index: number) => (
                  <div key={index} className='text-center'>
                    <div
                      className='w-full h-16 rounded-lg mb-2 border'
                      style={{ backgroundColor: color.value }}
                    />
                    <p className='text-sm font-medium'>{color.label}</p>
                    <p className='text-xs text-muted-foreground font-mono'>{color.value}</p>
                  </div>
                ))}
                {(team.colors || []).length === 0 && (
                  <div className='col-span-full text-center py-8 text-muted-foreground'>
                    Keine Farben definiert
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className='flex items-center justify-between pt-6 border-t'>
          <Link href={`/teams/${id}`}>
            <ArrowLeft className='w-4 h-4 mr-2 inline' />
            Zurück zum Team
          </Link>
          <Link href='/teams'>Alle Teams anzeigen</Link>
        </div>
      </div>
    </div>
  )
}
