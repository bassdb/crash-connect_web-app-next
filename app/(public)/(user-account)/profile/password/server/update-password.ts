'use server'

import { createClient } from '@/server/supabase/server'
import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { returnValidationErrors } from 'next-safe-action'
//*Uppercase is type - lowercase is zod schema
import { UpdatePasswordSchema, updatePasswordSchema } from '@/types/update-password-schema'

type ReturnType = {
  error?: string
  success?: string
}

export const updatePassword = actionClient
  .schema(updatePasswordSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()

    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password: parsedInput.newPassword,
    })

    if (updatePasswordError) {
      return { error: updatePasswordError.message }
    }

    return { success: 'Password updated successfully' }
  })
