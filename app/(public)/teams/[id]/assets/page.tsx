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
  Image,
  Plus,
  ArrowLeft,
  Upload,
  Search,
  Download,
  Trash,
  Eye,
  FileText,
  Video,
  Music,
} from 'lucide-react'
import Link from 'next/link'

interface AssetsPageProps {
  params: {
    id: string
  }
}

export default async function AssetsPage({ params }: AssetsPageProps) {
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

  // Mock data for team assets - in a real app, you'd fetch from a team_assets table
  const mockAssets = [
    {
      id: '1',
      name: 'Team-Logo.png',
      type: 'image',
      size: '2.4 MB',
      uploaded_by: 'Max Mustermann',
      uploaded_at: '2024-01-15T10:30:00Z',
      url: '/api/placeholder/200/200',
      file_type: 'png',
    },
    {
      id: '2',
      name: 'Brand-Guidelines.pdf',
      type: 'document',
      size: '1.8 MB',
      uploaded_by: 'Anna Schmidt',
      uploaded_at: '2024-01-14T14:20:00Z',
      url: '/api/placeholder/200/200',
      file_type: 'pdf',
    },
    {
      id: '3',
      name: 'Product-Video.mp4',
      type: 'video',
      size: '15.2 MB',
      uploaded_by: 'Tom Weber',
      uploaded_at: '2024-01-13T09:15:00Z',
      url: '/api/placeholder/200/200',
      file_type: 'mp4',
    },
    {
      id: '4',
      name: 'Background-Music.mp3',
      type: 'audio',
      size: '3.7 MB',
      uploaded_by: 'Lisa Müller',
      uploaded_at: '2024-01-12T16:45:00Z',
      url: '/api/placeholder/200/200',
      file_type: 'mp3',
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className='w-5 h-5' />
      case 'document':
        return <FileText className='w-5 h-5' />
      case 'video':
        return <Video className='w-5 h-5' />
      case 'audio':
        return <Music className='w-5 h-5' />
      default:
        return <FileText className='w-5 h-5' />
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-blue-500/10 text-blue-500'
      case 'document':
        return 'bg-green-500/10 text-green-500'
      case 'video':
        return 'bg-purple-500/10 text-purple-500'
      case 'audio':
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
              <h1 className='text-2xl font-bold'>Team-Assets</h1>
              <p className='text-muted-foreground'>{team.name}</p>
            </div>
          </div>
        </div>

        {/* Search and Upload */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='relative w-full sm:w-80'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input placeholder='Assets durchsuchen...' className='pl-10' />
          </div>
          {isOwnerOrAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Upload className='w-4 h-4' />
                  Asset hochladen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neues Asset hochladen</DialogTitle>
                  <DialogDescription>
                    Laden Sie ein neues Asset für Ihr Team hoch.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center'>
                    <Upload className='w-8 h-8 mx-auto text-muted-foreground mb-4' />
                    <p className='text-sm text-muted-foreground mb-2'>
                      Datei hierher ziehen oder klicken zum Auswählen
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      PNG, JPG, PDF, MP4, MP3 bis 50 MB
                    </p>
                  </div>
                  <Button className='w-full'>Hochladen</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Assets Grid */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {mockAssets.map((asset) => (
            <Card key={asset.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getFileTypeColor(asset.type)}`}
                    >
                      {getFileIcon(asset.type)}
                    </div>
                    <div>
                      <p className='font-medium text-sm truncate max-w-32'>{asset.name}</p>
                      <p className='text-xs text-muted-foreground'>{asset.size}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <Eye className='w-4 h-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <Download className='w-4 h-4' />
                    </Button>
                    {isOwnerOrAdmin && (
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <Trash className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                </div>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Hochgeladen von {asset.uploaded_by}</span>
                  <span>{formatDate(asset.uploaded_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Asset Statistics */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center'>
                  <Image className='w-4 h-4 text-blue-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>12</p>
                  <p className='text-sm text-muted-foreground'>Bilder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center'>
                  <FileText className='w-4 h-4 text-green-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>8</p>
                  <p className='text-sm text-muted-foreground'>Dokumente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center'>
                  <Video className='w-4 h-4 text-purple-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>5</p>
                  <p className='text-sm text-muted-foreground'>Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center'>
                  <Music className='w-4 h-4 text-orange-500' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>3</p>
                  <p className='text-sm text-muted-foreground'>Audio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
