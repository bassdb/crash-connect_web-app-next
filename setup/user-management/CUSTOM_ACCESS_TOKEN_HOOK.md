# Custom Access Token Hook

Diese Dokumentation erklärt die `custom_access_token_hook` Funktion und deren Konfiguration in Supabase.

## Was ist ein Custom Access Token Hook?

Ein Custom Access Token Hook ist eine PostgreSQL-Funktion, die von Supabase Auth automatisch aufgerufen wird, wenn ein JWT Access Token generiert wird. Sie ermöglicht es, zusätzliche Claims (Informationen) zum Token hinzuzufügen.

## Unsere Implementation

### Funktion: `custom_access_token_hook`

```sql
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  declare
    claims jsonb;
    user_role text;
    user_avatar_url text;
    user_full_name text;
    user_username text;
  begin
    -- Fetch the user role from user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

    -- Fetch profile data from profiles table
    select avatar_url, full_name, username 
    into user_avatar_url, user_full_name, user_username
    from public.profiles 
    where id = (event->>'user_id')::uuid;

    claims := event->'claims';

    -- Set user role claim (with fallback to 'consumer')
    if user_role is not null then
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', to_jsonb('consumer'));
    end if;

    -- Set profile claims (only if values exist)
    if user_avatar_url is not null then
      claims := jsonb_set(claims, '{avatar_url}', to_jsonb(user_avatar_url));
    end if;

    if user_full_name is not null then
      claims := jsonb_set(claims, '{full_name}', to_jsonb(user_full_name));
    end if;

    if user_username is not null then
      claims := jsonb_set(claims, '{username}', to_jsonb(user_username));
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified event
    return event;
  end;
$$;
```

### Was macht die Funktion?

1. **Empfängt Event**: Bekommt ein JSONB-Objekt mit Benutzerinformationen
2. **Lädt Benutzerrolle**: Sucht die Rolle des Benutzers in der `user_roles` Tabelle
3. **Lädt Profildaten**: Holt `avatar_url`, `full_name` und `username` aus der `profiles` Tabelle
4. **Fügt Claims hinzu**: Erweitert das JWT um folgende Claims:
   - `user_role` (mit Fallback zu 'consumer')
   - `avatar_url` (falls vorhanden)
   - `full_name` (falls vorhanden)
   - `username` (falls vorhanden)
5. **Gibt Event zurück**: Returniert das modifizierte Event-Objekt

## Konfiguration in Supabase

### Schritt 1: Dashboard öffnen
1. Gehe zu deinem Supabase-Projekt
2. Navigiere zu **Authentication** > **Hooks**

### Schritt 2: Hook konfigurieren
1. Unter **Custom Access Token Hook** findest du die Konfiguration
2. **Function Name**: `public.custom_access_token_hook`
3. **Secrets** (optional): Kann leer bleiben für unsere Implementation

### Schritt 3: Hook aktivieren
1. Aktiviere den Toggle für "Enable Custom Access Token Hook"
2. Speichere die Konfiguration

## Verwendung im Frontend

Nach der Konfiguration enthält jeder JWT Access Token automatisch die Benutzerrolle:

### JavaScript/TypeScript Beispiel

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Nach dem Login
const { data: { session } } = await supabase.auth.getSession()

if (session?.access_token) {
  // JWT dekodieren (nur für Demonstration - normalerweise automatisch)
  const payload = JSON.parse(atob(session.access_token.split('.')[1]))
  
  console.log('User Role:', payload.user_role) // z.B. 'admin', 'consumer', etc.
  console.log('Avatar URL:', payload.avatar_url) // Benutzer-Avatar
  console.log('Full Name:', payload.full_name) // Vollständiger Name
  console.log('Username:', payload.username) // Benutzername
}

// Oder direkt über Supabase
const { data: { user } } = await supabase.auth.getUser()
console.log('User Role:', user?.user_metadata?.user_role)
console.log('Profile Data:', {
  avatar_url: user?.user_metadata?.avatar_url,
  full_name: user?.user_metadata?.full_name,
  username: user?.user_metadata?.username
})
```

### React Hook Beispiel

```typescript
import { useUser } from '@supabase/auth-helpers-react'

function useUserProfile() {
  const user = useUser()
  
  // Alle Profildaten sind jetzt im JWT verfügbar
  const userRole = user?.user_metadata?.user_role || 'consumer'
  const avatarUrl = user?.user_metadata?.avatar_url
  const fullName = user?.user_metadata?.full_name
  const username = user?.user_metadata?.username
  
  return {
    role: userRole,
    avatarUrl,
    fullName,
    username
  }
}

// Verwendung in Komponente
function MyComponent() {
  const { role, avatarUrl, fullName, username } = useUserProfile()
  
  return (
    <div>
      <div className="user-info">
        {avatarUrl && <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />}
        <div>
          <p className="font-medium">{fullName || username || 'Unbekannter Benutzer'}</p>
          <p className="text-sm text-gray-500">Rolle: {role}</p>
        </div>
      </div>
      
      {role === 'admin' && <AdminPanel />}
      {role === 'consumer' && <ConsumerView />}
    </div>
  )
}
```

## Integration mit has_permission Funktion

Die `has_permission` Funktion nutzt automatisch die Rolle aus dem JWT:

```sql
-- In der has_permission Funktion
select (auth.jwt() ->> 'user_role')::public.app_role into user_role;
```

Dies ermöglicht effiziente Berechtigungsprüfungen ohne zusätzliche Datenbankabfragen.

## Debugging

### Hook-Status prüfen

```sql
-- Prüfe ob die Funktion existiert
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'custom_access_token_hook';

-- Teste die Funktion manuell
SELECT custom_access_token_hook('{"user_id": "USER_UUID_HERE", "claims": {}}');
```

### JWT-Inhalt prüfen

```javascript
// Im Browser-Entwicklertools
const token = 'YOUR_JWT_TOKEN_HERE'
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('JWT Payload:', payload)
```

## Troubleshooting

### Häufige Probleme

**Problem**: Hook wird nicht ausgeführt
**Lösung**: 
- Prüfe ob Hook in Dashboard aktiviert ist
- Stelle sicher, dass Funktion korrekt erstellt wurde
- Prüfe Logs in Supabase Dashboard

**Problem**: `user_role` Claim fehlt im JWT
**Lösung**:
- Prüfe ob Benutzer eine Rolle in `user_roles` hat
- Teste Funktion manuell mit SQL
- Prüfe Hook-Konfiguration

**Problem**: Berechtigungen funktionieren nicht
**Lösung**:
- Stelle sicher, dass `has_permission` Funktion die richtige Rolle aus JWT liest
- Prüfe `role_permissions` Tabelle auf korrekte Einträge

## Sicherheitshinweise

1. **SECURITY DEFINER**: Funktion läuft mit Ersteller-Rechten
2. **Minimale Logik**: Halte Hook-Funktionen einfach und schnell
3. **Fehlerbehandlung**: Immer Fallback-Werte verwenden
4. **Performance**: Hook wird bei jedem Token-Request ausgeführt

## Erweiterte Konfiguration

### Zusätzliche Claims hinzufügen

```sql
-- Beispiel: Team-Informationen hinzufügen
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  declare
    claims jsonb;
    user_role text;
    user_teams text[];
  begin
    -- Benutzerrolle laden
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;
    
    -- Teams laden (falls vorhanden)
    select array_agg(t.name) into user_teams 
    from team_members tm 
    join teams t on tm.team_id = t.id 
    where tm.user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    -- Claims setzen
    claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(user_role, 'consumer')));
    claims := jsonb_set(claims, '{user_teams}', to_jsonb(coalesce(user_teams, '{}'::text[])));

    event := jsonb_set(event, '{claims}', claims);

    return event;
  end;
$$;
```

Diese erweiterte Version fügt auch Team-Informationen zum JWT hinzu.
