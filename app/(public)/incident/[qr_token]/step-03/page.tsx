'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { incidentDetailsSchema } from '@/types/incident-schema'
import type { z } from 'zod'
import { cn } from '@/lib/utils'
import { ProgressIndicator } from '@/components/incident/progress-indicator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { HoneypotField } from '@/components/incident/honeypot-field'

// Textarea component - using textarea directly since the component uses different utils path
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

type IncidentDetailsForm = z.infer<typeof incidentDetailsSchema>

export default function IncidentDetailsStep() {
  const router = useRouter()
  const params = useParams()
  const [honeypot, setHoneypot] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<IncidentDetailsForm>({
    resolver: zodResolver(incidentDetailsSchema),
    defaultValues: {
      qrToken: params.qr_token as string,
      incidentDate: new Date().toISOString(),
      honeypot: ''
    }
  })
  
  useEffect(() => {
    setValue('qrToken', params.qr_token as string)
    setValue('incidentDate', new Date().toISOString())
  }, [params.qr_token, setValue])
  
  const onSubmit = async (data: IncidentDetailsForm) => {
    // Collect all data from sessionStorage
    const incidentType = sessionStorage.getItem('incident_type')
    const turnstileToken = sessionStorage.getItem('turnstile_token')
    const reporterName = sessionStorage.getItem('reporter_name')
    const reporterPhone = sessionStorage.getItem('reporter_phone')
    const reporterEmail = sessionStorage.getItem('reporter_email')
    
    if (!incidentType || !turnstileToken || !reporterName || !reporterPhone) {
      alert('Bitte füllen Sie alle Schritte aus')
      router.push(`/incident/${params.qr_token}/step-01`)
      return
    }
    
    // Store incident details
    sessionStorage.setItem('incident_description', data.incidentDescription)
    sessionStorage.setItem('incident_date', data.incidentDate)
    
    // Navigate to submission (will be handled in step-04)
    router.push(`/incident/${params.qr_token}/step-04`)
  }
  
  return (
    <div className="flex min-h-screen flex-col p-4">
      <ProgressIndicator currentStep={3} totalSteps={4} />
      
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Vorfall beschreiben</h1>
            <p className="text-muted-foreground">Bitte beschreiben Sie den Vorfall im Detail</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="incidentDescription">Beschreibung *</Label>
              <Textarea
                id="incidentDescription"
                {...register('incidentDescription')}
                placeholder="Beschreiben Sie den Vorfall im Detail..."
                rows={6}
                disabled={isSubmitting}
                className="resize-none"
              />
              {errors.incidentDescription && (
                <p className="text-sm text-destructive">{errors.incidentDescription.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incidentDate">Datum und Uhrzeit *</Label>
              <Input
                id="incidentDate"
                type="datetime-local"
                {...register('incidentDate', {
                  setValueAs: (value: string) => {
                    // Convert datetime-local to ISO string
                    return new Date(value).toISOString()
                  }
                })}
                disabled={isSubmitting}
              />
              {errors.incidentDate && (
                <p className="text-sm text-destructive">{errors.incidentDate.message}</p>
              )}
            </div>
          </div>
          
          <HoneypotField value={honeypot} onChange={setHoneypot} />
          <input type="hidden" {...register('honeypot')} value={honeypot} />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Zurück
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : 'Weiter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

