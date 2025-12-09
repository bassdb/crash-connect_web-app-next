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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Link as LinkIcon,
  Plus,
  ArrowLeft,
  Search,
  Settings,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Database,
  Cloud,
  Globe,
} from 'lucide-react'
import Link from 'next/link'

interface ConnectionsPageProps {
  params: {
    id: string
  }
}

export default async function ConnectionsPage({ params }: ConnectionsPageProps) {
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

  // Mock data for team connections - in a real app, you'd fetch from a team_connections table
  const mockConnections = [
    {
      id: '1',
      name: 'Slack',
      type: 'communication',
      status: 'connected',
      description: 'Team-Kommunikation und Benachrichtigungen',
      icon: '💬',
      connected_at: '2024-01-15T10:30:00Z',
      last_sync: '2024-01-15T14:20:00Z',
      settings: {
        notifications: true,
        auto_sync: true,
        channels: ['#general', '#designs'],
      },
    },
    {
      id: '2',
      name: 'Google Drive',
      type: 'storage',
      status: 'connected',
      description: 'Cloud-Speicher für Team-Dateien',
      icon: '☁️',
      connected_at: '2024-01-14T09:15:00Z',
      last_sync: '2024-01-15T12:30:00Z',
      settings: {
        auto_backup: true,
        sync_frequency: 'hourly',
        folders: ['Designs', 'Assets'],
      },
    },
    {
      id: '3',
      name: 'Figma',
      type: 'design',
      status: 'connected',
      description: 'Design-Tool Integration',
      icon: '🎨',
      connected_at: '2024-01-13T16:45:00Z',
      last_sync: '2024-01-15T11:15:00Z',
      settings: {
        auto_import: true,
        project_sync: true,
        teams: ['Design Team'],
      },
    },
    {
      id: '4',
      name: 'Trello',
      type: 'project',
      status: 'disconnected',
      description: 'Projektmanagement und Aufgabenverfolgung',
      icon: '📋',
      connected_at: null,
      last_sync: null,
      settings: {},
    },
    {
      id: '5',
      name: 'Dropbox',
      type: 'storage',
      status: 'error',
      description: 'Alternative Cloud-Speicher Lösung',
      icon: '📦',
      connected_at: '2024-01-12T13:20:00Z',
      last_sync: '2024-01-14T08:45:00Z',
      settings: {
        auto_backup: false,
        sync_frequency: 'daily',
      },
    },
    {
      id: '6',
      name: 'GitHub',
      type: 'development',
      status: 'connected',
      description: 'Code-Repository und Versionierung',
      icon: '💻',
      connected_at: '2024-01-11T10:30:00Z',
      last_sync: '2024-01-15T15:10:00Z',
      settings: {
        webhook_enabled: true,
        auto_deploy: false,
        repositories: ['design-templates', 'assets'],
      },
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'connected':
        return 'default'
      case 'disconnected':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className='w-4 h-4 text-green-500' />
      case 'disconnected':
        return <XCircle className='w-4 h-4 text-gray-500' />
      case 'error':
        return <AlertCircle className='w-4 h-4 text-red-500' />
      default:
        return <XCircle className='w-4 h-4 text-gray-500' />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Verbunden'
      case 'disconnected':
        return 'Getrennt'
      case 'error':
        return 'Fehler'
      default:
        return 'Unbekannt'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'communication':
        return <LinkIcon className='w-4 h-4' />
      case 'storage':
        return <Database className='w-4 h-4' />
      case 'design':
        return <Zap className='w-4 h-4' />
      case 'project':
        return <Globe className='w-4 h-4' />
      case 'development':
        return <Cloud className='w-4 h-4' />
      default:
        return <LinkIcon className='w-4 h-4' />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'communication':
        return 'Kommunikation'
      case 'storage':
        return 'Speicher'
      case 'design':
        return 'Design'
      case 'project':
        return 'Projekt'
      case 'development':
        return 'Entwicklung'
      default:
        return 'Integration'
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
              <h1 className='text-2xl font-bold'>Team-Verbindungen</h1>
              <p className='text-muted-foreground'>{team.name}</p>
            </div>
          </div>
        </div>

        {/* Search and Add Connection */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='relative w-full sm:w-80'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input placeholder='Verbindungen durchsuchen...' className='pl-10' />
          </div>
          {isOwnerOrAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Plus className='w-4 h-4' />
                  Verbindung hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Verbindung hinzufügen</DialogTitle>
                  <DialogDescription>
                    Verbinden Sie Ihr Team mit externen Diensten und Tools.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-3'>
                    <Button variant='outline' className='h-20 flex-col gap-2'>
                      <span className='text-2xl'>💬</span>
                      <span className='text-sm'>Slack</span>
                    </Button>
                    <Button variant='outline' className='h-20 flex-col gap-2'>
                      <span className='text-2xl'>☁️</span>
                      <span className='text-sm'>Google Drive</span>
                    </Button>
                    <Button variant='outline' className='h-20 flex-col gap-2'>
                      <span className='text-2xl'>🎨</span>
                      <span className='text-sm'>Figma</span>
                    </Button>
                    <Button variant='outline' className='h-20 flex-col gap-2'>
                      <span className='text-2xl'>📋</span>
                      <span className='text-sm'>Trello</span>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Connection Statistics */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockConnections.filter((c) => c.status === 'connected').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Verbunden</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center'>
                  <XCircle className='w-4 h-4 text-gray-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockConnections.filter((c) => c.status === 'disconnected').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Getrennt</p>
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
                    {mockConnections.filter((c) => c.status === 'error').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Fehler</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center'>
                  <LinkIcon className='w-4 h-4 text-blue-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>{mockConnections.length}</p>
                  <p className='text-sm text-muted-foreground'>Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connections List */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {mockConnections.map((connection) => (
            <Card key={connection.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl'>
                      {connection.icon}
                    </div>
                    <div>
                      <h3 className='font-semibold'>{connection.name}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {getTypeLabel(connection.type)}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {getStatusIcon(connection.status)}
                    <Badge variant={getStatusBadgeVariant(connection.status)} className='text-xs'>
                      {getStatusLabel(connection.status)}
                    </Badge>
                  </div>
                </div>

                <p className='text-sm text-muted-foreground mb-3'>{connection.description}</p>

                {connection.status === 'connected' && connection.last_sync && (
                  <div className='text-xs text-muted-foreground mb-3'>
                    Letzte Synchronisation: {formatDate(connection.last_sync)}
                  </div>
                )}

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {isOwnerOrAdmin && (
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <Settings className='w-4 h-4' />
                      </Button>
                    )}
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <ExternalLink className='w-4 h-4' />
                    </Button>
                  </div>
                  {connection.status === 'connected' && <Switch defaultChecked />}
                  {connection.status === 'disconnected' && (
                    <Button size='sm' variant='outline'>
                      Verbinden
                    </Button>
                  )}
                  {connection.status === 'error' && (
                    <Button size='sm' variant='outline'>
                      Erneut versuchen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
