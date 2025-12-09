# Deep Links - Übersicht

Deep Links ermöglichen es, dass deine App über URLs geöffnet werden kann - sowohl aus dem Web als auch aus nativen iOS/Android-Apps.

## 🚀 Quick Start

### 1. Konfiguration anpassen

Ersetze in den folgenden Dateien die Platzhalter mit deinen echten Werten:

#### iOS (`.well-known/apple-app-site-association/route.ts`)
```typescript
appID: 'DEINE_TEAM_ID.com.crashconnect.app'
```

#### Android (`.well-known/assetlinks.json/route.ts`)
```typescript
package_name: 'com.crashconnect.app',
sha256_cert_fingerprints: ['DEIN_SHA256_FINGERPRINT']
```

### 2. Domain eintragen

Setze deine Produktions-Domain als Environment-Variable:

```bash
NEXT_PUBLIC_DOMAIN=crashconnect.de
```

### 3. Native Apps konfigurieren

- **iOS**: Associated Domains in Xcode hinzufügen
- **Android**: Intent Filter in AndroidManifest.xml hinzufügen

Details siehe: [Setup-Dokumentation](./deep-links-setup.md)

## 📁 Dateien-Übersicht

### Konfiguration
| Datei | Zweck |
|-------|-------|
| `app/.well-known/apple-app-site-association/route.ts` | iOS Universal Links |
| `app/.well-known/assetlinks.json/route.ts` | Android App Links |
| `next.config.js` | Next.js Header-Konfiguration |
| `vercel.json` | Vercel-Routing für `.well-known` |

### Utilities & Hooks
| Datei | Zweck |
|-------|-------|
| `lib/deep-links.ts` | Utility-Funktionen für Deep Links |
| `hooks/use-deep-links.ts` | React-Hooks für Deep Links |

### Komponenten
| Datei | Zweck |
|-------|-------|
| `components/deep-link-share-button.tsx` | Teilen-Button mit Deep Link |
| `app/deep-link-test/page.tsx` | Test-Seite für Deep Links |

### API-Endpunkte
| Endpunkt | Zweck |
|----------|-------|
| `/.well-known/apple-app-site-association` | iOS Konfiguration |
| `/.well-known/assetlinks.json` | Android Konfiguration |
| `/api/deep-link` | Deep Link Informationen |
| `/api/deep-link/test` | Test-Endpunkt |

## 💡 Verwendung

### Deep Links erstellen

```typescript
import { DeepLinks } from '@/lib/deep-links'

// Incident anzeigen
const link = DeepLinks.incident.view('incident-123')

// Team-Einladung
const invite = DeepLinks.teams.invite('invite-token')

// Magic Link
const auth = DeepLinks.auth.magicLink('auth-token')
```

### In Komponenten verwenden

```typescript
'use client'

import { DeepLinkShareButton } from '@/components/deep-link-share-button'

export function MyComponent() {
  return (
    <DeepLinkShareButton
      path="/incident/view"
      params={{ id: '123' }}
      title="Incident anzeigen"
    />
  )
}
```

### In E-Mails verwenden

```typescript
import { createUniversalLink } from '@/lib/deep-links'

const link = createUniversalLink(
  'crashconnect.de',
  '/sign-in-magic-link',
  { token: 'abc123' }
)

// In E-Mail-Template verwenden
const html = `<a href="${link}">Anmelden</a>`
```

## 🧪 Testing

### Test-Seite
Besuche `/deep-link-test` in deinem Browser:
- Überprüfe Konfiguration
- Teste verschiedene Deep Links
- Validiere iOS/Android-Setup

### API-Tests
```bash
# Konfiguration anzeigen
curl https://deine-domain.de/api/deep-link

# iOS-Tests anzeigen
curl https://deine-domain.de/api/deep-link/test?platform=ios

# Android-Tests anzeigen
curl https://deine-domain.de/api/deep-link/test?platform=android
```

### Native App Tests

**iOS:**
```bash
xcrun simctl openurl booted "https://deine-domain.de/dashboard"
```

**Android:**
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://deine-domain.de/dashboard" \
  com.crashconnect.app
```

## 📖 Dokumentation

- **[Setup-Anleitung](./deep-links-setup.md)** - Detaillierte Konfiguration für iOS/Android
- **[Verwendungs-Guide](./deep-links-usage.md)** - Code-Beispiele und Best Practices

## 🎯 Unterstützte Routen

Die folgenden Routen sind für Deep Links konfiguriert:

- `/incident/*` - Alle Incident-Routen
- `/auth/*` - Authentifizierungs-Routen
- `/sign-in` - Anmeldung
- `/sign-up` - Registrierung
- `/sign-in-magic-link` - Magic Link Login
- `/dashboard` - Dashboard
- `/teams/*` - Team-Routen
- `/protected/*` - Geschützte Routen

## ⚙️ URL-Schemes

Die App unterstützt zwei Arten von Deep Links:

### Universal Links (empfohlen)
```
https://crashconnect.de/incident/view?id=123
```
- Funktioniert auf allen Plattformen
- Kein App-Install erforderlich (Web-Fallback)
- Besser für E-Mails und Social Media

### Custom URL Scheme
```
crashconnect://incident/view?id=123
```
- Nur mit installierter App
- Direktes Öffnen ohne Browser
- Gut für App-zu-App-Kommunikation

## 🔒 Sicherheit

- Deep Links verwenden HTTPS
- Parameter sollten validiert werden
- Sensible Daten sollten nicht in URLs übergeben werden
- Verwende Tokens mit Ablaufdatum

## 🚨 Troubleshooting

### iOS Universal Links funktionieren nicht
1. AASA-Datei prüfen: `curl https://deine-domain.de/.well-known/apple-app-site-association`
2. Team ID und Bundle ID korrekt?
3. Associated Domains in Xcode hinzugefügt?
4. App neu installieren

### Android App Links funktionieren nicht
1. Asset Links prüfen: `curl https://deine-domain.de/.well-known/assetlinks.json`
2. SHA256 Fingerprint korrekt?
3. `android:autoVerify="true"` gesetzt?
4. Mit `adb shell dumpsys package d` verifizieren

### Deep Links öffnen immer im Browser
- Stelle sicher, dass die App installiert ist
- Prüfe die Intent Filter / Associated Domains
- Teste mit direktem Link-Klick (nicht Copy & Paste)
- Versuche Gerät neu zu starten

## 📝 Nächste Schritte

1. ✅ Konfigurationsdateien anpassen
2. ✅ Native Apps konfigurieren
3. ✅ Auf echten Geräten testen
4. ✅ Deep Links in E-Mails integrieren
5. ✅ Analytics für Deep Links hinzufügen
6. ✅ In Produktions-Umgebung deployen

## 🔗 Hilfreiche Links

- [Apple Universal Links Docs](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [Android App Links Docs](https://developer.android.com/training/app-links)
- [Test-Seite](/deep-link-test)
- [API-Dokumentation](/api/deep-link)

