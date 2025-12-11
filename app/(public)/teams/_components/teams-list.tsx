'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Calendar, ArrowRight } from 'lucide-react'
import { createClient } from '@/server/supabase/client'
import type { Team } from '@/types/teams-types'

interface TeamsListProps {
  onCreateNewClick: () => void
  initialTeams: (Team & { userRole: string })[]
}

export function TeamsList({ onCreateNewClick, initialTeams }: TeamsListProps) {
  const [teams, setTeams] = useState<(Team & { userRole: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Use initial teams if provided, otherwise fetch them
    if (initialTeams.length > 0) {
      setTeams(initialTeams)
      setIsLoading(false)
    } else {
      fetchTeams()
    }
  }, [initialTeams])

  const fetchTeams = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch teams where user is a member
      const { data: teamMemberships } = await supabase
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
            created_at,
            updated_at
          )
        `
        )
        .eq('user_id', user.id)
      if (teamMemberships) {
        const userTeams = teamMemberships.map((membership) => ({
          ...(membership.teams as unknown as Team),
          userRole: membership.role,
        }))

        setTeams(userTeams)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-muted rounded-full'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-muted rounded w-1/4'></div>
                  <div className='h-3 bg-muted rounded w-1/2'></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <Card className='text-center py-12'>
        <CardContent>
          <Users className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Keine Teams gefunden</h3>
          <p className='text-muted-foreground mb-6'>
            Sie sind noch keinem Team beigetreten. Erstellen Sie ein neues Team oder treten Sie
            einem bestehenden bei.
          </p>
          <Button onClick={onCreateNewClick} className='gap-2'>
            <Plus className='w-4 h-4' />
            Neues Team erstellen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Ihre Teams</h2>
        <Button onClick={onCreateNewClick} className='gap-2'>
          <Plus className='w-4 h-4' />
          Neues Team
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {teams.map((team) => (
          <Card
            key={team.id}
            className='hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => router.push(`/teams/${team.id}`)}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src={team.avatar_url || ''} alt={team.name} />
                    <AvatarFallback className='text-sm font-medium'>
                      {getInitials(team.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className='text-lg'>{team.name}</CardTitle>
                    <Badge
                      variant={getRoleBadgeVariant((team as any).userRole)}
                      className='text-xs'
                    >
                      {(team as any).userRole === 'owner'
                        ? 'Besitzer'
                        : (team as any).userRole === 'admin'
                          ? 'Admin'
                          : 'Mitglied'}
                    </Badge>
                  </div>
                </div>
                <ArrowRight className='w-4 h-4 text-muted-foreground' />
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              {team.description && (
                <CardDescription className='mb-3 line-clamp-2'>{team.description}</CardDescription>
              )}
              <div className='flex items-center text-xs text-muted-foreground'>
                <Calendar className='w-3 h-3 mr-1' />
                Erstellt am {formatDate(team.created_at)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
