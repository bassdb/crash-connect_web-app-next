'use server'

import { loginSchema } from '@/types/login-schema'

import { actionClient } from '@/lib/safe-action'
import { createClient } from '@/server/supabase/server'

import { redirect } from 'next/navigation'

export const signInAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    console.log(email)
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: `Error ${error.message}` }
      // return returnValidationErrors(loginSchema, { _errors: [error.message] })
    }
    // return redirect('/protected')
    return { success: `successfully logged in ${email}` }
  })
