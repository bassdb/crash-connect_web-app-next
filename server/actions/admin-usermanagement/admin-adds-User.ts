'use server'

import { emailSchemaWithRole } from '@/types/email-schema'
import { actionClient } from '@/lib/safe-action'
import { createSuperClient } from '@/server/supabase/superadmin'

export const adminAddsUserWithRole = actionClient
  .schema(emailSchemaWithRole)
  .action(async ({ parsedInput: { email, role } }) => {
    const supabaseAdmin = await createSuperClient()

    console.log('Now trying to create a user with email:', email)

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
    })

    if (error || !newUser) {
      console.log('Error creating user:', error)
      return {
        error: `Error: ${error?.message}`,
      }
    }
    console.log('----------------------------------------------')
    console.log('Successfully created user:', newUser.user.email, 'with id: ' + newUser.user.id)
    console.log('----------------------------------------------')
    console.log('Now fetching the new user and his default role from the profiles_with_roles view')
    console.log('----------------------------------------------')

    const { data: existingUser, error: fetchCurrentUserRoleError } = await supabaseAdmin
      .from('user_roles')
      .select()
      .eq('user_id', newUser.user.id)

    if (fetchCurrentUserRoleError || existingUser?.length === 0) {
      console.log('Error fetching user role:', fetchCurrentUserRoleError)
    }

    if (existingUser && existingUser.length > 0) {
      console.log(
        'User with id:' + existingUser[0].user_id + ' exists with default role of',
        existingUser[0].role
      )
    }

    console.log('----------------------------------------------')
    console.log('Now trying to assign the role of ' + role + ' for: ' + newUser.user.id)
    console.log('----------------------------------------------')

    // console.log('data:', data[0].user_id)

    // console.log(
    //   'User with id:' + currentUserRole?.user_id + 'exists with default role of',
    //   currentUserRole?.role
    // )

    const { error: updateRoleError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: role })
      .eq('user_id', newUser.user.id)

    if (updateRoleError) {
      console.log('Error creating user role:', updateRoleError)
      return {
        error: 'Error creating user role',
      }
    }
    console.log('Assignimg the role of ' + role + ' for: ' + newUser.user.id + ' was successful')
    return {
      success:
        'Successfully created user with email: ' + newUser.user.email + ' and role of ' + role,
    }
  })
