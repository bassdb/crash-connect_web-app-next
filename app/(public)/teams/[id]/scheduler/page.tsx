import { createClient } from '@/server/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar,
  Plus,
  ArrowLeft,
  Search,
  Clock,
  Users,
  MapPin,
  Bell,
  Edit,
  Trash,
  CheckCircle,
  AlertCircle,
  CalendarDays,
} from 'lucide-react'
import Link from 'next/link'

interface SchedulerPageProps {
  params: {
    id: string
  }
}

export default async function SchedulerPage({ params }: SchedulerPageProps) {
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
    .select('id, name, team_logo_url')
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

  // Mock data for team events - in a real app, you'd fetch from a team_events table
  const mockEvents = [
    {
      id: '1',
      title: 'Design Review Meeting',
      type: 'meeting',
      status: 'upcoming',
      start_time: '2024-01-20T10:00:00Z',
      end_time: '2024-01-20T11:00:00Z',
      location: 'Konferenzraum A',
      description: 'Wöchentliches Design Review für das neue Projekt',
      attendees: ['Max Mustermann', 'Anna Schmidt', 'Tom Weber'],
      created_by: 'Max Mustermann',
      created_at: '2024-01-15T10:30:00Z',
      reminder: '15 minutes',
    },
    {
      id: '2',
      title: 'Projekt Deadline',
      type: 'deadline',
      status: 'upcoming',
      start_time: '2024-01-25T17:00:00Z',
      end_time: '2024-01-25T17:00:00Z',
      location: 'Online',
      description: 'Finale Abgabe des Branding-Projekts',
      attendees: ['Max Mustermann', 'Anna Schmidt', 'Lisa Müller'],
      created_by: 'Anna Schmidt',
      created_at: '2024-01-14T14:20:00Z',
      reminder: '1 hour',
    },
    {
      id: '3',
      title: 'Team Building Event',
      type: 'event',
      status: 'completed',
      start_time: '2024-01-12T18:00:00Z',
      end_time: '2024-01-12T22:00:00Z',
      location: 'Restaurant "Zum Goldenen Löwen"',
      description: 'Monatliches Team Building Event',
      attendees: ['Max Mustermann', 'Anna Schmidt', 'Tom Weber', 'Lisa Müller'],
      created_by: 'Tom Weber',
      created_at: '2024-01-10T09:15:00Z',
      reminder: '1 day',
    },
    {
      id: '4',
      title: 'Client Presentation',
      type: 'presentation',
      status: 'upcoming',
      start_time: '2024-01-22T14:00:00Z',
      end_time: '2024-01-22T15:30:00Z',
      location: 'Meeting Room B',
      description: 'Präsentation der neuen Website für Kunde XYZ',
      attendees: ['Max Mustermann', 'Anna Schmidt'],
      created_by: 'Max Mustermann',
      created_at: '2024-01-16T11:45:00Z',
      reminder: '30 minutes',
    },
    {
      id: '5',
      title: 'Sprint Planning',
      type: 'meeting',
      status: 'upcoming',
      start_time: '2024-01-23T09:00:00Z',
      end_time: '2024-01-23T10:30:00Z',
      location: 'Online (Zoom)',
      description: 'Planung des nächsten 2-wöchigen Sprints',
      attendees: ['Max Mustermann', 'Anna Schmidt', 'Tom Weber', 'Lisa Müller'],
      created_by: 'Lisa Müller',
      created_at: '2024-01-17T16:20:00Z',
      reminder: '1 hour',
    },
    {
      id: '6',
      title: 'Design Workshop',
      type: 'workshop',
      status: 'cancelled',
      start_time: '2024-01-19T13:00:00Z',
      end_time: '2024-01-19T17:00:00Z',
      location: 'Design Studio',
      description: 'Workshop für neue Design-Tools und Methoden',
      attendees: ['Max Mustermann', 'Anna Schmidt'],
      created_by: 'Max Mustermann',
      created_at: '2024-01-15T08:30:00Z',
      reminder: '1 hour',
    },
  ]

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
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className='w-4 h-4 text-blue-500' />
      case 'completed':
        return <CheckCircle className='w-4 h-4 text-green-500' />
      case 'cancelled':
        return <AlertCircle className='w-4 h-4 text-red-500' />
      default:
        return <Clock className='w-4 h-4 text-gray-500' />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Anstehend'
      case 'completed':
        return 'Abgeschlossen'
      case 'cancelled':
        return 'Abgesagt'
      default:
        return 'Unbekannt'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className='w-4 h-4' />
      case 'deadline':
        return <Clock className='w-4 h-4' />
      case 'event':
        return <Calendar className='w-4 h-4' />
      case 'presentation':
        return <CalendarDays className='w-4 h-4' />
      case 'workshop':
        return <Users className='w-4 h-4' />
      default:
        return <Calendar className='w-4 h-4' />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'Meeting'
      case 'deadline':
        return 'Deadline'
      case 'event':
        return 'Event'
      case 'presentation':
        return 'Präsentation'
      case 'workshop':
        return 'Workshop'
      default:
        return 'Termin'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500/10 text-blue-500'
      case 'deadline':
        return 'bg-red-500/10 text-red-500'
      case 'event':
        return 'bg-green-500/10 text-green-500'
      case 'presentation':
        return 'bg-purple-500/10 text-purple-500'
      case 'workshop':
        return 'bg-orange-500/10 text-orange-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const isOwnerOrAdmin = userMembership.role === 'owner' || userMembership.role === 'admin'

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
              <h1 className='text-2xl font-bold'>Team-Scheduler</h1>
              <p className='text-muted-foreground'>{team.name}</p>
            </div>
          </div>
        </div>

        {/* Search and Add Event */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='relative w-full sm:w-80'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input placeholder='Termine durchsuchen...' className='pl-10' />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='w-4 h-4' />
                Termin erstellen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Termin erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Termin für Ihr Team.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>Titel</label>
                  <Input placeholder='Termin-Titel' />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium'>Start</label>
                    <Input type='datetime-local' />
                  </div>
                  <div>
                    <label className='text-sm font-medium'>Ende</label>
                    <Input type='datetime-local' />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium'>Ort</label>
                  <Input placeholder='Ort oder Link' />
                </div>
                <div>
                  <label className='text-sm font-medium'>Beschreibung</label>
                  <Input placeholder='Beschreibung des Termins' />
                </div>
                <Button className='w-full'>Termin erstellen</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Event Statistics */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center'>
                  <Clock className='w-4 h-4 text-blue-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockEvents.filter((e) => e.status === 'upcoming').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Anstehend</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockEvents.filter((e) => e.status === 'completed').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Abgeschlossen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockEvents.filter((e) => e.status === 'cancelled').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Abgesagt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center'>
                  <Calendar className='w-4 h-4 text-purple-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>{mockEvents.length}</p>
                  <p className='text-sm text-muted-foreground'>Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className='space-y-4'>
          {mockEvents.map((event) => (
            <Card key={event.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(event.type)}`}
                    >
                      {getTypeIcon(event.type)}
                    </div>
                    <div>
                      <h3 className='font-semibold text-lg'>{event.title}</h3>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <span>{formatDate(event.start_time)}</span>
                        <span>•</span>
                        <span>
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {getStatusIcon(event.status)}
                    <Badge variant={getStatusBadgeVariant(event.status)} className='text-xs'>
                      {getStatusLabel(event.status)}
                    </Badge>
                  </div>
                </div>

                <p className='text-sm text-muted-foreground mb-3'>{event.description}</p>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                      <Users className='w-4 h-4' />
                      <span>{event.attendees.length} Teilnehmer</span>
                    </div>
                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                      <Bell className='w-4 h-4' />
                      <span>Erinnerung: {event.reminder}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <Edit className='w-4 h-4' />
                    </Button>
                    {isOwnerOrAdmin && (
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <Trash className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
