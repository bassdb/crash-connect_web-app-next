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
  Palette,
  Plus,
  ArrowLeft,
  Search,
  Eye,
  Edit,
  Download,
  Share,
  Calendar,
  User,
  Star,
} from 'lucide-react'
import Link from 'next/link'

interface DesignsPageProps {
  params: {
    id: string
  }
}

export default async function DesignsPage({ params }: DesignsPageProps) {
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

  // Mock data for team designs - in a real app, you'd fetch from a team_designs table
  const mockDesigns = [
    {
      id: '1',
      name: 'Social Media Banner',
      type: 'banner',
      status: 'published',
      created_by: 'Max Mustermann',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      preview_url: '/api/placeholder/300/200',
      likes: 24,
      downloads: 156,
    },
    {
      id: '2',
      name: 'Business Card Design',
      type: 'card',
      status: 'draft',
      created_by: 'Anna Schmidt',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T16:45:00Z',
      preview_url: '/api/placeholder/300/200',
      likes: 12,
      downloads: 89,
    },
    {
      id: '3',
      name: 'Product Flyer',
      type: 'flyer',
      status: 'published',
      created_by: 'Tom Weber',
      created_at: '2024-01-13T09:15:00Z',
      updated_at: '2024-01-13T09:15:00Z',
      preview_url: '/api/placeholder/300/200',
      likes: 45,
      downloads: 234,
    },
    {
      id: '4',
      name: 'Event Poster',
      type: 'poster',
      status: 'archived',
      created_by: 'Lisa Müller',
      created_at: '2024-01-12T16:45:00Z',
      updated_at: '2024-01-12T16:45:00Z',
      preview_url: '/api/placeholder/300/200',
      likes: 67,
      downloads: 445,
    },
    {
      id: '5',
      name: 'Logo Design',
      type: 'logo',
      status: 'published',
      created_by: 'Max Mustermann',
      created_at: '2024-01-11T11:20:00Z',
      updated_at: '2024-01-11T11:20:00Z',
      preview_url: '/api/placeholder/300/200',
      likes: 89,
      downloads: 567,
    },
    {
      id: '6',
      name: 'Email Template',
      type: 'template',
      status: 'draft',
      created_by: 'Anna Schmidt',
      created_at: '2024-01-10T13:30:00Z',
      updated_at: '2024-01-10T15:20:00Z',
      preview_url: '/api/placeholder/300/200',
      likes: 18,
      downloads: 123,
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'archived':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Veröffentlicht'
      case 'draft':
        return 'Entwurf'
      case 'archived':
        return 'Archiviert'
      default:
        return 'Unbekannt'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'banner':
        return 'Banner'
      case 'card':
        return 'Karte'
      case 'flyer':
        return 'Flyer'
      case 'poster':
        return 'Poster'
      case 'logo':
        return 'Logo'
      case 'template':
        return 'Template'
      default:
        return 'Design'
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
              <h1 className='text-2xl font-bold'>Team-Designs</h1>
              <p className='text-muted-foreground'>{team.name}</p>
            </div>
          </div>
        </div>

        {/* Search and Create */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='relative w-full sm:w-80'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input placeholder='Designs durchsuchen...' className='pl-10' />
          </div>
          <Button className='gap-2'>
            <Plus className='w-4 h-4' />
            Neues Design erstellen
          </Button>
        </div>

        {/* Design Statistics */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center'>
                  <Palette className='w-4 h-4 text-green-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockDesigns.filter((d) => d.status === 'published').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Veröffentlicht</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center'>
                  <Edit className='w-4 h-4 text-blue-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockDesigns.filter((d) => d.status === 'draft').length}
                  </p>
                  <p className='text-sm text-muted-foreground'>Entwürfe</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center'>
                  <Star className='w-4 h-4 text-orange-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockDesigns.reduce((sum, d) => sum + d.likes, 0)}
                  </p>
                  <p className='text-sm text-muted-foreground'>Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center'>
                  <Download className='w-4 h-4 text-purple-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {mockDesigns.reduce((sum, d) => sum + d.downloads, 0)}
                  </p>
                  <p className='text-sm text-muted-foreground'>Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Designs Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {mockDesigns.map((design) => (
            <Card key={design.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-0'>
                <div className='relative'>
                  <img
                    src={design.preview_url}
                    alt={design.name}
                    className='w-full h-48 object-cover rounded-t-lg'
                  />
                  <div className='absolute top-2 right-2'>
                    <Badge variant={getStatusBadgeVariant(design.status)}>
                      {getStatusLabel(design.status)}
                    </Badge>
                  </div>
                </div>
                <div className='p-4'>
                  <div className='flex items-start justify-between mb-3'>
                    <div>
                      <h3 className='font-semibold text-lg'>{design.name}</h3>
                      <p className='text-sm text-muted-foreground'>{getTypeLabel(design.type)}</p>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <Eye className='w-4 h-4' />
                      </Button>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <Download className='w-4 h-4' />
                      </Button>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <Share className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-sm text-muted-foreground mb-3'>
                    <span>Erstellt von {design.created_by}</span>
                    <span>{formatDate(design.created_at)}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 text-sm'>
                      <span className='flex items-center gap-1'>
                        <Star className='w-4 h-4' />
                        {design.likes}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Download className='w-4 h-4' />
                        {design.downloads}
                      </span>
                    </div>
                    <Badge variant='outline' className='text-xs'>
                      {getTypeLabel(design.type)}
                    </Badge>
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
