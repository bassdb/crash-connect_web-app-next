# Incident Flow Setup Guide

Dieses Verzeichnis enthält die notwendigen SQL-Migrationen und Setup-Anweisungen für den öffentlichen Incident-Flow.

## Database Schema Migration

### 1. Spalten zur incidents Tabelle hinzufügen

Führen Sie die SQL-Migration aus:

```sql
-- Siehe: add-incident-columns.sql
```

Oder direkt in Supabase SQL Editor:

```sql
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS reporter_ip VARCHAR(45);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_date TIMESTAMPTZ;
```

### 2. Indizes erstellen (optional, aber empfohlen)

```sql
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_ip ON incidents(reporter_ip);
CREATE INDEX IF NOT EXISTS idx_incidents_verified_at ON incidents(verified_at);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON incidents(incident_date);
```

## Environment Variables

Fügen Sie folgende Variablen zu Ihrer `.env.local` hinzu:

```env
# Turnstile (Cloudflare)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Vercel KV (wird automatisch gesetzt nach Vercel KV Setup)
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

## Vercel Setup

1. **Vercel KV Database erstellen**:
   - Vercel Dashboard → Storage → Create Database → KV
   - Environment Variables werden automatisch hinzugefügt

2. **Cloudflare Turnstile Setup**:
   - https://dash.cloudflare.com → Turnstile → Add Site
   - Domain eingeben
   - Site Key und Secret Key kopieren
   - In Vercel Environment Variables hinzufügen

## Supabase Edge Function

Die Edge Function `send-verification-sms` muss erstellt und deployed werden. Siehe Plan-Dokumentation für Details.

## Testing

Nach dem Setup können Sie den Flow testen:

1. Test-Vehicle in DB erstellen:
```sql
INSERT INTO vehicles (id, license_plate, qr_token, owner_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'B-CC 1234',
  '550e8400-e29b-41d4-a716-446655440000',
  (SELECT id FROM auth.users LIMIT 1)
);
```

2. Flow testen:
```
http://localhost:3000/incident/550e8400-e29b-41d4-a716-446655440000
```

