"use client"

import { createClient } from '@/server/supabase/client'
import { getUserRole } from '@/utils/decode-jwt'

export type ClientUserRole =
  | 'superadmin'
  | 'product_owner'
  | 'admin'
  | 'creator'
  | 'consumer'

export type ClientUserInfo = {
  user_role: ClientUserRole | null
  isOwnerOrAbove: boolean
  isAdminOrAbove: boolean
  isCreatorOrAbove: boolean
}

export async function getClientUserRole(): Promise<ClientUserInfo> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return {
      user_role: null,
      isOwnerOrAbove: false,
      isAdminOrAbove: false,
      isCreatorOrAbove: false,
    }
  }

  const userRole = await getUserRole(session.access_token)
  const user_role = (userRole?.payload?.user_role as ClientUserRole | undefined) || null

  const isOwnerOrAbove = user_role === 'superadmin' || user_role === 'product_owner'
  const isAdminOrAbove = isOwnerOrAbove || user_role === 'admin'
  const isCreatorOrAbove = isAdminOrAbove || user_role === 'creator'

  return {
    user_role,
    isOwnerOrAbove,
    isAdminOrAbove,
    isCreatorOrAbove,
  }
}


