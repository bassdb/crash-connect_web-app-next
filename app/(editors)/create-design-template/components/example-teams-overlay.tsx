'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Users, Palette, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useExampleTeamsStore, { ExampleTeam } from '../../_hooks/useExampleTeamsStore'
import { createClient } from '@/server/supabase/client'

interface ExampleTeamsOverlayProps {
  onTeamSelect: (team: ExampleTeam) => void
}

export default function ExampleTeamsOverlay({ onTeamSelect }: ExampleTeamsOverlayProps) {
  const { availableTeams, isLoading, isOverlayOpen, closeOverlay, setAvailableTeams, setIsLoading } =
    useExampleTeamsStore()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('is_default', true)
          .eq('other_creators_can_use_example_team', true)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
        if (error) {
          console.error('Error fetching available teams:', error)
          setAvailableTeams([])
          return
        }
        setAvailableTeams(data ?? [])
      } catch (err) {
        console.error('Error fetching available teams:', err)
        setAvailableTeams([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isOverlayOpen) {
      load()
    }
  }, [isOverlayOpen, setAvailableTeams, setIsLoading])

  if (!isOverlayOpen) return null

  const handleTeamSelect = (team: ExampleTeam) => {
    onTeamSelect(team)
    closeOverlay()
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

  // Get team logo URL from either avatar_url or team_logo_url
  const getTeamLogoUrl = (team: ExampleTeam) => {
    return team.avatar_url || (team as any).team_logo_url || null
  }

  // Render as portal to ensure it's above all other elements
  return createPortal(
    <div className='fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm'>
      <div className='flex h-full w-full items-center justify-center p-4'>
        <div className='relative w-full max-w-7xl max-h-full overflow-auto bg-background rounded-lg shadow-2xl'>
          {/* Header */}
          <div className='sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div>
              <h2 className='text-3xl font-bold'>Example Team auswählen</h2>
              <p className='text-muted-foreground mt-2'>
                Wählen Sie ein Beispiel-Team aus, um dessen Farben und Einstellungen zu übernehmen
              </p>
            </div>
            <Button variant='ghost' size='icon' onClick={closeOverlay} className='h-10 w-10'>
              <X className='h-5 w-5' />
            </Button>
          </div>

          {/* Content */}
          <div className='p-6'>
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
                  <p className='text-muted-foreground'>Lade verfügbare Teams...</p>
                </div>
              </div>
            ) : availableTeams.length === 0 ? (
              <div className='text-center py-12'>
                <Users className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-xl font-semibold mb-2'>Keine Teams verfügbar</h3>
                <p className='text-muted-foreground'>
                  Es sind derzeit keine Example Teams verfügbar, die von anderen Creators verwendet
                  werden können.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {availableTeams.map((team) => (
                  <Card key={team.id} className='group hover:shadow-lg transition-all duration-200'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='h-12 w-12'>
                            <AvatarImage src={getTeamLogoUrl(team) || undefined} alt={team.name} />
                            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                              {getInitials(team.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className='text-lg'>{team.name}</CardTitle>
                            <Badge variant='secondary' className='text-xs'>
                              Example Team
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-4'>
                      {team.description && (
                        <CardDescription className='text-sm leading-relaxed'>
                          {team.description}
                        </CardDescription>
                      )}

                      {/* Team Colors as Pills */}
                      {team.colors && Array.isArray(team.colors) && team.colors.length > 0 && (
                        <div className='space-y-2'>
                          <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                            <Palette className='h-4 w-4' />
                            <span>Team Farben</span>
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            {team.colors.map((color: any, index: number) => (
                              <Badge
                                key={index}
                                variant='outline'
                                className='text-xs px-2 py-1 border-2'
                                style={{
                                  borderColor: color.value,
                                  color: color.value,
                                  backgroundColor: `${color.value}10`,
                                }}
                              >
                                <div className='flex items-center gap-1'>
                                  <div
                                    className='w-2 h-2 rounded-full'
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span className='capitalize'>{color.name}</span>
                                </div>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Creation Date */}
                      <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        <span>Erstellt am {formatDate(team.created_at)}</span>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleTeamSelect(team)}
                        className='w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors'
                      >
                        Team auswählen
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
