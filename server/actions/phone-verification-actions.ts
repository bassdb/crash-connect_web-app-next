'use server'

import { actionClient } from '@/lib/safe-action'
import { phoneVerificationSchema, resendVerificationCodeSchema } from '@/types/incident-schema'
import { createSuperClient } from '@/server/supabase/superadmin'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { generateVerificationCode } from '@/lib/security'

export const verifyPhoneAction = actionClient
  .schema(phoneVerificationSchema)
  .action(async ({ parsedInput: { incidentId, verificationCode } }) => {
    // Rate Limiting (pro IP: 10 Versuche pro 5 Minuten)
    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    const rateLimit = await checkRateLimit(`verify:${clientIp}`, 10, 300)
    
    if (!rateLimit.success) {
      return { error: 'Zu viele Versuche. Bitte warten Sie.' }
    }
    
    const supabase = await createSuperClient()
    
    // Incident mit Code abrufen
    const { data: incident, error } = await supabase
      .from('incidents')
      .select('id, verification_code, verification_code_expires_at, status')
      .eq('id', incidentId)
      .single()
    
    if (error || !incident) {
      return { error: 'Meldung nicht gefunden' }
    }
    
    // Check: Bereits verifiziert?
    if (incident.status === 'submitted') {
      return { error: 'Diese Meldung wurde bereits verifiziert' }
    }
    
    // Check: Code abgelaufen?
    if (new Date(incident.verification_code_expires_at) < new Date()) {
      return { error: 'Verifizierungscode ist abgelaufen' }
    }
    
    // Check: Code korrekt?
    if (incident.verification_code !== verificationCode) {
      return { error: 'Ungültiger Verifizierungscode' }
    }
    
    // Status auf "submitted" setzen
    const { error: updateError } = await supabase
      .from('incidents')
      .update({ 
        status: 'submitted',
        verified_at: new Date().toISOString()
      })
      .eq('id', incidentId)
    
    if (updateError) {
      return { error: 'Fehler bei der Verifizierung' }
    }
    
    // TODO: Notification an Fahrzeugbesitzer senden
    
    return { 
      success: 'Verifizierung erfolgreich! Der Fahrzeugbesitzer wurde benachrichtigt.',
      incidentId 
    }
  })

// Resend SMS Code
export const resendVerificationCodeAction = actionClient
  .schema(resendVerificationCodeSchema)
  .action(async ({ parsedInput: { incidentId } }) => {
    // Rate Limiting für Resend
    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    const rateLimit = await checkRateLimit(`resend:${clientIp}`, 3, 600) // 3 pro 10 Min
    
    if (!rateLimit.success) {
      return { error: 'Zu viele Anfragen. Bitte warten Sie.' }
    }
    
    const supabase = await createSuperClient()
    
    const { data: incident, error } = await supabase
      .from('incidents')
      .select('id, reporter_phone, status')
      .eq('id', incidentId)
      .single()
    
    if (error || !incident || incident.status === 'submitted') {
      return { error: 'Meldung nicht gefunden oder bereits verifiziert' }
    }
    
    // Neuen Code generieren
    const newCode = generateVerificationCode()
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
    
    await supabase
      .from('incidents')
      .update({ 
        verification_code: newCode,
        verification_code_expires_at: newExpiresAt.toISOString()
      })
      .eq('id', incidentId)
    
    // SMS senden
    try {
      await supabase.functions.invoke('send-verification-sms', {
        body: { phone: incident.reporter_phone, code: newCode }
      })
    } catch (smsError) {
      console.error('SMS sending failed:', smsError)
      return { error: 'Fehler beim Senden der SMS' }
    }
    
    return { success: 'Neuer Code wurde gesendet' }
  })

