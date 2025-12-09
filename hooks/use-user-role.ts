"use client"

// UI imports

// react imports
import { useEffect, useMemo, useState } from 'react'

// component imports

// packages imports

// state imports

// server logic imports

// client logic imports
import { createClient } from '@/server/supabase/client'
import { getUserRole as decodeUserRoleFromJwt } from '@/utils/decode-jwt'

export type UserRole = 'superadmin' | 'product_owner' | 'admin' | 'creator' | 'consumer' | null

interface UseUserRoleResult {
  userRole: UserRole
  isOwnerOrAbove: boolean
  isAdminOrAbove: boolean
  isCreatorOrAbove: boolean
  isLoading: boolean
}

function deriveRoleFlags(userRole: UserRole) {
  const isOwnerOrAbove = userRole === 'superadmin' || userRole === 'product_owner'
  const isAdminOrAbove = isOwnerOrAbove || userRole === 'admin'
  const isCreatorOrAbove = isAdminOrAbove || userRole === 'creator'
  return { isOwnerOrAbove, isAdminOrAbove, isCreatorOrAbove }
}

export function useUserRole(): UseUserRoleResult {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const supabase = createClient()

    let isMounted = true

    const load = async () => {
      const { data } = await supabase.auth.getSession()
      const jwt = data?.session?.access_token
      if (!jwt) {
        if (!isMounted) return
        setUserRole(null)
        setIsLoading(false)
        return
      }
      const decoded = await decodeUserRoleFromJwt(jwt)
      const role = (decoded?.payload?.user_role as Exclude<UserRole, null>) ?? null
      if (!isMounted) return
      setUserRole(role)
      setIsLoading(false)
    }

    void load()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const jwt = session?.access_token
      if (!jwt) {
        setUserRole(null)
        return
      }
      decodeUserRoleFromJwt(jwt).then((decoded) => {
        const role = (decoded?.payload?.user_role as Exclude<UserRole, null>) ?? null
        setUserRole(role)
      })
    })

    return () => {
      isMounted = false
      subscription?.subscription?.unsubscribe()
    }
  }, [])

  const { isOwnerOrAbove, isAdminOrAbove, isCreatorOrAbove } = useMemo(
    () => deriveRoleFlags(userRole),
    [userRole]
  )

  return { userRole, isOwnerOrAbove, isAdminOrAbove, isCreatorOrAbove, isLoading }
}


