'use client'

import AuthCard from '@/components/auth/auth-card'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { cn } from '@/utils/cn'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailSchema } from '@/types/email-schema'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { signInWithMagicLinkAction } from '@/server/actions/sign-in-with-magic-link'
import { verifyMagicLinkOtpAction } from '@/server/actions/verify-magic-link-otp'
import { OtpInput } from '@/components/auth/otp-input'

//* ------------------------------------------------------------- end of imports

export default function MagicLinkForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const {
    execute: executeSendOtp,
    isPending: isPendingSendOtp,
    status: sendOtpStatus,
    result: sendOtpResult,
  } = useAction(signInWithMagicLinkAction, {
    onSuccess: ({ data }) => {
      if (data && 'success' in data && data.success && 'email' in data && data.email) {
        setEmail(data.email)
        setStep('otp')
      }
    },
  })

  const {
    execute: executeVerifyOtp,
    isPending: isPendingVerifyOtp,
    status: verifyOtpStatus,
    result: verifyOtpResult,
  } = useAction(verifyMagicLinkOtpAction)

  const handleEmailSubmit = (values: z.infer<typeof emailSchema>) => {
    executeSendOtp(values)
  }

  const handleOtpSubmit = (code: string) => {
    executeVerifyOtp({
      email: email,
      token: code,
    })
  }

  const handleResendOtp = () => {
    executeSendOtp({ email })
  }

  const handleBackToEmail = () => {
    setStep('email')
    setEmail('')
    emailForm.reset()
  }

  const otpError =
    verifyOtpResult?.serverError || verifyOtpResult?.validationErrors?.token?._errors?.[0]

  const emailError =
    sendOtpResult?.serverError || sendOtpResult?.validationErrors?.email?._errors?.[0]

  return (
    <AuthCard
      cardTitle={step === 'email' ? 'Sign In with Magic Link' : 'Enter Verification Code'}
      backButtonHref={step === 'email' ? '/sign-in' : undefined}
      backButtonLabel={step === 'email' ? 'Login with e-mail and password here.' : undefined}
      showSocials={false}
    >
      <div>
        {step === 'email' ? (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className='flex flex-col gap-4'
            >
              <div>
                <FormField
                  control={emailForm.control}
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
                      {emailError && (
                        <p className='text-xs text-destructive'>{emailError}</p>
                      )}
                      <FormMessage className='text-xs' />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                disabled={isPendingSendOtp}
                type='submit'
                className={cn(
                  'w-full my-2',
                  sendOtpStatus === 'executing' ? 'animate-pulse' : ''
                )}
              >
                {isPendingSendOtp ? 'Sending code...' : 'Send verification code'}
              </Button>
            </form>
          </Form>
        ) : (
          <div className='flex flex-col gap-4'>
            <div className='text-sm text-muted-foreground text-center'>
              We sent a verification code to <strong>{email}</strong>
            </div>
            <OtpInput
              email={email}
              onSubmit={handleOtpSubmit}
              onResend={handleResendOtp}
              isLoading={isPendingVerifyOtp || isPendingSendOtp}
              error={otpError}
            />
            <Button
              type='button'
              variant='ghost'
              onClick={handleBackToEmail}
              disabled={isPendingVerifyOtp || isPendingSendOtp}
              className='w-full'
            >
              Change email address
            </Button>
          </div>
        )}
      </div>
    </AuthCard>
  )
}
