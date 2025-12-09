'use server'

import { userIdWithRoleSchema } from '@/types/email-schema'

import { actionClient } from '@/lib/safe-action'
import { createSuperClient } from '@/server/supabase/superadmin'

import { checkUserRole, type UserRole } from '@/lib/check-session-and-role'

export const adminUpdatesUserRole = actionClient
  .schema(userIdWithRoleSchema)
  .action(async ({ parsedInput: { userID, role } }) => {
    const checkRole = await checkUserRole()

    if (!checkRole) {
      return {
        error: 'Error fetching your role.',
      }
    }

    const { user_role, isOwnerOrAbove, isAdminOrAbove, isCreatorOrAbove } = checkRole

    if (role === 'superadmin' && user_role === 'superadmin') {
      return {
        error: `As an ${user_role} you are can not update this user to the role of: ${role}. To update an existing superadmin, you have to do so on a database level.`,
      }
    }

    if ((role === 'product_owner' || role === 'superadmin') && !isOwnerOrAbove) {
      return {
        error: `As an ${user_role} you are not authorized to update this user to the role of: ${role}`,
      }
    }
    if (
      (role === 'admin' || role === 'product_owner' || role === 'superadmin') &&
      !isAdminOrAbove
    ) {
      return {
        error: `As an ${user_role} you are not authorized to update this user to the role of: ${role}`,
      }
    }

    const supabaseAdmin = await createSuperClient()

    console.log('Now trying to update user with: ' + userID + ' and role of ' + role)

    //! This is the actual flow to update the user role

    const { data, error: updateRoleError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: role })
      .eq('user_id', userID)
      .select()

    if (updateRoleError || data.length === 0) {
      console.log('Error creating user role:', updateRoleError)
      return {
        error: 'Error creating user role',
      }
    }

    // console.log('Successfully updated user role for user with user_id of: ' + data)

    return {
      success: 'Successfully updated user role for user with user_id of: ' + userID + ' to ' + role,
    }
  })
