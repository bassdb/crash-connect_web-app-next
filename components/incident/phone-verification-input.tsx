'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface PhoneVerificationInputProps {
  onSubmit: (code: string) => void
  onResend: () => void
  isLoading?: boolean
  error?: string
}

export function PhoneVerificationInput({ 
  onSubmit, 
  onResend, 
  isLoading = false,
  error 
}: PhoneVerificationInputProps) {
  const [code, setCode] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6) {
      onSubmit(code)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="verification-code" className="text-sm font-medium">
          Verifizierungscode (6-stellig)
        </label>
        <Input
          id="verification-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={code}
          onChange={handleChange}
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl tracking-widest"
          disabled={isLoading}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={code.length !== 6 || isLoading}
        >
          {isLoading ? 'Wird verifiziert...' : 'Verifizieren'}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={onResend}
          disabled={isLoading}
        >
          Code erneut senden
        </Button>
      </div>
    </form>
  )
}

