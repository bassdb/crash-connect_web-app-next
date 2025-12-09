'use client'

import { useUserProfile, useUserDisplayName, useIsAdmin } from '@/hooks/use-user-profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { User, Shield, Crown } from 'lucide-react'

/**
 * Component to display user profile information
 * Uses the useUserProfile hook to get data from JWT claims
 */
export function UserProfileDisplay() {
  const { role, avatarUrl, fullName, username, isAuthenticated } = useUserProfile()
  const displayName = useUserDisplayName()
  const isAdmin = useIsAdmin()

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Nicht angemeldet</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4" />
      case 'owner':
      case 'admin':
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'owner':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'team_admin':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'creator':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>
              {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{displayName}</h3>
            {username && fullName && (
              <p className="text-sm text-muted-foreground truncate">@{username}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={`flex items-center space-x-1 ${getRoleColor(role)}`}
          >
            {getRoleIcon(role)}
            <span className="capitalize">{role}</span>
          </Badge>
          {isAdmin && (
            <Badge variant="outline" className="text-xs">
              Admin
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact user profile component for navigation/header use
 */
export function UserProfileCompact() {
  const { avatarUrl, isAuthenticated } = useUserProfile()
  const displayName = useUserDisplayName()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="text-xs">
          {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate max-w-[120px]">
        {displayName}
      </span>
    </div>
  )
}

/**
 * Role-based conditional rendering component
 */
interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { role, isAuthenticated } = useUserProfile()

  if (!isAuthenticated || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
