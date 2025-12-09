'use client'

import AuthCard from '@/components/auth/auth-card'
import { forgotPasswordAction } from '@/server/actions/forgot-password-action'
import Link from 'next/link'
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

//* ------------------------------------------------------------- end of imports

export default function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { toast } = useToast()

  const { execute, isPending, status, result } = useAction(forgotPasswordAction, {
    onSuccess: ({ data }) => {
      if (!data) {
        console.log('No data returned from server')
      }
    },
  })

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    execute(values)
  }

  return (
    <AuthCard
      cardTitle='Reset Password'
      backButtonHref='/sign-in'
      backButtonLabel='Or login here instead.'
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
              {isPending ? 'Sending you an e-mail...' : 'Reset'}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  )
}
