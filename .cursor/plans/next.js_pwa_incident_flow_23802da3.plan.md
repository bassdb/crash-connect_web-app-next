---
name: Next.js PWA Incident Flow
overview: Integration des öffentlichen Incident-Flows in das bestehende Next.js-Projekt mit Server-seitiger Sicherheit (Rate Limiting, CAPTCHA, Honeypot) und MVP-Features (ohne Kamera/GPS). Nutzt bestehende Supabase-Clients und UI-Komponenten.
todos:
  - id: install-dependencies
    content: '@vercel/kv und @marsidev/react-turnstile installieren'
    status: pending
  - id: environment-variables
    content: .env.local mit Turnstile und Vercel KV Environment Variables erweitern
    status: pending
  - id: database-schema
    content: incidents Table um reporter_ip, verified_at, incident_date erweitern
    status: pending
  - id: types-and-schemas
    content: types/incident-schema.ts und types/incident-types.ts erstellen
    status: pending
  - id: security-layer
    content: lib/rate-limiter.ts und lib/security.ts implementieren
    status: pending
  - id: server-actions
    content: server/actions/incident-actions.ts und phone-verification-actions.ts erstellen
    status: pending
  - id: ui-components
    content: components/incident/ UI Components implementieren
    status: pending
  - id: incident-pages
    content: app/(public)/incident/[qr_token]/ alle Pages und Steps erstellen
    status: pending
  - id: pwa-config
    content: public/manifest.json und PWA Icons erstellen
    status: pending
  - id: edge-function
    content: Supabase Edge Function send-verification-sms deployen
    status: pending
  - id: vercel-setup
    content: Vercel KV Database und Turnstile konfigurieren
    status: pending
  - id: testing
    content: E2E Testing durchführen (alle Steps, Rate Limiting, SMS)
    status: pending
---

# Next.js PWA Incident-Flow Integration

## Architektur-Übersicht

Integration des Incident-Flows in das bestehende Next.js-Projekt. Der Flow wird in die `(public)` Route-Gruppe integriert und nutzt die vorhandene Infrastruktur (Supabase SSR, next-safe-action, UI-Komponenten).

```
crash-connect_web-app-next/
├── app/
│   └── (public)/
│       └── incident/
│           └── [qr_token]/
│               ├── page.tsx              # Token Verification & Welcome
│               ├── step-01/
│               │   └── page.tsx          # Incident Type Selection
│               ├── step-02/
│               │   └── page.tsx          # Reporter Information
│               ├── step-03/
│               │   └── page.tsx          # Incident Details
│               ├── step-04/
│               │   └── page.tsx          # Phone Verification
│               └── success/
│                   └── page.tsx          # Success Screen
├── server/
│   └── actions/
│       ├── incident-actions.ts           # next-safe-action Server Actions
│       └── phone-verification-actions.ts
├── components/
│   └── incident/
│       ├── incident-type-chip.tsx
│       ├── phone-verification-input.tsx
│       ├── progress-indicator.tsx
│       └── honeypot-field.tsx
├── lib/
│   ├── rate-limiter.ts                   # Vercel KV Rate Limiting
│   ├── security.ts                       # Turnstile & Honeypot
│   └── incident-utils.ts                 # Helper Functions
├── types/
│   ├── incident-schema.ts                # Zod Schemas
│   └── incident-types.ts                 # TypeScript Types
└── public/
    ├── manifest.json                     # PWA Manifest
    └── icons/                            # PWA Icons
```

## 1. Setup & Dependencies

### 1.1 Zusätzliche Dependencies installieren

Das Projekt hat bereits alle Basis-Dependencies (`@supabase/ssr`, `next-safe-action`, `zod`, UI-Komponenten). Nur noch hinzufügen:

```bash
npm install @vercel/kv @marsidev/react-turnstile
```

### 1.2 Environment Variables erweitern (`.env.local`)

Bestehende Supabase-Variablen sind bereits vorhanden. Nur noch ergänzen:

```env
# Bereits vorhanden:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# Neu hinzufügen:
# Turnstile (Cloudflare)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Vercel KV (wird automatisch gesetzt nach Vercel KV Setup)
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

## 2. Security Layer

### 2.1 Rate Limiting (`lib/rate-limiter.ts`)

Neue Datei erstellen für IP-basiertes Rate Limiting mit Vercel KV:

```typescript
import { kv } from '@vercel/kv'

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function checkRateLimit(
  identifier: string, 
  limit: number, 
  windowInSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:incident:${identifier}`
  const count = await kv.incr(key)
  
  if (count === 1) {
    await kv.expire(key, windowInSeconds)
  }
  
  const ttl = await kv.ttl(key)
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: ttl
  }
}

// Helper für IP-Extraktion aus Headers
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
```

### 2.2 Turnstile Verification (`lib/security.ts`)

Neue Datei für Server-seitige Turnstile-Verifizierung und Honeypot:

```typescript
interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!token) return false
  
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token
        })
      }
    )
    
    const data: TurnstileResponse = await response.json()
    return data.success
  } catch (error) {
    console.error('Turnstile verification failed:', error)
    return false
  }
}

// Honeypot-Check (Feld sollte leer sein)
export function checkHoneypot(value: string | null | undefined): boolean {
  return !value || value.trim() === ''
}

// SMS-Verifizierungscode generieren
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
```

### 2.3 Zod Schemas (`types/incident-schema.ts`)

Neue Datei für Input-Validierung:

```typescript
import { z } from 'zod'

// Step 01 - Incident Type
export const incidentTypeSchema = z.object({
  qrToken: z.string().uuid(),
  incidentType: z.enum(['damage', 'theft', 'accident', 'other']),
  turnstileToken: z.string().min(1),
  honeypot: z.string().optional().refine((val) => !val, {
    message: 'Bot detected'
  })
})

// Step 02 - Reporter Info
export const reporterInfoSchema = z.object({
  qrToken: z.string().uuid(),
  reporterName: z.string().min(2).max(100),
  reporterPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  reporterEmail: z.string().email().optional(),
  honeypot: z.string().optional()
})

// Step 03 - Incident Details
export const incidentDetailsSchema = z.object({
  qrToken: z.string().uuid(),
  incidentDescription: z.string().min(10).max(2000),
  incidentDate: z.string().datetime(),
  honeypot: z.string().optional()
})

// Step 04 - Phone Verification
export const phoneVerificationSchema = z.object({
  incidentId: z.string().uuid(),
  verificationCode: z.string().length(6).regex(/^\d{6}$/)
})

// Complete Incident Submission
export const completeIncidentSchema = incidentTypeSchema
  .merge(reporterInfoSchema)
  .merge(incidentDetailsSchema)
```

## 3. Incident Flow Screens

### 3.1 Token Verification Page (`app/(public)/incident/[qr_token]/page.tsx`)

Server Component mit SSR Token-Verifizierung (nutzt bestehenden Supabase-Client):

```typescript
import { createClient } from '@/server/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default async function IncidentWelcomePage({ 
  params 
}: { 
  params: { qr_token: string } 
}) {
  const supabase = await createClient()
  
  // Server-seitige Token-Verifizierung
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('id, license_plate, qr_token, owner_id')
    .eq('qr_token', params.qr_token)
    .single()
  
  if (error || !vehicle) {
    notFound()
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Schaden melden</CardTitle>
          <CardDescription>
            KFZ mit Kennzeichen <strong>{vehicle.license_plate}</strong> beschädigt?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Helfen Sie dem Fahrzeugbesitzer, indem Sie einen Schadensbericht erstellen.
            Der Vorgang dauert ca. 3-5 Minuten.
          </p>
          <Button asChild className="w-full">
            <Link href={`/incident/${params.qr_token}/step-01`}>
              Meldung starten
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3.2 Step 01 - Incident Type (`app/(public)/incident/[qr_token]/step-01/page.tsx`)

Client Component mit Turnstile und Incident-Type-Chips:

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
import { IncidentTypeChip } from '@/components/incident/incident-type-chip'
import { HoneypotField } from '@/components/incident/honeypot-field'
import { ProgressIndicator } from '@/components/incident/progress-indicator'
import { Button } from '@/components/ui/button'

const INCIDENT_TYPES = [
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
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
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
```

### 3.3 Step 02 - Reporter Info (`step-02/page.tsx`)

React Hook Form mit Zod-Validierung (nutzt bestehende UI-Komponenten).

### 3.4 Step 03 - Incident Details (`step-03/page.tsx`)

Textarea für Beschreibung, Datum/Uhrzeit-Picker (MVP: keine Fotos/GPS).

### 3.5 Step 04 - Phone Verification (`step-04/page.tsx`)

SMS-Code-Input mit next-safe-action Server Action zur Verifizierung.

### 3.6 Success Page (`success/page.tsx`)

Bestätigung mit Incident-ID und nächsten Schritten.

## 4. Server Actions mit next-safe-action

### 4.1 Submit Incident (`server/actions/incident-actions.ts`)

Zentrale Server Action mit allen Security-Checks (nutzt bestehendes `actionClient` Pattern):

```typescript
'use server'

import { actionClient } from '@/lib/safe-action'
import { completeIncidentSchema } from '@/types/incident-schema'
import { createClient } from '@/server/supabase/server'
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
        verification_code_expires_at: codeExpiresAt,
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
```

### 4.2 Verify Phone (`server/actions/phone-verification-actions.ts`)

Server Action zur SMS-Code-Verifizierung und Status-Update auf `submitted`:

```typescript
'use server'

import { actionClient } from '@/lib/safe-action'
import { phoneVerificationSchema } from '@/types/incident-schema'
import { createSuperClient } from '@/server/supabase/superadmin'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

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
  .schema(phoneVerificationSchema.pick({ incidentId: true }))
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
        verification_code_expires_at: newExpiresAt 
      })
      .eq('id', incidentId)
    
    // SMS senden
    await supabase.functions.invoke('send-verification-sms', {
      body: { phone: incident.reporter_phone, code: newCode }
    })
    
    return { success: 'Neuer Code wurde gesendet' }
  })
```

## 5. Supabase Integration

### 5.1 Bestehende Supabase Clients nutzen

Das Projekt hat bereits alle benötigten Supabase-Clients:

**Server Components** (`server/supabase/server.ts`):
- Nutzt `@supabase/ssr` mit `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Cookie-basierte Session-Verwaltung
- Für authentifizierte Anfragen

**Browser Client** (`server/supabase/client.ts`):
- Nutzt `@supabase/ssr` mit `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Für Client Components

**Super Client** (`server/supabase/superadmin.ts`):
- Nutzt `@supabase/ssr` mit `SUPABASE_SERVICE_ROLE_KEY`
- Für Server Actions mit erhöhten Berechtigungen
- **Wichtig**: Nur in Server Actions verwenden, niemals in Client Components!

### 5.2 Incident Flow Supabase Usage

Für den Incident Flow verwenden:

1. **Token Verification Page** (Server Component):
   ```typescript
   import { createClient } from '@/server/supabase/server'
   const supabase = await createClient()
   ```

2. **Server Actions** (Submit & Verify):
   ```typescript
   import { createSuperClient } from '@/server/supabase/superadmin'
   const supabase = await createSuperClient()
   ```

3. **Client Components** (falls nötig):
   ```typescript
   import { createClient } from '@/server/supabase/client'
   const supabase = createClient()
   ```

**Security Note**: Der Incident Flow nutzt hauptsächlich den Super Client, da öffentliche Nutzer (Reporter) keine Supabase-Session haben und trotzdem Incidents erstellen dürfen.

## 6. PWA Configuration

### 6.1 Manifest (`public/manifest.json`)

Neue Datei erstellen oder bestehende ergänzen:

```json
{
  "name": "Crash Connect - Schadenmeldung",
  "short_name": "Crash Connect",
  "description": "Schnelle Schadenmeldung via QR-Code",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4a00ff",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 6.2 Incident Layout Metadata (`app/(public)/incident/layout.tsx`)

Spezifische Metadata für Incident-Flow:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schadenmeldung | Crash Connect',
  description: 'Schnelle Schadenmeldung via QR-Code',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  },
  themeColor: '#4a00ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Crash Connect'
  }
}

export default function IncidentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
```

### 6.3 Icons erstellen

PWA-Icons in verschiedenen Größen unter `public/icons/` bereitstellen. Tools wie [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) können verwendet werden:

```bash
npx pwa-asset-generator public/logo/start-it_logo.svg public/icons \
  --background "#ffffff" \
  --index public/manifest.json
```

## 7. Deployment Setup (Vercel)

### 7.1 Vercel KV Database erstellen

Das Projekt läuft bereits auf Vercel. Nur noch KV-Datenbank hinzufügen:

1. Vercel Dashboard öffnen → Projekt auswählen
2. **Storage** Tab → **Create Database**
3. **KV** auswählen → Namen eingeben (z.B. `crash-connect-rate-limit`)
4. Database erstellen → Environment Variables werden automatisch hinzugefügt:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
5. Neues Deployment triggern (oder `.env.local` lokal aktualisieren)

### 7.2 Cloudflare Turnstile Setup

1. **Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Turnstile** → **Add Site**
3. **Domain** eingeben: `crash-connect-web-app-next.vercel.app` (oder Custom Domain)
4. **Widget Mode**: Managed (empfohlen für MVP)
5. Site erstellen → **Site Key** und **Secret Key** kopieren
6. In Vercel: **Environment Variables** hinzufügen:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
   TURNSTILE_SECRET_KEY=0x4AAA...
   ```
7. Für lokale Entwicklung: `.env.local` ergänzen

**Test Keys** (für Entwicklung):
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### 7.3 Vercel Edge Config (optional)

Für dynamische Feature-Flags (z.B. Incident-Flow aktivieren/deaktivieren):

```typescript
// lib/edge-config.ts
import { get } from '@vercel/edge-config'

export async function isIncidentFlowEnabled(): Promise<boolean> {
  return await get('incident_flow_enabled') ?? true
}
```

### 7.4 Deployment Checklist

Vor dem ersten Deployment sicherstellen:

- [ ] Vercel KV Database erstellt und Environment Variables gesetzt
- [ ] Turnstile Site erstellt und Keys in Vercel hinterlegt
- [ ] Supabase Environment Variables vorhanden (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] PWA Icons generiert und unter `public/icons/` abgelegt
- [ ] `manifest.json` im `public/` Ordner
- [ ] Supabase Edge Function `send-verification-sms` deployed

**Deployment**:
```bash
git add .
git commit -m "feat: Add public incident flow with PWA support"
git push origin master
```

Vercel deployed automatisch bei Push zu `master`.

## 8. Supabase Edge Function

### 8.1 SMS Verification Edge Function

Falls noch nicht vorhanden, Edge Function erstellen:

**`supabase/functions/send-verification-sms/index.ts`**:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

serve(async (req) => {
  // Nur Service Role Key erlauben
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.includes('service_role')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { phone, code } = await req.json()

  if (!phone || !code) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Twilio API Call
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phone,
        From: TWILIO_PHONE_NUMBER!,
        Body: `Ihr Crash Connect Verifizierungscode: ${code}\n\nDieser Code ist 10 Minuten gültig.`
      })
    })

    if (!response.ok) {
      throw new Error('Twilio API error')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('SMS sending failed:', error)
    return new Response(JSON.stringify({ error: 'Failed to send SMS' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

**Deployment**:
```bash
supabase functions deploy send-verification-sms --no-verify-jwt
```

**Twilio Setup**:
1. Twilio Account erstellen: https://www.twilio.com
2. Phone Number kaufen
3. Secrets in Supabase setzen:
```bash
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=...
supabase secrets set TWILIO_PHONE_NUMBER=+491234567890
```

### 8.2 Security Note

Die Edge Function prüft den Service Role Key im Authorization Header. Server Actions rufen sie mit `createSuperClient()` auf, wodurch der Service Role Key automatisch mitgesendet wird.

## 9. Testing

### 9.1 Lokales Testing

```bash
# Next.js Dev Server starten
npm run dev
```

**Test-URLs**:
```
# Welcome Page (Token muss in DB existieren)
http://localhost:3000/incident/550e8400-e29b-41d4-a716-446655440000

# Direkt zu Step 01 (für UI-Testing)
http://localhost:3000/incident/550e8400-e29b-41d4-a716-446655440000/step-01
```

**Test-Vehicle in DB erstellen** (Supabase SQL Editor):
```sql
INSERT INTO vehicles (id, license_plate, qr_token, owner_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'B-CC 1234',
  '550e8400-e29b-41d4-a716-446655440000',
  (SELECT id FROM auth.users LIMIT 1) -- Bestehender User
);
```

### 9.2 Rate Limiting Testen

Lokal mit Vercel KV:

```bash
# 5 Submissions innerhalb 1 Stunde sollten durchgehen
# 6. Submission sollte Fehler zurückgeben: "Rate limit erreicht"

# KV testen (Terminal)
npx vercel kv get ratelimit:incident:127.0.0.1
```

### 9.3 Turnstile Testen

**Lokal** (Test Keys verwenden):
- Managed Mode: Automatisch bestanden
- Test Site Key: `1x00000000000000000000AA`

**Production** (echte Keys):
- Turnstile Widget wird angezeigt
- Nach Klick: Token wird generiert
- Server-seitige Verifizierung erfolgt

### 9.4 E2E Testing Checklist

- [ ] QR-Code-Scan öffnet Welcome Page
- [ ] Ungültiger Token zeigt 404
- [ ] Step 01: Incident Type Selection + Turnstile
- [ ] Step 02: Form Validation (Name, Phone, Email)
- [ ] Step 03: Description + Date Picker
- [ ] Step 04: SMS Code Eingabe
- [ ] Success Page: Incident-ID wird angezeigt
- [ ] Honeypot: Formular mit gefülltem Honeypot-Feld wird abgelehnt
- [ ] Rate Limiting: 6. Anfrage von gleicher IP wird geblockt
- [ ] SMS: Verifizierungscode wird empfangen
- [ ] Code Verification: Falscher Code wird abgelehnt
- [ ] Code Expiry: Abgelaufener Code wird abgelehnt

## 10. Database Schema

### 10.1 Incidents Table (ergänzen falls nötig)

```sql
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS reporter_ip VARCHAR(45);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_date TIMESTAMPTZ;
```

### 10.2 RLS Policies

Sicherstellen, dass öffentliche INSERT-Policies existieren:

```sql
-- Incident INSERT für öffentliche Reporter (via Service Role in Server Action)
-- Keine RLS Policy nötig, da Server Actions mit Service Role Key arbeiten
-- Service Role bypassed RLS automatisch
```

## 11. UI Components

### 11.1 Incident Type Chip (`components/incident/incident-type-chip.tsx`)

```typescript
import { cn } from '@/lib/utils'

interface IncidentTypeChipProps {
  type: {
    value: string
    label: string
    icon: string
  }
  selected: boolean
  onSelect: () => void
}

export function IncidentTypeChip({ type, selected, onSelect }: IncidentTypeChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-6 transition-all',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50'
      )}
    >
      <span className="text-4xl">{type.icon}</span>
      <span className="text-sm font-medium">{type.label}</span>
    </button>
  )
}
```

### 11.2 Honeypot Field (`components/incident/honeypot-field.tsx`)

```typescript
interface HoneypotFieldProps {
  value: string
  onChange: (value: string) => void
}

export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <input
      type="text"
      name="website"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      tabIndex={-1}
      className="absolute left-[-9999px] opacity-0"
      aria-hidden="true"
    />
  )
}
```

### 11.3 Progress Indicator (`components/incident/progress-indicator.tsx`)

```typescript
interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1
          const isActive = step === currentStep
          const isCompleted = step < currentStep
          
          return (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/20 text-primary',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    'h-1 w-12 mx-2',
                    isCompleted ? 'bg-primary/20' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

## 12. Integration mit bestehendem Projekt

### 12.1 Keine Breaking Changes

Der Incident Flow ist vollständig isoliert in der `(public)` Route-Gruppe:

- ✅ Keine Änderungen an bestehenden Routes
- ✅ Keine Änderungen an Auth-Flow
- ✅ Keine Änderungen an Admin-Dashboard
- ✅ Nutzt bestehende Supabase-Clients
- ✅ Nutzt bestehende UI-Komponenten
- ✅ Nutzt bestehendes next-safe-action Pattern

### 12.2 Shared Resources

Beide Teile der App (Authenticated & Public Incident Flow) nutzen:

- Gleiche Supabase-Datenbank
- Gleiche `vehicles` und `incidents` Tabellen
- Gleiche Styling-Konventionen (Tailwind + Shadcn)
- Gleiche TypeScript-Konfiguration

### 12.3 Parallel Development

Das Expo React Native Projekt arbeitet parallel und unabhängig:

- Mobile App: Für Vehicle Owners & Admins (authentifiziert)
- Next.js PWA: Für Incident Reporters (öffentlich, unauthentifiziert)

## 13. Nächste Schritte (Post-MVP)

Nach erfolgreichem MVP-Launch können folgende Features ergänzt werden:

### Phase 2 - Rich Media
- 📸 Kamera-Upload (Web APIs + Image Compression via `browser-image-compression`)
- 📍 GPS Location Picker (Geolocation API + Leaflet/Mapbox GL)
- 🎤 Voice Notes (Web Audio API + Speech-to-Text)

### Phase 3 - Offline & Performance
- 📴 Service Worker für Offline-Support
- 🔄 Background Sync für Draft-Speicherung
- 💾 IndexedDB für lokale Datenpersistenz

### Phase 4 - Notifications
- 🔔 Push Notifications (Web Push API)
- 📧 Email-Updates an Reporter
- 💬 In-App Chat zwischen Reporter und Owner

### Phase 5 - Analytics & Monitoring
- 📊 Incident Analytics Dashboard
- 🐛 Error Tracking (Sentry)
- 📈 Performance Monitoring (Vercel Analytics)

## 14. Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐           ┌──────────────┐              │
│  │   (auth)     │           │   (public)   │              │
│  │  Route Group │           │  Route Group │              │
│  └──────────────┘           └──────────────┘              │
│                                    │                        │
│                            ┌───────▼────────┐             │
│                            │ /incident/     │             │
│                            │  [qr_token]    │             │
│                            └───────┬────────┘             │
│                                    │                        │
│                    ┌───────────────┼───────────────┐      │
│                    │               │               │        │
│              ┌─────▼─────┐   ┌────▼────┐   ┌──────▼──────┐│
│              │  Step 01  │   │ Step 02 │   │   Step 03   ││
│              │  (Type)   │   │ (Info)  │   │  (Details)  ││
│              └───────────┘   └─────────┘   └─────────────┘│
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │         Server Actions (next-safe-action)            │ │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │ │
│  │  │ Rate Limit │  │  Turnstile  │  │   Honeypot   │  │ │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Service Role Key
                        │
         ┌──────────────▼──────────────┐
         │      Supabase Backend       │
         ├─────────────────────────────┤
         │  ┌─────────┐  ┌──────────┐ │
         │  │Vehicles │  │Incidents │ │
         │  └─────────┘  └──────────┘ │
         │                             │
         │  ┌──────────────────────┐  │
         │  │   Edge Functions     │  │
         │  │ send-verification-   │  │
         │  │        sms           │  │
         │  └──────────────────────┘  │
         └─────────────┬───────────────┘
                       │
                       │
              ┌────────▼─────────┐
              │   Twilio SMS     │
              │   (Verification) │
              └──────────────────┘
```