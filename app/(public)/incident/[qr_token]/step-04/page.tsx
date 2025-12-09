'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { submitIncidentAction } from '@/server/actions/incident-actions'
import { verifyPhoneAction, resendVerificationCodeAction } from '@/server/actions/phone-verification-actions'
import { ProgressIndicator } from '@/components/incident/progress-indicator'
import { PhoneVerificationInput } from '@/components/incident/phone-verification-input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAction } from 'next-safe-action/hooks'

export default function PhoneVerificationStep() {
  const router = useRouter()
  const params = useParams()
  const [incidentId, setIncidentId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { execute: submitIncident, result: submitResult } = useAction(submitIncidentAction)
  const { execute: verifyPhone, result: verifyResult } = useAction(verifyPhoneAction)
  const { execute: resendCode, result: resendResult } = useAction(resendVerificationCodeAction)
  
  useEffect(() => {
    // On mount, submit the incident if not already submitted
    if (!incidentId && !isSubmitting) {
      const incidentType = sessionStorage.getItem('incident_type')
      const turnstileToken = sessionStorage.getItem('turnstile_token')
      const reporterName = sessionStorage.getItem('reporter_name')
      const reporterPhone = sessionStorage.getItem('reporter_phone')
      const reporterEmail = sessionStorage.getItem('reporter_email')
      const incidentDescription = sessionStorage.getItem('incident_description')
      const incidentDate = sessionStorage.getItem('incident_date')
      
      if (incidentType && turnstileToken && reporterName && reporterPhone && incidentDescription && incidentDate) {
        setIsSubmitting(true)
        submitIncident({
          qrToken: params.qr_token as string,
          incidentType: incidentType as 'damage' | 'theft' | 'accident' | 'other',
          turnstileToken,
          reporterName,
          reporterPhone,
          reporterEmail: reporterEmail || undefined,
          incidentDescription,
          incidentDate,
          honeypot: undefined
        })
      } else {
        // Missing data, redirect to start
        router.push(`/incident/${params.qr_token}/step-01`)
      }
    }
  }, [incidentId, isSubmitting, params.qr_token, router, submitIncident])
  
  useEffect(() => {
    if (submitResult?.data?.incidentId) {
      setIncidentId(submitResult.data.incidentId)
      setIsSubmitting(false)
    }
  }, [submitResult])
  
  useEffect(() => {
    if (verifyResult?.data?.success && verifyResult.data.incidentId) {
      // Clear sessionStorage
      sessionStorage.removeItem('incident_type')
      sessionStorage.removeItem('turnstile_token')
      sessionStorage.removeItem('reporter_name')
      sessionStorage.removeItem('reporter_phone')
      sessionStorage.removeItem('reporter_email')
      sessionStorage.removeItem('incident_description')
      sessionStorage.removeItem('incident_date')
      
      // Redirect to success page
      router.push(`/incident/${params.qr_token}/success?incidentId=${verifyResult.data.incidentId}`)
    }
  }, [verifyResult, router, params.qr_token])
  
  const handleVerify = (code: string) => {
    if (!incidentId) return
    verifyPhone({ incidentId, verificationCode: code })
  }
  
  const handleResend = () => {
    if (!incidentId) return
    resendCode({ incidentId })
  }
  
  if (!incidentId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Meldung wird erstellt...</CardTitle>
            <CardDescription>
              Bitte warten Sie einen Moment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitResult?.serverError && (
              <p className="text-sm text-destructive mb-4">
                {submitResult.serverError}
              </p>
            )}
            {submitResult?.data?.error && (
              <p className="text-sm text-destructive mb-4">
                {submitResult.data.error}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col p-4">
      <ProgressIndicator currentStep={4} totalSteps={4} />
      
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Telefonnummer verifizieren</CardTitle>
            <CardDescription>
              Bitte geben Sie den 6-stelligen Code ein, der an Ihre Telefonnummer gesendet wurde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneVerificationInput
              onSubmit={handleVerify}
              onResend={handleResend}
              isLoading={verifyResult?.status === 'executing'}
              error={verifyResult?.data?.error || verifyResult?.serverError}
            />
            {resendResult?.data?.success && (
              <p className="text-sm text-green-600 mt-2">Neuer Code wurde gesendet</p>
            )}
            {resendResult?.data?.error && (
              <p className="text-sm text-destructive mt-2">{resendResult.data.error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

