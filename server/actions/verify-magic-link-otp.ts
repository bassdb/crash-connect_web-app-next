'use server'

import { otpSchema } from '@/types/email-schema'
import { actionClient } from '@/lib/safe-action'
import { createClient } from '@/server/supabase/server'
import { redirect } from 'next/navigation'

export const verifyMagicLinkOtpAction = actionClient
  .schema(otpSchema)
  .action(async ({ parsedInput: { email, token } }) => {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      return { error: error.message || 'Invalid OTP code. Please try again.' }
    }

    if (!data.session) {
      return { error: 'Verification failed. Please try again.' }
    }

    return redirect('/protected')
  })

