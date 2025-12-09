'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reporterInfoSchema } from '@/types/incident-schema'
import type { z } from 'zod'
import { ProgressIndicator } from '@/components/incident/progress-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HoneypotField } from '@/components/incident/honeypot-field'

type ReporterInfoForm = z.infer<typeof reporterInfoSchema>

export default function ReporterInfoStep() {
  const router = useRouter()
  const params = useParams()
  const [honeypot, setHoneypot] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<ReporterInfoForm>({
    resolver: zodResolver(reporterInfoSchema),
    defaultValues: {
      qrToken: params.qr_token as string,
      honeypot: ''
    }
  })
  
  useEffect(() => {
    setValue('qrToken', params.qr_token as string)
  }, [params.qr_token, setValue])
  
  const onSubmit = (data: ReporterInfoForm) => {
    // Store in sessionStorage
    sessionStorage.setItem('reporter_name', data.reporterName)
    sessionStorage.setItem('reporter_phone', data.reporterPhone)
    if (data.reporterEmail) {
      sessionStorage.setItem('reporter_email', data.reporterEmail)
    }
    
    router.push(`/incident/${params.qr_token}/step-03`)
  }
  
  return (
    <div className="flex min-h-screen flex-col p-4">
      <ProgressIndicator currentStep={2} totalSteps={4} />
      
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Ihre Kontaktdaten</h1>
            <p className="text-muted-foreground">Bitte geben Sie Ihre Daten ein</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reporterName">Name *</Label>
              <Input
                id="reporterName"
                {...register('reporterName')}
                placeholder="Max Mustermann"
                disabled={isSubmitting}
              />
              {errors.reporterName && (
                <p className="text-sm text-destructive">{errors.reporterName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reporterPhone">Telefonnummer *</Label>
              <Input
                id="reporterPhone"
                type="tel"
                {...register('reporterPhone')}
                placeholder="+491234567890"
                disabled={isSubmitting}
              />
              {errors.reporterPhone && (
                <p className="text-sm text-destructive">{errors.reporterPhone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reporterEmail">E-Mail (optional)</Label>
              <Input
                id="reporterEmail"
                type="email"
                {...register('reporterEmail')}
                placeholder="max@example.com"
                disabled={isSubmitting}
              />
              {errors.reporterEmail && (
                <p className="text-sm text-destructive">{errors.reporterEmail.message}</p>
              )}
            </div>
          </div>
          
          <HoneypotField value={honeypot} onChange={setHoneypot} />
          <input type="hidden" {...register('honeypot')} value={honeypot} />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Wird gespeichert...' : 'Weiter'}
          </Button>
        </form>
      </div>
    </div>
  )
}

