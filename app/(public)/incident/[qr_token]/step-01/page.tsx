'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
import { IncidentTypeChip } from '@/components/incident/incident-type-chip'
import { HoneypotField } from '@/components/incident/honeypot-field'
import { ProgressIndicator } from '@/components/incident/progress-indicator'
import { Button } from '@/components/ui/button'
import type { IncidentTypeOption } from '@/types/incident-types'

const INCIDENT_TYPES: IncidentTypeOption[] = [
  { value: 'damage', label: 'Beschädigung', icon: '🚗💥' },
  { value: 'theft', label: 'Diebstahl', icon: '🚨' },
  { value: 'accident', label: 'Unfall', icon: '⚠️' },
  { value: 'other', label: 'Sonstiges', icon: '📝' }
]

export default function IncidentTypeStep() {
  const router = useRouter()
  const params = useParams()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')
  
  const handleNext = () => {
    if (!selectedType || !turnstileToken) return
    
    // Store in sessionStorage for multi-step form
    sessionStorage.setItem('incident_type', selectedType)
    sessionStorage.setItem('turnstile_token', turnstileToken)
    
    router.push(`/incident/${params.qr_token}/step-02`)
  }
  
  return (
    <div className="flex min-h-screen flex-col p-4">
      <ProgressIndicator currentStep={1} totalSteps={4} />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Was ist passiert?</h1>
            <p className="text-muted-foreground">Wählen Sie die Art des Vorfalls</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {INCIDENT_TYPES.map((type) => (
              <IncidentTypeChip
                key={type.value}
                type={type}
                selected={selectedType === type.value}
                onSelect={() => setSelectedType(type.value)}
              />
            ))}
          </div>
          
          <HoneypotField value={honeypot} onChange={setHoneypot} />
          
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
            onSuccess={setTurnstileToken}
          />
          
          <Button 
            onClick={handleNext} 
            disabled={!selectedType || !turnstileToken}
            className="w-full"
          >
            Weiter
          </Button>
        </div>
      </div>
    </div>
  )
}

