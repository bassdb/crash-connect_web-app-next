'use server'

import { emailSchema } from '@/types/email-schema'
import { returnValidationErrors } from 'next-safe-action'
import { actionClient } from '@/lib/safe-action'
import { createClient } from '@/server/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { encodedRedirect } from '@/utils/utils'

export async function signInWithGoogleAction() {
  const origin = (await headers()).get('origin')
  console.log(origin)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `http://localhost:3000/auth/callback`,
    },
  })

  if (data.url) {
    console.log('Google responded')
    console.log(data.url)
    //   redirect(data.url) // use the redirect API for your server framework
  }
}
