'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { UserSearch } from 'lucide-react'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailSchema } from '@/types/email-schema'
import { findUser } from '@/server/actions/admin-usermanagement/admin-user-management'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export default function SearchUser() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof emailSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    toast({
      title: 'Uh oh! Something went wrong.',
      description: 'There was a problem with your request.',
    })
    findUser(values)
    console.log(values)
  }

  return (
    <div className='flex-1'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex items-center gap-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormControl>
                  <Input placeholder='Search user by e-mail' {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button variant='default' type='submit'>
            <UserSearch size={16} className='mr-2' />
            Search
          </Button>
        </form>
      </Form>
    </div>
  )
}
