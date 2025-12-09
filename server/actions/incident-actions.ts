'use server'

import { actionClient } from '@/lib/safe-action'
import { completeIncidentSchema } from '@/types/incident-schema'
import { createSuperClient } from '@/server/supabase/superadmin'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { verifyTurnstile, checkHoneypot, generateVerificationCode } from '@/lib/security'

export const submitIncidentAction = actionClient
  .schema(completeIncidentSchema)
  .action(async ({ parsedInput: data }) => {
    // 1. Rate Limiting (IP-basiert)
    const headersList = await headers()
    const clientIp = getClientIp(headersList)
    const rateLimit = await checkRateLimit(clientIp, 5, 3600) // 5 pro Stunde
    
    if (!rateLimit.success) {
      return { 
        error: `Rate limit erreicht. Bitte warten Sie ${Math.ceil(rateLimit.reset / 60)} Minuten.` 
      }
    }
    
    // 2. Honeypot Check
    if (!checkHoneypot(data.honeypot)) {
      return { error: 'Bot erkannt' }
    }
    
    // 3. Turnstile Verification
    const isHuman = await verifyTurnstile(data.turnstileToken)
    if (!isHuman) {
      return { error: 'CAPTCHA-Verifizierung fehlgeschlagen' }
    }
    
    // 4. Token Verification (mit Super Client für Service Role)
    const supabaseSuper = await createSuperClient()
    const { data: vehicle, error: vehicleError } = await supabaseSuper
      .from('vehicles')
      .select('id, license_plate, owner_id')
      .eq('qr_token', data.qrToken)
      .single()
    
    if (vehicleError || !vehicle) {
      return { error: 'Ungültiger QR-Code' }
    }
    
    // 5. Create Incident (Draft Status)
    const verificationCode = generateVerificationCode()
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 Minuten
    
    const { data: incident, error: incidentError } = await supabaseSuper
      .from('incidents')
      .insert({
        vehicle_id: vehicle.id,
        qr_token: data.qrToken,
        incident_type: data.incidentType,
        reporter_name: data.reporterName,
        reporter_phone: data.reporterPhone,
        reporter_email: data.reporterEmail || null,
        incident_description: data.incidentDescription,
        incident_date: data.incidentDate,
        verification_code: verificationCode,
        verification_code_expires_at: codeExpiresAt.toISOString(),
        status: 'draft',
        reporter_ip: clientIp
      })
      .select()
      .single()
    
    if (incidentError || !incident) {
      return { error: 'Fehler beim Erstellen der Meldung' }
    }
    
    // 6. Send SMS via Edge Function
    try {
      await supabaseSuper.functions.invoke('send-verification-sms', {
        body: { 
          phone: data.reporterPhone, 
          code: verificationCode 
        }
      })
    } catch (smsError) {
      console.error('SMS sending failed:', smsError)
      // Incident wurde trotzdem erstellt, User kann später retry
    }
    
    return { 
      success: 'Verifizierungscode wurde an Ihre Telefonnummer gesendet',
      incidentId: incident.id 
    }
  })

