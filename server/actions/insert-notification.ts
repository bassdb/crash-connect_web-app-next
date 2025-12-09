'use server'

import { createClient } from '@/server/supabase/server'
import { actionClient } from '@/lib/safe-action'
import { returnValidationErrors } from 'next-safe-action/.'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const notiSchema = z.object({
  notification: z.string(),
})

export const insertNotification = actionClient
  .schema(notiSchema)
  .action(async ({ parsedInput: { notification } }) => {
    const supabase = await createClient()
    console.log('hello from action!')
    const { status, error } = await supabase.from('notes').insert({
      title: notification,
    })

    if (error) {
      console.log(error)
      return { error: error.message }
    }
    revalidatePath('/insert-data')
    return { success: { status }, message: 'Notification added!' }
  })
