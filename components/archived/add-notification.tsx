'use client'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { FormError } from '@/components/error-handling/form-error'
import { FormSuccess } from '@/components/error-handling/form-success'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { z } from 'zod'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { insertNotification } from '@/server/actions/insert-notification'

const notiSchema = z.object({
  notification: z.string(),
})

export default function AddNotificationCard() {
  const [error, setError] = useState<string | null>('')
  const [success, setSuccess] = useState<string | null>('')

  const form = useForm<z.infer<typeof notiSchema>>({
    resolver: zodResolver(notiSchema),
    defaultValues: {
      notification: '',
    },
  })

  const { execute } = useAction(insertNotification, {
    onSuccess: ({ data }) => {
      // console.log(data)
      if (data?.error) setError(data?.error)

      if (data?.success) setSuccess(data?.message)
    },
  })

  function onSubmit(values: z.infer<typeof notiSchema>) {
    // console.log(values)
    execute(values)
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Insert a new notification here </CardTitle>
        <CardDescription>Add a good description and a due date</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='bg-slate-100 dark:bg-zinc-800 rounded-md'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className=' flex items-center gap-4 rounded-md border p-4'
            >
              <div className='grow'>
                <FormField
                  control={form.control}
                  name='notification'
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>Your Notification</FormLabel> */}
                      <FormControl>
                        <Input placeholder='Your new notification' {...field} className='w-full' />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Button type='submit'>
                  <Send className='mr-4' size={14} /> Send
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter>
        <FormError message={error ?? null} />
        <FormSuccess message={success ?? null} />
      </CardFooter>
    </Card>
  )
}
