'use client'

import AuthCard from '@/components/auth/auth-card'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'

import { cn } from '@/utils/cn'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailSchema } from '@/types/email-schema'
import { Button } from '@/components/ui/button'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { signInWithMagicLinkAction } from '@/server/actions/sign-in-with-magic-link'

//* ------------------------------------------------------------- end of imports

export default function MagicLinkForm() {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { toast } = useToast()

  const { execute, isPending, status, result } = useAction(signInWithMagicLinkAction, {
    onSuccess: ({ data }) => {
      if (!data) {
        console.log('No data returned from server')
      }
    },
  })

  const onSubmit = (values: z.infer<typeof emailSchema>) => {
    execute(values)
  }

  return (
    <AuthCard
      cardTitle='Sign In with Magic Link'
      backButtonHref='/sign-in'
      backButtonLabel='Login with e-mail and password here.'
      showSocials={false}
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <div>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='your@example.com'
                        {...field}
                        type='email'
                        autoComplete='email'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              type='submit'
              className={cn('w-full my-2', status === 'executing' ? 'animate-pulse' : '')}
            >
              {isPending ? 'Checking your account...' : 'Send magic link'}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  )
}
