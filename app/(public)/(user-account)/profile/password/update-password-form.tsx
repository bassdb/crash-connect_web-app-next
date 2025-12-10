'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { UpdatePasswordSchema, updatePasswordSchema } from '@/types/update-password-schema'

import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { updatePassword } from '@/app/(public)/(user-account)/profile/password/server/update-password'
import {
  FormField,
  FormMessage,
  FormItem,
  FormControl,
  FormLabel,
  Form,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast, useToast } from '@/hooks/use-toast'
import { CardFooter } from '@/components/ui/card'
import { FormError } from '@/components/error-handling/form-error'
import { FormSuccess } from '@/components/error-handling/form-success'
import { useEffect } from 'react'
export default function UpdatePasswordForm() {
  const { form, action, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(
    updatePassword,
    zodResolver(updatePasswordSchema),
    {
      actionProps: {
        onSuccess: ({ data }) => {
          if (data?.success) {
            toast({
              title: 'Password updated',
              description: data.success,
            })
            resetFormAndAction()
          }
          if (data?.error) {
            toast({
              variant: 'destructive',
              title: 'Error updating password',
              description: data.error,
            })
          }
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Error updating password',
            description: 'Please try again',
          })
        },
      },
    }
  )

  const { isPending, result } = action

  useEffect(() => {
    if (result.data?.success) {
      toast({
        title: 'Password updated',
        description: result.data.success,
      })
    }
  }, [result.data])

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className='space-y-4'>
          <FormField
            control={form.control}
            name='currentPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='newPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Form>
      <CardFooter>
        {result.data?.error && <FormError message={result.data.error} />}
        {result.data?.success && <FormSuccess message={result.data.success} />}
      </CardFooter>
    </>
  )
}
