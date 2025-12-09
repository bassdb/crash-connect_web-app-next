# User Profile Hooks

Diese Hooks ermöglichen den einfachen Zugriff auf Benutzerprofilinformationen, die über den Custom Access Token Hook in JWT-Tokens eingebettet wurden.

## Verfügbare Hooks

### `useUserProfile()`

Der Haupt-Hook zum Abrufen aller Benutzerprofilinformationen.

```typescript
import { useUserProfile } from '@/hooks/use-user-profile'

function MyComponent() {
  const { role, avatarUrl, fullName, username, isAuthenticated, userId } = useUserProfile()
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <img src={avatarUrl} alt="Avatar" />
          <h2>{fullName || username}</h2>
          <p>Rolle: {role}</p>
        </div>
      ) : (
        <p>Nicht angemeldet</p>
      )}
    </div>
  )
}
```

### `useUserRole(requiredRole)`

Prüft, ob der Benutzer eine bestimmte Rolle hat.

```typescript
import { useUserRole } from '@/hooks/use-user-profile'

function AdminPanel() {
  const isAdmin = useUserRole('admin')
  
  if (!isAdmin) {
    return <div>Zugriff verweigert</div>
  }
  
  return <div>Admin Panel Content</div>
}
```

### `useIsAdmin()`

Prüft, ob der Benutzer Admin-Rechte hat (admin, owner, oder superadmin).

```typescript
import { useIsAdmin } from '@/hooks/use-user-profile'

function NavigationMenu() {
  const isAdmin = useIsAdmin()
  
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      {isAdmin && <a href="/admin">Admin</a>}
    </nav>
  )
}
```

### `useUserDisplayName()`

Gibt den Anzeigenamen des Benutzers mit Fallback-Logik zurück.

```typescript
import { useUserDisplayName } from '@/hooks/use-user-profile'

function WelcomeMessage() {
  const displayName = useUserDisplayName()
  
  return <h1>Willkommen, {displayName}!</h1>
}
```

## Komponenten

### `UserProfileDisplay`

Vollständige Benutzerprofilanzeige mit Avatar, Name und Rolle.

```typescript
import { UserProfileDisplay } from '@/components/user/user-profile-display'

function ProfilePage() {
  return (
    <div>
      <h1>Mein Profil</h1>
      <UserProfileDisplay />
    </div>
  )
}
```

### `UserProfileCompact`

Kompakte Benutzeranzeige für Navigation/Header.

```typescript
import { UserProfileCompact } from '@/components/user/user-profile-display'

function Header() {
  return (
    <header>
      <nav>...</nav>
      <UserProfileCompact />
    </header>
  )
}
```

### `RoleGuard`

Bedingte Darstellung basierend auf Benutzerrollen.

```typescript
import { RoleGuard } from '@/components/user/user-profile-display'

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <RoleGuard allowedRoles={['admin', 'owner', 'superadmin']}>
        <AdminSection />
      </RoleGuard>
      
      <RoleGuard 
        allowedRoles={['creator']} 
        fallback={<div>Nur für Ersteller</div>}
      >
        <CreatorTools />
      </RoleGuard>
    </div>
  )
}
```

## TypeScript Interface

```typescript
interface UserProfile {
  role: string                // Benutzerrolle aus JWT
  avatarUrl?: string         // Avatar URL aus Profil
  fullName?: string          // Vollständiger Name
  username?: string          // Benutzername
  isAuthenticated: boolean   // Authentifizierungsstatus
  userId?: string           // Benutzer-ID
}
```

## Verfügbare Rollen

- `superadmin` - Vollzugriff auf alle Funktionen
- `owner` - Erweiterte Verwaltungsrechte
- `admin` - Standard-Administratorrechte
- `team_admin` - Team-spezifische Verwaltungsrechte
- `creator` - Ersteller von Inhalten
- `consumer` - Basis-Benutzerrechte (Standard)

## Voraussetzungen

1. **Custom Access Token Hook** muss in Supabase konfiguriert sein
2. **Supabase Auth Helpers** müssen installiert sein:
   ```bash
   npm install @supabase/auth-helpers-react
   ```
3. **Benutzer muss angemeldet sein**, damit die JWT-Claims verfügbar sind

## Fehlerbehandlung

Die Hooks handhaben automatisch:
- Nicht authentifizierte Benutzer (Fallback zu 'consumer' Rolle)
- Fehlende Profildaten (undefined/null Werte)
- Ungültige JWT-Tokens

## Performance

- Alle Hooks verwenden `useMemo` für optimale Performance
- Daten werden direkt aus dem JWT gelesen (keine zusätzlichen API-Calls)
- Automatische Re-Renders bei Authentifizierungsänderungen
