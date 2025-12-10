# Deep Links - Verwendung im Code

Diese Dokumentation zeigt, wie du Deep Links in deiner Next.js-App verwendest.

## Inhaltsverzeichnis

1. [Deep Links erstellen](#deep-links-erstellen)
2. [React-Hooks verwenden](#react-hooks-verwenden)
3. [Teilen-Komponente](#teilen-komponente)
4. [E-Mail-Integration](#e-mail-integration)
5. [Best Practices](#best-practices)

## Deep Links erstellen

### Utility-Funktionen

```typescript
import { DeepLinks, createUniversalLink } from '@/lib/deep-links'

// Custom URL Scheme (crashconnect://)
const customDeepLink = DeepLinks.incident.view('incident-123')
// Ergebnis: crashconnect://incident/view?id=incident-123

// Universal Link (https://)
const universalLink = createUniversalLink(
  'crashconnect.de',
  '/incident/view',
  { id: 'incident-123' }
)
// Ergebnis: https://crashconnect.de/incident/view?id=incident-123
```

### Alle verfügbaren Deep Links

```typescript
// Incidents
DeepLinks.incident.create()
DeepLinks.incident.create('incident-id')
DeepLinks.incident.view('incident-id')
DeepLinks.incident.report()

// Authentication
DeepLinks.auth.signIn()
DeepLinks.auth.signIn('/dashboard') // Mit Redirect
DeepLinks.auth.signUp()
DeepLinks.auth.magicLink('token-123')
DeepLinks.auth.resetPassword('reset-token')

// Teams
DeepLinks.teams.view('team-id')
DeepLinks.teams.invite('invite-token')
DeepLinks.teams.create()

// Dashboard
DeepLinks.dashboard.home()
DeepLinks.dashboard.protected()

// Account
DeepLinks.account.profile()
DeepLinks.account.settings()
```

## React-Hooks verwenden

### useDeepLinks Hook

Verarbeitet Deep Links automatisch in Client-Komponenten:

```typescript
'use client'

import { useDeepLinks } from '@/hooks/use-deep-links'

export function MyComponent() {
  // Automatische Navigation bei Deep Links
  useDeepLinks()

  // Mit Custom-Handler
  useDeepLinks({
    onDeepLink: (path, params) => {
      console.log('Deep Link empfangen:', path, params)
      // Eigene Logik hier
    },
    autoNavigate: false, // Navigation manuell steuern
  })

  return <div>Meine Komponente</div>
}
```

### useShareDeepLink Hook

Zum Teilen von Links:

```typescript
'use client'

import { useShareDeepLink } from '@/hooks/use-deep-links'
import { createUniversalLink } from '@/lib/deep-links'

export function ShareButton() {
  const { canShare, shareLink } = useShareDeepLink()

  const handleShare = async () => {
    const link = createUniversalLink(
      window.location.host,
      '/incident/view',
      { id: '123' }
    )

    const result = await shareLink(
      link,
      'Incident anzeigen',
      'Schau dir diesen Incident an'
    )

    if (result.success) {
      console.log('Link geteilt!')
    }
  }

  return (
    <button onClick={handleShare}>
      {canShare ? 'Teilen' : 'Link kopieren'}
    </button>
  )
}
```

## Teilen-Komponente

Die vorgefertigte `DeepLinkShareButton` Komponente:

```typescript
import { DeepLinkShareButton } from '@/components/deep-link-share-button'

export function IncidentPage({ incidentId }: { incidentId: string }) {
  return (
    <div>
      <h1>Incident Details</h1>
      
      <DeepLinkShareButton
        path="/incident/view"
        params={{ id: incidentId }}
        title="Incident anzeigen"
        description="Schau dir diesen Incident in der App an"
      />
    </div>
  )
}
```

### Eigenschaften

| Prop | Typ | Beschreibung |
|------|-----|--------------|
| `path` | `string` | Der Pfad innerhalb der App |
| `params` | `Record<string, string>` | URL-Parameter (optional) |
| `title` | `string` | Titel für's Teilen (optional) |
| `description` | `string` | Beschreibung für's Teilen (optional) |

## E-Mail-Integration

### Magic Link E-Mails

```typescript
import { createUniversalLink } from '@/lib/deep-links'
import { sendEmail } from '@/lib/email-service'

export async function sendMagicLinkEmail(
  email: string,
  token: string
) {
  const magicLink = createUniversalLink(
    process.env.NEXT_PUBLIC_DOMAIN!,
    '/sign-in-magic-link',
    { token }
  )

  await sendEmail({
    to: email,
    subject: 'Dein Magic Link',
    html: `
      <h1>Anmeldung</h1>
      <p>Klicke auf den Link, um dich anzumelden:</p>
      <a href="${magicLink}">In der App anmelden</a>
      <p><small>Link läuft in 1 Stunde ab</small></p>
    `,
  })
}
```

### Team-Einladungen

```typescript
import { createUniversalLink } from '@/lib/deep-links'

export async function sendTeamInvitation(
  email: string,
  teamName: string,
  inviteToken: string
) {
  const inviteLink = createUniversalLink(
    process.env.NEXT_PUBLIC_DOMAIN!,
    '/teams/invite',
    { token: inviteToken }
  )

  await sendEmail({
    to: email,
    subject: `Einladung zu ${teamName}`,
    html: `
      <h1>Team-Einladung</h1>
      <p>Du wurdest eingeladen, dem Team "${teamName}" beizutreten.</p>
      <a href="${inviteLink}">Einladung annehmen</a>
    `,
  })
}
```

### Incident-Benachrichtigungen

```typescript
export async function sendIncidentNotification(
  email: string,
  incidentId: string,
  incidentTitle: string
) {
  const incidentLink = createUniversalLink(
    process.env.NEXT_PUBLIC_DOMAIN!,
    '/incident/view',
    { id: incidentId }
  )

  await sendEmail({
    to: email,
    subject: `Neuer Incident: ${incidentTitle}`,
    html: `
      <h1>Neuer Incident</h1>
      <p>${incidentTitle}</p>
      <a href="${incidentLink}">Incident anzeigen</a>
    `,
  })
}
```

## Best Practices

### 1. Verwende immer Universal Links für E-Mails

❌ **Falsch:**
```typescript
// Custom URL Schemes funktionieren nicht gut in E-Mails
const link = 'crashconnect://incident/view?id=123'
```

✅ **Richtig:**
```typescript
// Universal Links funktionieren überall
const link = createUniversalLink(
  'crashconnect.de',
  '/incident/view',
  { id: '123' }
)
```

### 2. Füge immer Fallbacks hinzu

```typescript
export function DeepLinkButton({ path }: { path: string }) {
  const handleClick = async () => {
    // Versuche native Share API
    if (navigator.share) {
      try {
        await navigator.share({ url: path })
        return
      } catch (err) {
        // Fehler oder Abbruch durch Benutzer
      }
    }

    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(path)
    toast({ title: 'Link kopiert!' })
  }

  return <button onClick={handleClick}>Teilen</button>
}
```

### 3. Validiere Deep Link-Parameter

```typescript
export function useIncidentDeepLink() {
  const searchParams = useSearchParams()
  
  const incidentId = searchParams.get('id')

  // Validierung
  if (incidentId && !isValidIncidentId(incidentId)) {
    throw new Error('Ungültige Incident-ID')
  }

  return { incidentId }
}
```

### 4. Behandle fehlgeschlagene Deep Links

```typescript
'use client'

import { useDeepLinks } from '@/hooks/use-deep-links'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function DeepLinkHandler() {
  const router = useRouter()

  useDeepLinks({
    onDeepLink: async (path, params) => {
      try {
        // Validiere Deep Link
        await validateDeepLink(path, params)
        
        // Navigiere
        router.push(path)
      } catch (error) {
        // Fehlerbehandlung
        toast({
          title: 'Fehler',
          description: 'Der Link ist ungültig oder abgelaufen',
          variant: 'destructive',
        })
        
        // Fallback zur Startseite
        router.push('/')
      }
    },
  })

  return null
}
```

### 5. Logging und Analytics

```typescript
import { createUniversalLink } from '@/lib/deep-links'
import { trackEvent } from '@/lib/analytics'

export function trackDeepLinkShare(
  linkType: string,
  destination: string
) {
  trackEvent('deep_link_shared', {
    type: linkType,
    destination,
    timestamp: new Date().toISOString(),
  })
}

// Verwendung
export function ShareIncidentButton({ incidentId }: { incidentId: string }) {
  const handleShare = async () => {
    const link = createUniversalLink(
      window.location.host,
      '/incident/view',
      { id: incidentId }
    )

    await navigator.share({ url: link })
    
    // Analytics tracken
    trackDeepLinkShare('incident', link)
  }

  return <button onClick={handleShare}>Teilen</button>
}
```

## Testing

### Test-Seite verwenden

Besuche `/deep-link-test` um:
- Deep Link-Konfiguration zu überprüfen
- Test-Links zu generieren
- Links auf verschiedenen Plattformen zu testen

### Programmatisch testen

```typescript
import { parseDeepLink, isDeepLink } from '@/lib/deep-links'

// Deep Link validieren
const url = 'crashconnect://incident/view?id=123'
console.log(isDeepLink(url)) // true

// Deep Link parsen
const parsed = parseDeepLink(url)
console.log(parsed)
// { path: '/incident/view', params: { id: '123' } }
```

## Weitere Ressourcen

- [Setup-Dokumentation](./deep-links-setup.md)
- [Test-Seite](/deep-link-test)
- [API-Dokumentation](/api/deep-link)



