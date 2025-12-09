---
name: Next.js PWA Incident Flow
overview: Separates Next.js PWA-Projekt für den öffentlichen Incident-Flow mit Server-seitiger Sicherheit (Rate Limiting, CAPTCHA, Honeypot) und MVP-Features (ohne Kamera/GPS). Deployment auf Vercel mit Edge Functions.
todos:
  - id: nextjs-setup
    content: Next.js Projekt erstellen, Dependencies installieren, Environment Variables konfigurieren
    status: pending
  - id: security-layer
    content: Rate Limiting (Vercel KV), Turnstile Integration, Honeypot & Zod Validation implementieren
    status: pending
  - id: supabase-clients
    content: Server und Browser Supabase Clients erstellen mit entsprechenden Keys
    status: pending
  - id: incident-screens
    content: Incident Flow Screens (Welcome, Step 01-04, Success) mit Server Components implementieren
    status: pending
  - id: server-actions
    content: Server Actions für Incident Submission und Phone Verification mit allen Security Checks
    status: pending
  - id: ui-components
    content: Shared UI Components (IncidentTypeChip, PhoneVerification, ProgressIndicator) erstellen
    status: pending
  - id: pwa-config
    content: PWA Manifest und Metadata konfigurieren
    status: pending
  - id: vercel-deployment
    content: Vercel Projekt einrichten, KV Database erstellen, Turnstile konfigurieren und deployen
    status: pending
---

# Next.js PWA für Incident-Flow

## Architektur-Übersicht

Separates Next.js-Projekt (`crash-connect-web`) neben dem bestehenden Expo-Projekt. Die PWA kommuniziert direkt mit Supabase und nutzt Next.js Server Actions für sichere Token-Verifizierung und Incident-Submission.

```
crash-connect-web/
├── app/
│   ├── incident/[qr_token]/
│   │   ├── page.tsx              # Server Component (SSR)
│   │   ├── step-01/page.tsx      # Incident Type
│   │   ├── step-02/page.tsx      # Reporter Info
│   │   ├── step-03/page.tsx      # Incident Details
│   │   ├── step-04/page.tsx      # Phone Verification
│   │   ├── success/page.tsx      # Success Screen
│   │   └── actions.ts            # Server Actions
│   └── api/rate-limit/route.ts   # Rate Limiting Check
├── components/
│   ├── incident/
│   │   ├── incident-type-chip.tsx
│   │   ├── phone-verification.tsx
│   │   └── progress-indicator.tsx
│   └── ui/
├── lib/
│   ├── supabase-server.ts        # Server-only Client (Service Role)
│   ├── supabase-client.ts        # Browser Client (Anon Key)
│   ├── rate-limiter.ts           # Vercel KV Rate Limiting
│   └── security.ts               # Token Validation & Honeypot
└── public/manifest.json          # PWA Manifest
```

## 1. Projekt-Setup

### 1.1 Next.js Projekt erstellen

```bash
npx create-next-app@latest crash-connect-web \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

### 1.2 Dependencies installieren

```bash
npm install @supabase/supabase-js @vercel/kv zod
npm install @marsidev/react-turnstile  # Cloudflare Turnstile
npm install clsx tailwind-merge        # cn() utility
```

### 1.3 Environment Variables (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Turnstile (Cloudflare)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Vercel KV (wird automatisch gesetzt nach Vercel KV Setup)
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

## 2. Security Layer

### 2.1 Rate Limiting (`lib/rate-limiter.ts`)

Vercel KV nutzen für IP-basiertes Rate Limiting:

```typescript
import { kv } from '@vercel/kv'

export async function checkRateLimit(identifier: string, limit: number, window: string) {
  const key = `ratelimit:${identifier}`
  const count = await kv.incr(key)
  
  if (count === 1) {
    await kv.expire(key, parseWindow(window))
  }
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: await kv.ttl(key)
  }
}
```

### 2.2 Turnstile Verification (`lib/security.ts`)

Server-seitige Turnstile-Token-Verifizierung:

```typescript
export async function verifyTurnstile(token: string) {
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
  
  const data = await response.json()
  return data.success
}
```

### 2.3 Honeypot & Input Validation

Zod-Schema mit Honeypot-Check in `app/incident/[qr_token]/actions.ts`.

## 3. Incident Flow Screens

### 3.1 Token Verification Page (`app/incident/[qr_token]/page.tsx`)

Server Component für SSR:

```typescript
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function IncidentWelcomePage({ 
  params 
}: { 
  params: { qr_token: string } 
}) {
  const supabase = createClient()
  
  // Server-seitige Token-Verifizierung
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('id, license_plate, qr_token')
    .eq('qr_token', params.qr_token)
    .single()
  
  if (error || !vehicle) {
    return <InvalidTokenPage />
  }
  
  return (
    <div>
      <h1>KFZ mit Kennzeichen {vehicle.license_plate} beschädigt?</h1>
      <Link href={`/incident/${params.qr_token}/step-01`}>
        Meldung starten
      </Link>
    </div>
  )
}
```

### 3.2 Step 01 - Incident Type (`step-01/page.tsx`)

Client Component mit Turnstile und Incident-Type-Auswahl.

### 3.3 Step 02 - Reporter Info (`step-02/page.tsx`)

Formular mit Name, Phone, Email + Honeypot-Feld.

### 3.4 Step 03 - Incident Details (`step-03/page.tsx`)

Textarea für Beschreibung, Datum/Uhrzeit-Picker (MVP: keine Fotos/GPS).

### 3.5 Step 04 - Phone Verification (`step-04/page.tsx`)

SMS-Code-Input (6-stellig), Server Action zur Verifizierung.

### 3.6 Success Page (`success/page.tsx`)

Bestätigung mit Incident-ID und nächsten Schritten.

## 4. Server Actions

### 4.1 Submit Incident (`app/incident/[qr_token]/actions.ts`)

Zentrale Server Action mit allen Security-Checks:

```typescript
'use server'

export async function submitIncident(formData: FormData) {
  // 1. Rate Limiting (IP)
  const ip = headers().get('x-forwarded-for') || 'unknown'
  const rateLimit = await checkRateLimit(ip, 5, '1h')
  if (!rateLimit.success) return { error: 'Rate limit exceeded' }
  
  // 2. Honeypot Check
  if (formData.get('website')) return { error: 'Bot detected' }
  
  // 3. Turnstile Verification
  const turnstileToken = formData.get('cf-turnstile-response')
  const isHuman = await verifyTurnstile(turnstileToken)
  if (!isHuman) return { error: 'CAPTCHA verification failed' }
  
  // 4. Input Validation (Zod)
  const validation = incidentSchema.safeParse(Object.fromEntries(formData))
  if (!validation.success) return { error: 'Invalid input' }
  
  // 5. Token Verification
  const supabase = createServerClient() // Service Role
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('qr_token', validation.data.qrToken)
    .single()
  
  if (!vehicle) return { error: 'Invalid token' }
  
  // 6. Create Incident
  const verificationCode = generateCode()
  const { data: incident } = await supabase
    .from('incidents')
    .insert({
      vehicle_id: vehicle.id,
      qr_token: validation.data.qrToken,
      incident_type: validation.data.incidentType,
      reporter_name: validation.data.reporterName,
      reporter_phone: validation.data.reporterPhone,
      reporter_email: validation.data.reporterEmail,
      incident_description: validation.data.incidentDescription,
      verification_code: verificationCode,
      verification_code_expires_at: new Date(Date.now() + 10 * 60 * 1000),
      status: 'draft'
    })
    .select()
    .single()
  
  // 7. Send SMS (via Supabase Edge Function)
  await supabase.functions.invoke('send-verification-sms', {
    body: { phone: validation.data.reporterPhone, code: verificationCode }
  })
  
  return { success: true, incidentId: incident.id }
}
```

### 4.2 Verify Phone (`verifyPhone` action)

Server Action zur SMS-Code-Verifizierung und Status-Update auf `submitted`.

## 5. Supabase Integration

### 5.1 Server Client (`lib/supabase-server.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service Role für Server
    { auth: { persistSession: false } }
  )
}
```

### 5.2 Browser Client (`lib/supabase-client.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Anon Key für Browser
)
```

## 6. PWA Configuration

### 6.1 Manifest (`public/manifest.json`)

```json
{
  "name": "Crash Connect - Schadenmeldung",
  "short_name": "Crash Connect",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4a00ff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 6.2 Metadata (`app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  title: 'Crash Connect - Schadenmeldung',
  description: 'Schnelle Schadenmeldung via QR-Code',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4a00ff'
}
```

## 7. Deployment Setup

### 7.1 Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

### 7.2 Vercel KV Database erstellen

In Vercel Dashboard:

1. Storage → Create Database → KV
2. Environment Variables werden automatisch zu Projekt hinzugefügt

### 7.3 Cloudflare Turnstile Setup

1. https://dash.cloudflare.com → Turnstile
2. Site erstellen → Domain eintragen
3. Site Key und Secret Key in `.env.local` eintragen

### 7.4 Deployment

```bash
# Vercel CLI installieren
npm i -g vercel

# Projekt verbinden und deployen
vercel --prod
```

## 8. Supabase Edge Function

SMS-Versand Edge Function bereits vorhanden, aber sicherstellen dass sie von Next.js Server Actions aufgerufen werden kann.

Ggf. CORS-Header setzen oder Service Role Key nutzen (dann kein CORS nötig).

## 9. Testing

### 9.1 Lokales Testing

```bash
# Next.js Dev Server
npm run dev

# Test URL
http://localhost:3000/incident/550e8400-e29b-41d4-a716-446655440000
```

### 9.2 Rate Limiting Testen

```bash
# 5 Anfragen innerhalb 1 Stunde sollten durchgehen
# 6. Anfrage sollte 429 zurückgeben
```

### 9.3 Turnstile Testen

Lokal: Managed Mode (automatisch bestanden) oder Test Site Key verwenden.

## Wichtige Dateien im bestehenden Projekt

Keine Änderungen am bestehenden Expo-Projekt nötig. Die React Native App und Next.js PWA arbeiten parallel und unabhängig voneinander.

Beide nutzen:

- Gleiche Supabase-Datenbank
- Gleiche `vehicles` und `incidents` Tabellen
- Gleiche RLS Policies (bereits für public INSERT konfiguriert)

## Nächste Schritte (außerhalb MVP)

Nach MVP-Launch können folgende Features ergänzt werden:

- Kamera-Upload (via Web APIs + Image Compression)
- GPS Location Picker (Geolocation API + Leaflet/Mapbox)
- Service Worker für Offline-Support
- Background Sync für Draft-Speicherung
- Push Notifications (via Web Push API)