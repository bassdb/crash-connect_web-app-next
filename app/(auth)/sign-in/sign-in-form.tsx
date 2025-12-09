'use client'

import AuthCard from '@/components/auth/auth-card'
import { signInAction } from '@/server/actions/sign-in-action'
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
import { useRouter } from 'next/navigation'

//* ------------------------------------------------------------- end of imports

export default function SignInForm() {
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
  const router = useRouter()

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

  const { execute, isPending, status, result } = useAction(signInAction, {
    onSuccess: ({ data }) => {
      if (!data) {
        console.log('No data returned from server')
      }
      if (data?.error) {
        toast({ title: 'error', description: `Error ${data.error}` })
      }
      if (data?.success) {
        toast({ title: 'success', description: `Successfully logged in ` })
        router.push('/protected')
      }

      // console.log(data)
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    // console.log(values)
    execute(values)
  }

  return (
    <>
      <Link
        href='/'
        className='absolute left-4 top-4 text-sm text-muted-foreground hover:text-primary'
      >
        ← Back to home
      </Link>
      <AuthCard
        cardTitle='Sign in'
        backButtonHref='/sign-up'
        backButtonLabel='Create new account'
        showSocials={true}
      >
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <Button size={'sm'} variant={'link'} className='text-xs' asChild>
                <Link href='/forgot-password'>Forgot password</Link>
              </Button>
              <FormError message={result.data?.error} />
              <FormSuccess message={result.data?.success} />
              <Button
                disabled={isPending}
                type='submit'
                className={cn('w-full my-2', status === 'executing' ? 'animate-pulse' : '')}
              >
                {isPending ? 'Checking your credentials...' : 'Login'}
              </Button>
            </form>
          </Form>
        </div>
      </AuthCard>
    </>
  )
}
