import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  TrendingUp,
  Users,
  Eye,
  Download
} from 'lucide-react'

interface CommunityPost {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    badge?: string
  }
  content: {
    title: string
    description: string
    image?: string
    type: 'template' | 'post' | 'tutorial'
  }
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
    downloads?: number
  }
  tags: string[]
  timestamp: string
  isLiked: boolean
  isBookmarked: boolean
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Weber',
      username: '@sarahdesigns',
      avatar: '/avatars/shadcn.jpg',
      badge: 'Pro Designer'
    },
    content: {
      title: 'Minimalist Dashboard UI Kit',
      description: 'Ein komplettes Dashboard UI Kit mit 50+ Komponenten, perfekt für moderne Web-Anwendungen. Entwickelt mit Fokus auf Benutzerfreundlichkeit und Ästhetik.',
      image: '/hype_previews/dashboard-preview.jpg',
      type: 'template'
    },
    stats: {
      likes: 234,
      comments: 18,
      shares: 45,
      views: 1200,
      downloads: 89
    },
    tags: ['UI Kit', 'Dashboard', 'Minimal', 'Web Design'],
    timestamp: 'vor 2 Stunden',
    isLiked: false,
    isBookmarked: true
  },
  {
    id: '2',
    author: {
      name: 'Marcus Klein',
      username: '@marcusux',
      avatar: '/avatars/shadcn.png',
      badge: 'Top Contributor'
    },
    content: {
      title: 'Design System Best Practices',
      description: 'In diesem Tutorial zeige ich euch, wie ihr ein konsistentes Design System aufbaut, das skalierbar und wartbar ist.',
      type: 'tutorial'
    },
    stats: {
      likes: 156,
      comments: 32,
      shares: 67,
      views: 890
    },
    tags: ['Tutorial', 'Design System', 'Best Practices'],
    timestamp: 'vor 4 Stunden',
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    author: {
      name: 'Lisa Müller',
      username: '@lisamdesign',
      avatar: '/avatars/shadcn.jpg'
    },
    content: {
      title: 'Mobile App Wireframe Collection',
      description: 'Eine umfangreiche Sammlung von Wireframes für mobile Apps, die euch beim Prototyping helfen werden.',
      image: '/hype_previews/mobile-wireframes.jpg',
      type: 'template'
    },
    stats: {
      likes: 89,
      comments: 12,
      shares: 23,
      views: 456,
      downloads: 34
    },
    tags: ['Mobile', 'Wireframes', 'Prototyping'],
    timestamp: 'vor 6 Stunden',
    isLiked: false,
    isBookmarked: false
  }
]

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{post.author.name}</span>
                {post.author.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.badge}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{post.author.username}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <CardTitle className="text-lg mb-2">{post.content.title}</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {post.content.description}
          </p>
        </div>

        {post.content.image && (
          <div className="rounded-lg overflow-hidden bg-muted">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Template Vorschau</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.stats.views}</span>
            </div>
            {post.stats.downloads && (
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>{post.stats.downloads}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${post.isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
              {post.stats.likes}
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.stats.comments}
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <Share2 className="h-4 w-4 mr-1" />
              {post.stats.shares}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CommunityFeed() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Feed</h2>
          <p className="text-muted-foreground">
            Entdecke die neuesten Templates und Beiträge der Community
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Trending</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>Following</span>
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="w-full">
          Weitere Beiträge laden
        </Button>
      </div>
    </div>
  )
}
