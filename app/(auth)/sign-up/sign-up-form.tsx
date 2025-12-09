'use client'

import AuthCard from '@/components/auth/auth-card'
import { signUpAction } from '@/server/actions/sign-up-action'
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
import { FormError } from '@/components/error-handling/form-error'
import { FormSuccess } from '@/components/error-handling/form-success'
import { useToast } from '@/hooks/use-toast'

import { cn } from '@/utils/cn'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/types/login-schema'
import { Button } from '@/components/ui/button'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'

//* ------------------------------------------------------------- end of imports

export default function SignUpForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { toast } = useToast()

  //   const { form, action, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(
  //     signInAction,
  //     zodResolver(loginSchema),
  //     {
  //       formProps: {
  //         defaultValues: {
  //           email: '',
  //           password: '',
  //         },
  //       },
  //       actionProps: {
  //         onSuccess: (data) => {
  //           //   console.log(data)
  //           //   setSuccess(data.success)
  //           toast({ title: 'success', description: `Successfully logged in ` })
  //         },
  //       },
  //     }
  //   )

  const { execute, isPending, status, result } = useAction(signUpAction, {
    onSuccess: ({ data }) => {
      if (!data) {
        console.log('No data returned from server')
      }
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    execute(values)
  }

  return (
    <AuthCard
      cardTitle='Sign up'
      backButtonHref='/sign-in'
      backButtonLabel='Alredy have an account? Login here.'
      showSocials={true}
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
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>Password</FormLabel>
                    <FormControl>
                      <Input placeholder='********' {...field} type='Password' />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <FormError message={result.data?.error} />
            <FormSuccess message={result.data?.success} />
            <Button
              disabled={isPending}
              type='submit'
              className={cn('w-full my-2', status === 'executing' ? 'animate-pulse' : '')}
            >
              {isPending ? 'Checking your credentials...' : 'Sign Up'}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  )
}
