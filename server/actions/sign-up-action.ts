'use server'

import { loginSchema } from '@/types/login-schema'
import { returnValidationErrors } from 'next-safe-action'
import { actionClient } from '@/lib/safe-action'
import { createClient } from '@/server/supabase/server'
import { redirect } from 'next/navigation'

export const signUpAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    // console.log(email)
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { error: `Error ${error.message}` }
      // return returnValidationErrors(loginSchema, { _errors: [error.message] })
    }
    // return redirect('/protected')
    return {
      success: `succesfully Signed Up. Please verify yout e-mail adress to get startet ${email}`,
    }
  })
