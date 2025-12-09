'use server'

import { createClient } from '@/server/supabase/server'
import { getUserRole } from '@/utils/decode-jwt'
import { encodedRedirect } from '@/utils/utils'

export type UserRole = 'superadmin' | 'product_owner' | 'admin' | 'creator' | 'consumer'
type isOwnerAndAboveType = boolean
type isAdminAndAboveType = boolean
type isCreatorAndAboveType = boolean

interface CheckUserRole {
  user_role: UserRole | null
  isOwnerOrAbove: isOwnerAndAboveType
  isAdminOrAbove: isAdminAndAboveType
  isCreatorOrAbove: isCreatorAndAboveType
  availableRoles?: string[]
}

export async function checkUserRole(): Promise<CheckUserRole | false> {
  const supabase = await createClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (!session) {
    console.warn('No session found!')
    return {
      user_role: null,
      isOwnerOrAbove: false,
      isAdminOrAbove: false,
      isCreatorOrAbove: false,
    }
  }

  const userRoleResponse = await getUserRole(session?.access_token as string)
  const user_role = userRoleResponse?.payload?.user_role

  if (!user_role) {
    console.warn('No user role found!')
    return {
      user_role: null,
      isOwnerOrAbove: false,
      isAdminOrAbove: false,
      isCreatorOrAbove: false,
    }
  }

  // console.log('Found Userrole: ' + user_role)

  // if (!session || !validUser) {
  //   return encodedRedirect('error', '/auth-feedback', 'Error fetching user data.')
  // }

  const isOwnerOrAbove = user_role === 'superadmin' || user_role === 'product_owner'
  const isAdminOrAbove = isOwnerOrAbove || user_role === 'admin'
  const isCreatorOrAbove = isAdminOrAbove || user_role === 'creator'

  let availableRoles: string[] = []

  if (user_role === 'superadmin') {
    availableRoles = ['product_owner', 'admin', 'creator', 'consumer']
  }
  if (user_role === 'product_owner') {
    availableRoles = ['admin', 'creator', 'consumer']
  }
  if (user_role === 'admin') {
    availableRoles = ['creator', 'consumer']
  }

  return {
    user_role: user_role,
    isOwnerOrAbove: isOwnerOrAbove,
    isAdminOrAbove: isAdminOrAbove,
    isCreatorOrAbove: isCreatorOrAbove,
    availableRoles: availableRoles,
  }
}
