'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { otpSchema } from '@/types/email-schema'
import { z } from 'zod'
import { cn } from '@/utils/cn'

interface OtpInputProps {
  email: string
  onSubmit: (code: string) => void
  onResend: () => void
  isLoading?: boolean
  error?: string
}

export function OtpInput({
  email,
  onSubmit,
  onResend,
  isLoading = false,
  error,
}: OtpInputProps) {
  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: email,
      token: '',
    },
  })

  const handleSubmit = (values: z.infer<typeof otpSchema>) => {
    onSubmit(values.token)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    form.setValue('token', value)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='token'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-xs'>Verification Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  placeholder='000000'
                  maxLength={6}
                  className={cn(
                    'text-center text-2xl tracking-widest',
                    error && 'border-destructive'
                  )}
                  disabled={isLoading}
                  onChange={(e) => {
                    handleChange(e)
                    field.onChange(e)
                  }}
                />
              </FormControl>
              {error && (
                <p className='text-xs text-destructive'>{error}</p>
              )}
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        <div className='flex gap-2'>
          <Button
            type='submit'
            className='flex-1'
            disabled={form.watch('token').length !== 6 || isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onResend}
            disabled={isLoading}
          >
            Resend Code
          </Button>
        </div>
      </form>
    </Form>
  )
}

