'use server'

import { createSuperClient } from '@/server/supabase/superadmin'

import { redirect } from 'next/navigation'

import { checkUserRole } from '@/lib/check-session-and-role'
import { encodedRedirect } from '@/utils/utils'

type EditUserActions = {
  user_id?: string
  action?: 'delete' | 'update'
  email?: string
}

export async function findUser({ email }: EditUserActions) {
  console.log('Trying to fetch user with user_id:', email)
  const supabaseAdmin = await createSuperClient()

  const { data, error } = await supabaseAdmin
    .from('profiles_with_roles')
    .select()
    .eq('email', email)

  if (error) {
    console.log('Error fetching user:', error)
    return { error: 'Error fetching user' }
  }
  if (!data || data.length === 0) {
    console.log('User not found')
    return { error: 'User not found' }
  }

  const sendUserAsSearchParams = new URLSearchParams(data)
  console.log('User:', data)
  return redirect(`/admin-dashboard/user-management?foundUser=${sendUserAsSearchParams}`)
}

// --------------------------------------------------------------------------------------------------

export async function deleteUser({ user_id }: EditUserActions) {
  console.log('Checking permissions to delete User with user_id:', user_id)
  if (!user_id) {
    console.log('User ID is required to delete a user.')
    return { error: 'User ID is required to delete a user.' }
  }

  const checkCurrentUser = await checkUserRole()

  if (!checkCurrentUser) {
    return encodedRedirect(
      'error',
      '/admin-dashboard/admin-feedback',
      'Could not find your role which is needed to view this ressoure.'
    )
  }

  const { user_role, isOwnerOrAbove, isAdminOrAbove, isCreatorOrAbove } = checkCurrentUser

  const supabaseAdmin = await createSuperClient()

  const { data: targetUserRole, error: getTargetUserRoleError } = await supabaseAdmin
    .from('profiles_with_roles')
    .select('role')
    .eq('profile_id', user_id)
    .single()

  if (getTargetUserRoleError) {
    console.log('Error fetching user:', getTargetUserRoleError)
    return { error: 'Error fetching user' }
  }

  const targetRole = targetUserRole.role

  console.log('Target Role:', targetRole)

  let canDelete = true

  if (targetRole === 'superadmin' && user_role === 'superadmin') {
    canDelete = false
  }

  if (targetRole === 'product_owner') {
    canDelete = !isOwnerOrAbove
  }

  if (targetRole === 'admin') {
    canDelete = !isAdminOrAbove
  }

  console.log('Can delete:', canDelete)

  if (!canDelete) {
    console.log('You do not have permission to delete this user.')
    return encodedRedirect(
      'error',
      '/admin-dashboard/admin-feedback',
      'You do not have permission to delete this user.'
    )
  }
  console.log('Deleting User:', user_id)

  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

  if (error) {
    return { error: 'Error deleting user' }
  }

  return redirect('/admin-dashboard/user-management')
}

// --------------------------------------------------------------------------------------------------

export async function editUser({ user_id }: EditUserActions) {
  console.log('EditUser with user_id:', user_id)
}

// --------------------------------------------------------------------------------------------------

export async function createUser({ email }: EditUserActions) {
  console.log('Updating User with email:', email)
}
