# Crash Connect - Sitemap für Deep Linking

Diese Sitemap dokumentiert alle Routen der Crash Connect App für die Implementierung von Deep Linking in Web-Projekten.

## Routing-Struktur

### Root Layout (`/`)

- **Basis-URL**: `/`
- **Auth-Guard**: Dynamisch basierend auf Login-Status und Onboarding-Status

---

## 1. Authentication Routes (`/(auth)`)

**Zugriff**: Nur wenn **NICHT** eingeloggt (`!isLoggedIn`)

### 1.1 Welcome

- **Route**: `/welcome`
- **Path**: `/(auth)/welcome`
- **Beschreibung**: Willkommensseite
- **Deep Link**: `/welcome`

### 1.2 Sign-In Options

- **Route**: `/sign-in-options`
- **Path**: `/(auth)/sign-in-options`
- **Beschreibung**: Übersicht der Anmeldeoptionen
- **Deep Link**: `/sign-in-options`

### 1.3 Sign-In with Email/Password

- **Route**: `/sign-in-with-email-password`
- **Path**: `/(auth)/sign-in-with-email-password`
- **Beschreibung**: Anmeldung mit E-Mail und Passwort
- **Deep Link**: `/sign-in-with-email-password`

### 1.4 Magic Link

- **Route**: `/magic-link`
- **Path**: `/(auth)/magic-link`
- **Beschreibung**: Anmeldung per Magic Link
- **Deep Link**: `/magic-link`

### 1.5 Sign-Up Options

- **Route**: `/sign-up-options`
- **Path**: `/(auth)/sign-up-options`
- **Beschreibung**: Übersicht der Registrierungsoptionen
- **Deep Link**: `/sign-up-options`

### 1.6 Sign-Up

- **Route**: `/sign-up`
- **Path**: `/(auth)/sign-up`
- **Beschreibung**: Registrierung
- **Deep Link**: `/sign-up`

### 1.7 Confirm Email

- **Route**: `/confirm-email`
- **Path**: `/(auth)/confirm-email`
- **Beschreibung**: E-Mail-Bestätigung
- **Deep Link**: `/confirm-email`

### 1.8 Email Confirmed

- **Route**: `/email-confirmed`
- **Path**: `/(auth)/email-confirmed`
- **Beschreibung**: Bestätigungsseite nach E-Mail-Verifizierung
- **Deep Link**: `/email-confirmed`

### 1.9 Callback

- **Route**: `/callback`
- **Path**: `/(auth)/callback`
- **Beschreibung**: OAuth-Callback-Handler
- **Deep Link**: `/callback`
- **Query Parameter**: OAuth-spezifische Parameter (z.B. `code`, `state`)

---

## 2. Onboarding Routes (`/(onboarding)`)

**Zugriff**: Nur wenn Onboarding **NICHT** abgeschlossen (`!hasCompletedOnboarding`)

### 2.1 Step 01

- **Route**: `/onboarding/step-01`
- **Path**: `/(onboarding)/step-01`
- **Deep Link**: `/onboarding/step-01`

### 2.2 Step 02

- **Route**: `/onboarding/step-02`
- **Path**: `/(onboarding)/step-02`
- **Deep Link**: `/onboarding/step-02`

### 2.3 Step 03

- **Route**: `/onboarding/step-03`
- **Path**: `/(onboarding)/step-03`
- **Deep Link**: `/onboarding/step-03`

### 2.4 Step 04

- **Route**: `/onboarding/step-04`
- **Path**: `/(onboarding)/step-04`
- **Deep Link**: `/onboarding/step-04`

### 2.5 Step 05

- **Route**: `/onboarding/step-05`
- **Path**: `/(onboarding)/step-05`
- **Deep Link**: `/onboarding/step-05`

### 2.6 Step 06

- **Route**: `/onboarding/step-06`
- **Path**: `/(onboarding)/step-06`
- **Deep Link**: `/onboarding/step-06`

---

## 3. Main Tabs Routes (`/(tabs)`)

**Zugriff**: Nur wenn eingeloggt **UND** Onboarding abgeschlossen (`isLoggedIn && hasCompletedOnboarding`)

### 3.1 Dashboard/Home

- **Route**: `/`
- **Path**: `/(tabs)/index`
- **Beschreibung**: Haupt-Dashboard
- **Deep Link**: `/` oder `/home`
- **Tab**: Home (Icon: `house.fill`)

### 3.2 Vehicles List

- **Route**: `/vehicles`
- **Path**: `/(tabs)/vehicles/index`
- **Beschreibung**: Übersicht aller Fahrzeuge
- **Deep Link**: `/vehicles`
- **Tab**: Deine Fahrzeuge (Icon: `car.fill`)

### 3.3 Vehicle Details

- **Route**: `/vehicles/:id`
- **Path**: `/(tabs)/vehicles/[id]`
- **Beschreibung**: Detailansicht eines Fahrzeugs
- **Deep Link**: `/vehicles/{id}`
- **Parameter**:
  - `id` (string, required): Fahrzeug-ID
- **Beispiel**: `/vehicles/123e4567-e89b-12d3-a456-426614174000`

### 3.4 Incidents

- **Route**: `/incidents`
- **Path**: `/(tabs)/incidents`
- **Beschreibung**: Übersicht aller Vorfälle
- **Deep Link**: `/incidents`
- **Tab**: Vorfälle (Icon: `exclamationmark.triangle.fill`)

### 3.5 Library

- **Route**: `/library`
- **Path**: `/(tabs)/library`
- **Beschreibung**: Bibliothek/Dokumente
- **Deep Link**: `/library`
- **Tab**: Library (Icon: `books.vertical.fill`)

### 3.6 Account

- **Route**: `/account`
- **Path**: `/(tabs)/account/index`
- **Beschreibung**: Account-Übersicht
- **Deep Link**: `/account`
- **Tab**: Account (Icon: `person.crop.circle`)

#### 3.6.1 Account Details

- **Route**: `/account/details`
- **Path**: `/(tabs)/account/details`
- **Beschreibung**: Persönliche Details
- **Deep Link**: `/account/details`

#### 3.6.2 Account Settings

- **Route**: `/account/settings`
- **Path**: `/(tabs)/account/settings`
- **Beschreibung**: UI-Einstellungen
- **Deep Link**: `/account/settings`

#### 3.6.3 Account Security

- **Route**: `/account/security`
- **Path**: `/(tabs)/account/security`
- **Beschreibung**: Sicherheitseinstellungen
- **Deep Link**: `/account/security`

#### 3.6.4 Account Notifications

- **Route**: `/account/notifications`
- **Path**: `/(tabs)/account/notifications`
- **Beschreibung**: Benachrichtigungseinstellungen
- **Deep Link**: `/account/notifications`

---

## 4. Add New Vehicle Flow (`/(add-new-vehicle)`)

**Zugriff**: Immer wenn eingeloggt (kein spezieller Guard)

### 4.1 Step 01

- **Route**: `/add-new-vehicle/step-01`
- **Path**: `/(add-new-vehicle)/step-01`
- **Deep Link**: `/add-new-vehicle/step-01`

### 4.2 Step 02

- **Route**: `/add-new-vehicle/step-02`
- **Path**: `/(add-new-vehicle)/step-02`
- **Deep Link**: `/add-new-vehicle/step-02`

### 4.3 Step 03

- **Route**: `/add-new-vehicle/step-03`
- **Path**: `/(add-new-vehicle)/step-03`
- **Deep Link**: `/add-new-vehicle/step-03`

### 4.4 Step 04

- **Route**: `/add-new-vehicle/step-04`
- **Path**: `/(add-new-vehicle)/step-04`
- **Deep Link**: `/add-new-vehicle/step-04`

### 4.5 Step 05

- **Route**: `/add-new-vehicle/step-05`
- **Path**: `/(add-new-vehicle)/step-05`
- **Deep Link**: `/add-new-vehicle/step-05`

---

## 5. Incident Report Routes (`/incident`)

**Zugriff**: Öffentlich (kein spezieller Guard)

### 5.1 Incident Step 01

- **Route**: `/incident/step-01`
- **Path**: `/incident/step-01`
- **Beschreibung**: Erster Schritt des Vorfall-Reports
- **Deep Link**: `/incident/step-01`

### 5.2 Incident via QR Token

- **Route**: `/incident/:qr_token`
- **Path**: `/incident/[qr_token]`
- **Beschreibung**: Vorfall-Report über QR-Code-Token
- **Deep Link**: `/incident/{qr_token}`
- **Parameter**:
  - `qr_token` (string, required): QR-Code-Token für den Vorfall

#### 5.2.1 QR Token Index

- **Route**: `/incident/:qr_token`
- **Path**: `/incident/[qr_token]/index`
- **Deep Link**: `/incident/{qr_token}`

#### 5.2.2 QR Token Step 01

- **Route**: `/incident/:qr_token/step-01`
- **Path**: `/incident/[qr_token]/step-01`
- **Deep Link**: `/incident/{qr_token}/step-01`

#### 5.2.3 QR Token Step 02

- **Route**: `/incident/:qr_token/step-02`
- **Path**: `/incident/[qr_token]/step-02`
- **Deep Link**: `/incident/{qr_token}/step-02`

#### 5.2.4 QR Token Step 03

- **Route**: `/incident/:qr_token/step-03`
- **Path**: `/incident/[qr_token]/step-03`
- **Deep Link**: `/incident/{qr_token}/step-03`

#### 5.2.5 QR Token Step 04

- **Route**: `/incident/:qr_token/step-04`
- **Path**: `/incident/[qr_token]/step-04`
- **Deep Link**: `/incident/{qr_token}/step-04`

#### 5.2.6 QR Token Step 05

- **Route**: `/incident/:qr_token/step-05`
- **Path**: `/incident/[qr_token]/step-05`
- **Deep Link**: `/incident/{qr_token}/step-05`

#### 5.2.7 QR Token Success

- **Route**: `/incident/:qr_token/success`
- **Path**: `/incident/[qr_token]/success`
- **Beschreibung**: Erfolgsseite nach Vorfall-Report
- **Deep Link**: `/incident/{qr_token}/success`

---

## 6. Modal Routes

### 6.1 Modal

- **Route**: `/modal`
- **Path**: `/modal`
- **Beschreibung**: Modal-Dialog
- **Deep Link**: `/modal`

---

## 7. Error Routes

### 7.1 Not Found

- **Route**: `*` (Catch-all)
- **Path**: `/+not-found`
- **Beschreibung**: 404-Seite
- **Deep Link**: Alle nicht definierten Routen

---

## Deep Linking Konventionen

### URL-Struktur

- **Basis-Format**: `/{segment}/{subsegment}/{...}`
- **Parameter**: `/{segment}/:param` → `/segment/value`
- **Query Parameter**: `?key=value&key2=value2`

### Auth-Protected Routes

Routen, die Authentifizierung erfordern, sollten im Web-Projekt entsprechend geschützt werden:

- `/(tabs)/*` → Erfordert Login + abgeschlossenes Onboarding
- `/(auth)/*` → Nur wenn NICHT eingeloggt
- `/(onboarding)/*` → Nur wenn Onboarding nicht abgeschlossen

### Beispiel Deep Links

```
# Public Routes
/incident/abc123xyz
/incident/abc123xyz/step-01
/incident/abc123xyz/success

# Auth Routes (nur wenn nicht eingeloggt)
/welcome
/sign-in-options
/sign-in-with-email-password
/magic-link
/sign-up
/confirm-email
/email-confirmed
/callback?code=xxx&state=yyy

# Onboarding Routes (nur wenn nicht abgeschlossen)
/onboarding/step-01
/onboarding/step-02
...
/onboarding/step-06

# Protected Routes (nur wenn eingeloggt + Onboarding abgeschlossen)
/
/home
/vehicles
/vehicles/123e4567-e89b-12d3-a456-426614174000
/incidents
/library
/account
/account/details
/account/settings
/account/security
/account/notifications

# Add Vehicle Flow (nur wenn eingeloggt)
/add-new-vehicle/step-01
/add-new-vehicle/step-02
...
/add-new-vehicle/step-05
```

---

## Implementierungs-Hinweise für Web-Projekte

### 1. Router-Konfiguration

- Verwende einen Router, der Nested Routes unterstützt (z.B. Next.js App Router, React Router v6)
- Implementiere Route Guards für Auth-geschützte Bereiche
- Verwende Dynamic Segments für Parameter (`:id`, `:qr_token`)

### 2. Auth-Guards

```typescript
// Beispiel Guard-Logik
const requireAuth = (isLoggedIn: boolean, hasCompletedOnboarding: boolean) => {
  if (!isLoggedIn) return "/welcome";
  if (!hasCompletedOnboarding) return "/onboarding/step-01";
  return null; // Zugriff erlaubt
};
```

### 3. Route Matching

- Verwende exakte Pfad-Matches für Deep Links
- Unterstütze sowohl `/` als auch `/home` für das Dashboard
- Handle Query-Parameter für OAuth-Callbacks

### 4. Redirect-Logik

- Nach Login: Prüfe Onboarding-Status → Redirect entsprechend
- Nach Logout: Redirect zu `/welcome`
- Nach Onboarding-Abschluss: Redirect zu `/` (Dashboard)

---

## JSON-Export für Programmierung

Siehe `sitemap.json` für eine maschinenlesbare Version dieser Sitemap.
