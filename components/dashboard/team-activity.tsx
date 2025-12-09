import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Users, 
  Upload, 
  MessageSquare, 
  GitBranch,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface TeamActivity {
  id: string
  type: 'upload' | 'comment' | 'collaboration' | 'project' | 'meeting'
  user: {
    name: string
    avatar: string
  }
  action: string
  target: string
  timestamp: string
  status?: 'completed' | 'in-progress' | 'pending'
  metadata?: {
    collaborators?: number
    fileSize?: string
    comments?: number
  }
}

const mockActivities: TeamActivity[] = [
  {
    id: '1',
    type: 'upload',
    user: {
      name: 'Anna Schmidt',
      avatar: '/avatars/shadcn.jpg'
    },
    action: 'hat ein neues Template hochgeladen',
    target: 'E-Commerce Landing Page Kit',
    timestamp: 'vor 15 Minuten',
    status: 'completed',
    metadata: {
      fileSize: '2.4 MB'
    }
  },
  {
    id: '2',
    type: 'collaboration',
    user: {
      name: 'Tom Weber',
      avatar: '/avatars/shadcn.png'
    },
    action: 'hat dich zu einem Projekt eingeladen',
    target: 'Mobile App Redesign',
    timestamp: 'vor 1 Stunde',
    status: 'pending',
    metadata: {
      collaborators: 3
    }
  },
  {
    id: '3',
    type: 'comment',
    user: {
      name: 'Lisa Müller',
      avatar: '/avatars/shadcn.jpg'
    },
    action: 'hat dein Template kommentiert',
    target: 'Dashboard UI Components',
    timestamp: 'vor 2 Stunden',
    status: 'completed',
    metadata: {
      comments: 5
    }
  },
  {
    id: '4',
    type: 'project',
    user: {
      name: 'Max Zimmermann',
      avatar: '/avatars/shadcn.png'
    },
    action: 'hat ein Projekt erstellt',
    target: 'Brand Identity System',
    timestamp: 'vor 4 Stunden',
    status: 'in-progress',
    metadata: {
      collaborators: 2
    }
  },
  {
    id: '5',
    type: 'meeting',
    user: {
      name: 'Sarah Koch',
      avatar: '/avatars/shadcn.jpg'
    },
    action: 'hat ein Team-Meeting geplant',
    target: 'Quarterly Design Review',
    timestamp: 'vor 1 Tag',
    status: 'pending'
  }
]

const activityIcons = {
  upload: Upload,
  comment: MessageSquare,
  collaboration: Users,
  project: FileText,
  meeting: Calendar
}

const statusIcons = {
  completed: CheckCircle,
  'in-progress': Clock,
  pending: AlertCircle
}

const statusColors = {
  completed: 'text-green-500',
  'in-progress': 'text-blue-500',
  pending: 'text-orange-500'
}

function ActivityItem({ activity }: { activity: TeamActivity }) {
  const Icon = activityIcons[activity.type]
  const StatusIcon = activity.status ? statusIcons[activity.status] : null
  const statusColor = activity.status ? statusColors[activity.status] : ''

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback className="text-xs">{activity.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
            <Icon className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{' '}
              <span className="text-muted-foreground">{activity.action}</span>{' '}
              <span className="font-medium">{activity.target}</span>
            </p>
            
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              
              {activity.metadata && (
                <div className="flex items-center space-x-2">
                  {activity.metadata.collaborators && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {activity.metadata.collaborators}
                    </Badge>
                  )}
                  {activity.metadata.fileSize && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.fileSize}
                    </Badge>
                  )}
                  {activity.metadata.comments && (
                    <Badge variant="outline" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {activity.metadata.comments}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {StatusIcon && (
            <StatusIcon className={`h-4 w-4 ${statusColor}`} />
          )}
        </div>
      </div>
    </div>
  )
}

export function TeamActivity() {
  const pendingActivities = mockActivities.filter(a => a.status === 'pending')
  const recentActivities = mockActivities.filter(a => a.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Team Aktivitäten</h2>
        <p className="text-muted-foreground">
          Bleibe über alle Team-Aktivitäten auf dem Laufenden
        </p>
      </div>

      {pendingActivities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Ausstehende Aktionen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {pendingActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Letzte Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="outline" className="w-full">
          <GitBranch className="h-4 w-4 mr-2" />
          Alle Aktivitäten anzeigen
        </Button>
      </div>
    </div>
  )
}
