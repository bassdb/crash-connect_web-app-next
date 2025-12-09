'use server'

import { emailSchema } from '@/types/email-schema'
import { returnValidationErrors } from 'next-safe-action'
import { actionClient } from '@/lib/safe-action'
import { createClient } from '@/server/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { encodedRedirect } from '@/utils/utils'

export const signInWithMagicLinkAction = actionClient
  .schema(emailSchema)
  .action(async ({ parsedInput: { email } }) => {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      return { error: error.message || 'Failed to send OTP. Please try again.' }
    }

    return {
      success: true,
      message: 'OTP code has been sent to your email address.',
      email: email,
    }
  })
