import { useUser } from '@supabase/auth-helpers-react'
import { useMemo } from 'react'

export interface UserProfile {
  role: string
  avatarUrl?: string
  fullName?: string
  username?: string
  isAuthenticated: boolean
  userId?: string
}

/**
 * Custom hook to access user profile data from JWT token claims
 * 
 * This hook extracts user role and profile information that was added
 * to the JWT token by the custom_access_token_hook function.
 * 
 * @returns UserProfile object with role, avatar, name, and username
 */
export function useUserProfile(): UserProfile {
  const user = useUser()

  return useMemo(() => {
    if (!user) {
      return {
        role: 'consumer',
        isAuthenticated: false,
      }
    }

    // Extract data from JWT claims (added by custom_access_token_hook)
    const userRole = user.user_metadata?.user_role || 'consumer'
    const avatarUrl = user.user_metadata?.avatar_url
    const fullName = user.user_metadata?.full_name
    const username = user.user_metadata?.username

    return {
      role: userRole,
      avatarUrl,
      fullName,
      username,
      isAuthenticated: true,
      userId: user.id,
    }
  }, [user])
}

/**
 * Hook to check if user has a specific role
 * 
 * @param requiredRole - The role to check for
 * @returns boolean indicating if user has the required role
 */
export function useUserRole(requiredRole: string): boolean {
  const { role } = useUserProfile()
  return role === requiredRole
}

/**
 * Hook to check if user is admin (admin, owner, or superadmin)
 * 
 * @returns boolean indicating if user has admin privileges
 */
export function useIsAdmin(): boolean {
  const { role } = useUserProfile()
  return ['admin', 'owner', 'superadmin'].includes(role)
}

/**
 * Hook to get user display name with fallback logic
 * 
 * @returns string with user's display name
 */
export function useUserDisplayName(): string {
  const { fullName, username } = useUserProfile()
  return fullName || username || 'Unbekannter Benutzer'
}
