'use server'

import { emailSchema } from '@/types/email-schema'
import { returnValidationErrors } from 'next-safe-action'
import { actionClient } from '@/lib/safe-action'
import { createClient } from '@/server/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { encodedRedirect } from '@/utils/utils'

export const forgotPasswordAction = actionClient
  .schema(emailSchema)
  .action(async ({ parsedInput: { email } }) => {
    const origin = (await headers()).get('origin')
    console.log(origin)
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    })

    // if (error) {
    //   //   return { error: 'Something went wrong. Try again' }
    //   return encodedRedirect('error', '/auth-message', 'Could not reset password')
    // }

    return encodedRedirect(
      'success',
      '/auth-message',
      'If you are registered with our app then we sent you an e-mail. Check your email for a link to reset your password.'
    )

    // if (!data) {
    //   console.log('No data returned from server')
    //   return { error: `Error can't find a user` }
    //   const { error } = await supabase.auth.resetPasswordForEmail(email, {
    //     redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    //   })
    // }

    // if (error) {
    //     return { error: `Error ${error.message}` }
    //   return returnValidationErrors(loginSchema, { _errors: [error.message] })
    // }
    // return redirect('/protected')
  })
