# Deep Links Setup für iOS und Android

Diese Dokumentation erklärt, wie Deep Links in der Crash Connect App konfiguriert und verwendet werden.

## Übersicht

Deep Links ermöglichen es, die App über spezielle URLs zu öffnen. Wir unterstützen:

- **iOS Universal Links**: `https://deine-domain.de/incident/...`
- **Android App Links**: `https://deine-domain.de/incident/...`
- **Custom URL Scheme**: `crashconnect://incident/...`

## iOS Setup (Universal Links)

### 1. Apple App Site Association (AASA) Datei

Die AASA-Datei wird automatisch unter `/.well-known/apple-app-site-association` bereitgestellt.

**Wichtig**: Ersetze in `app/.well-known/apple-app-site-association/route.ts`:

```typescript
appID: 'TEAM_ID.com.crashconnect.app'
```

- **TEAM_ID**: Deine Apple Team ID (zu finden im Apple Developer Portal)
- **Bundle ID**: Die Bundle ID deiner iOS-App (z.B. `com.crashconnect.app`)

### 2. Xcode-Konfiguration

In deiner iOS-App:

1. Öffne dein Projekt in Xcode
2. Gehe zu **Signing & Capabilities**
3. Klicke auf **+ Capability** und wähle **Associated Domains**
4. Füge hinzu: `applinks:deine-domain.de`

### 3. iOS-Code

```swift
// AppDelegate.swift oder SceneDelegate.swift
func application(_ application: UIApplication, 
                continue userActivity: NSUserActivity,
                restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let url = userActivity.webpageURL else {
        return false
    }
    
    // Handle Deep Link
    handleDeepLink(url: url)
    return true
}
```

## Android Setup (App Links)

### 1. Digital Asset Links Datei

Die Asset Links-Datei wird automatisch unter `/.well-known/assetlinks.json` bereitgestellt.

**Wichtig**: Ersetze in `app/.well-known/assetlinks.json/route.ts`:

```typescript
package_name: 'com.crashconnect.app'
sha256_cert_fingerprints: ['DEIN_SHA256_FINGERPRINT']
```

### 2. SHA256 Fingerprint erhalten

```bash
# Debug Keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release Keystore
keytool -list -v -keystore /pfad/zu/deinem/keystore.jks
```

Kopiere den **SHA256** Fingerprint (Format: `AA:BB:CC:...`).

### 3. AndroidManifest.xml

```xml
<activity android:name=".MainActivity">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="deine-domain.de"
            android:pathPrefix="/incident" />
        <data
            android:scheme="https"
            android:host="deine-domain.de"
            android:pathPrefix="/auth" />
        <data
            android:scheme="https"
            android:host="deine-domain.de"
            android:pathPrefix="/teams" />
    </intent-filter>
    
    <!-- Custom URL Scheme -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data android:scheme="crashconnect" />
    </intent-filter>
</activity>
```

### 4. Android-Code (Kotlin)

```kotlin
// MainActivity.kt
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    handleIntent(intent)
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    intent?.let { handleIntent(it) }
}

private fun handleIntent(intent: Intent) {
    val action = intent.action
    val data = intent.data
    
    if (Intent.ACTION_VIEW == action && data != null) {
        // Handle Deep Link
        val path = data.path
        val params = data.queryParameterNames.associateWith { 
            data.getQueryParameter(it) 
        }
        
        // Navigate to appropriate screen
        navigateToScreen(path, params)
    }
}
```

## Verwendung im Code

### Deep Links erstellen

```typescript
import { DeepLinks, createUniversalLinks } from '@/lib/deep-links'

// Custom URL Scheme
const deepLink = DeepLinks.incident.view('incident-123')
// Ergebnis: crashconnect://incident/view?id=incident-123

// Universal Link
const universalLinks = createUniversalLinks('crashconnect.de')
const webLink = universalLinks.incident.view('incident-123')
// Ergebnis: https://crashconnect.de/incident/view?id=incident-123
```

### Deep Links in E-Mails oder Push-Benachrichtigungen

```typescript
// In deinem Email-Service
import { createUniversalLink } from '@/lib/deep-links'

const magicLinkUrl = createUniversalLink(
  'crashconnect.de',
  '/sign-in-magic-link',
  { token: 'abc123xyz' }
)

// In E-Mail-Template verwenden
const emailHtml = `
  <a href="${magicLinkUrl}">
    In der App anmelden
  </a>
`
```

## Testing

### 1. iOS Universal Links testen

```bash
# Auf iOS-Simulator/Gerät
xcrun simctl openurl booted "https://deine-domain.de/incident/test"
```

Oder öffne in Safari und tippe auf den Link.

### 2. Android App Links testen

```bash
# Via ADB
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://deine-domain.de/incident/test" \
  com.crashconnect.app
```

### 3. Web-Endpunkt testen

Besuche: `https://deine-domain.de/api/deep-link`

Das gibt dir Informationen über die konfigurierten Deep Links.

## Unterstützte Routen

Die App unterstützt Deep Links für folgende Bereiche:

- **Incidents**: `/incident/*`
- **Authentifizierung**: `/auth/*`, `/sign-in`, `/sign-up`
- **Teams**: `/teams/*`
- **Dashboard**: `/dashboard`, `/protected/*`
- **Account**: Konto-bezogene Routen

## Wichtige Hinweise

### Verifizierung

- **iOS**: Die AASA-Datei wird beim App-Install gecached. Bei Änderungen musst du die App neu installieren oder das Gerät neu starten.
- **Android**: Verwende `adb shell pm get-app-links com.crashconnect.app` um den Verifikationsstatus zu prüfen.

### HTTPS erforderlich

- Universal Links und App Links funktionieren nur über HTTPS
- Stelle sicher, dass deine Domain ein gültiges SSL-Zertifikat hat
- Die `.well-known` Dateien müssen ohne Authentifizierung erreichbar sein

### Cache-Control

Die Deep Link-Konfigurationsdateien haben einen Cache von 1 Stunde. Bei Änderungen kann es bis zu 1 Stunde dauern, bis die Updates wirksam werden.

### Fallback

Wenn die App nicht installiert ist, öffnet sich die normale Website. Du kannst dort einen App-Download-Banner anzeigen.

## Troubleshooting

### iOS Universal Links funktionieren nicht

1. Überprüfe die AASA-Datei: `https://deine-domain.de/.well-known/apple-app-site-association`
2. Validiere mit Apple's Tool: https://search.developer.apple.com/appsearch-validation-tool/
3. Stelle sicher, dass Associated Domains korrekt konfiguriert sind
4. App neu installieren

### Android App Links funktionieren nicht

1. Überprüfe die Asset Links: `https://deine-domain.de/.well-known/assetlinks.json`
2. Validiere den SHA256 Fingerprint
3. Prüfe mit: `adb shell dumpsys package d`
4. Stelle sicher, dass `android:autoVerify="true"` gesetzt ist

## Weitere Ressourcen

- [Apple Universal Links](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [Android App Links](https://developer.android.com/training/app-links)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)

