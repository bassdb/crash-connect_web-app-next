import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Eye, 
  Heart, 
  Users,
  FileText,
  Star
} from 'lucide-react'

interface DashboardStat {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const mockStats: DashboardStat[] = [
  {
    id: '1',
    title: 'Template Downloads',
    value: '1,234',
    change: 12.5,
    changeType: 'increase',
    icon: Download,
    description: 'Downloads diesen Monat'
  },
  {
    id: '2',
    title: 'Aufrufe',
    value: '8,567',
    change: 8.2,
    changeType: 'increase',
    icon: Eye,
    description: 'Aufrufe in den letzten 30 Tagen'
  },
  {
    id: '3',
    title: 'Likes',
    value: '456',
    change: -2.1,
    changeType: 'decrease',
    icon: Heart,
    description: 'Likes auf deine Templates'
  },
  {
    id: '4',
    title: 'Follower',
    value: '89',
    change: 15.3,
    changeType: 'increase',
    icon: Users,
    description: 'Neue Follower diese Woche'
  },
  {
    id: '5',
    title: 'Aktive Projekte',
    value: '12',
    change: 0,
    changeType: 'increase',
    icon: FileText,
    description: 'Projekte in Bearbeitung'
  },
  {
    id: '6',
    title: 'Bewertung',
    value: '4.8',
    change: 0.2,
    changeType: 'increase',
    icon: Star,
    description: 'Durchschnittliche Bewertung'
  }
]

function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon
  const TrendIcon = stat.changeType === 'increase' ? TrendingUp : TrendingDown
  const trendColor = stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
  const bgColor = stat.changeType === 'increase' ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="flex items-center space-x-2">
            {stat.change !== 0 && (
              <Badge 
                variant="outline" 
                className={`${bgColor} ${trendColor} border-current`}
              >
                <TrendIcon className="h-3 w-3 mr-1" />
                {Math.abs(stat.change)}%
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Übersicht</h2>
        <p className="text-muted-foreground">
          Deine wichtigsten Kennzahlen auf einen Blick
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </div>
  )
}
