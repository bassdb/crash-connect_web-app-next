# User Management Setup Guide

Diese Anleitung führt dich durch die komplette Einrichtung des User-Management-Systems für ein neues Supabase-Projekt.

## Voraussetzungen

- Supabase-Projekt erstellt
- Supabase CLI installiert
- Datenbankzugriff konfiguriert

## Setup-Schritte

### 1. Projekt-Initialisierung

```bash
# Supabase CLI initialisieren
supabase init

# Mit deinem Projekt verbinden
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Migrations ausführen

Führe die Migrations in der richtigen Reihenfolge aus:

```bash
# 1. Enums erstellen
supabase db push --file setup/user-management/001_create_enums.sql

# 2. Profiles Tabelle
supabase db push --file setup/user-management/002_create_profiles_table.sql

# 3. User Roles Tabelle
supabase db push --file setup/user-management/003_create_user_roles_table.sql

# 4. Role Permissions Tabelle
supabase db push --file setup/user-management/004_create_role_permissions_table.sql

# 5. Funktionen erstellen
supabase db push --file setup/user-management/005_create_functions.sql

# 6. Trigger erstellen (MANUELL ERFORDERLICH)
# WICHTIG: Diese Trigger müssen manuell im Supabase Dashboard erstellt werden
# Siehe setup/user-management/006_alternative_webhook_setup.md für Details

# 7. Standard-Berechtigungen einfügen
supabase db push --file setup/user-management/007_insert_default_permissions.sql

# 8. Storage Bucket erstellen
supabase db push --file setup/user-management/008_create_storage_bucket.sql

# 9. Custom Access Token Hook erstellen
supabase db push --file setup/user-management/009_create_custom_access_token_hook.sql
```

### 3. Trigger manuell erstellen

**WICHTIG**: Die Trigger für automatische Profil-Erstellung müssen manuell erstellt werden:

1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu **Database** > **SQL Editor**  
3. Führe folgende SQL-Befehle aus:

```sql
-- Trigger to create profile and assign consumer role when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add trigger comment
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Creates profile entry and assigns consumer role when user signs up';
```

Siehe `006_alternative_webhook_setup.md` für alternative Lösungen.

### 4. Custom Access Token Hook konfigurieren

**WICHTIG**: Nach der Migration muss der Custom Access Token Hook in Supabase konfiguriert werden:

1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu **Authentication** > **Hooks**
3. Unter **Custom Access Token Hook** trage ein:
   ```
   postgres://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
4. Wähle die Funktion: `public.custom_access_token_hook`
5. Speichere die Konfiguration

Dies ermöglicht es, dass die Benutzerrolle automatisch zu JWT-Tokens hinzugefügt wird.

### 5. Ersten Superadmin erstellen

Nach der Migration musst du manuell einen ersten Superadmin erstellen:

```sql
-- 1. Benutzer über Supabase Auth registrieren (UI oder API)
-- 2. Superadmin-Rolle zuweisen
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_UUID_HERE', 'superadmin');
```

### 6. Konfiguration prüfen

Teste die Installation:

```sql
-- Prüfe ob Enums erstellt wurden
SELECT unnest(enum_range(NULL::app_role));
SELECT unnest(enum_range(NULL::app_permission));

-- Prüfe Tabellen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_roles', 'role_permissions');

-- Prüfe Funktionen
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_permission', 'handle_new_user', 'assign_consumer_role');

-- Prüfe Storage Bucket
SELECT * FROM storage.buckets WHERE id = 'user_assets';
```

## Frontend-Integration

### TypeScript-Typen generieren

```bash
# Typen für dein Frontend generieren
supabase gen types typescript --local > types/supabase.ts
```

### Beispiel-Implementierung

```typescript
// hooks/useUserRole.ts
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabase'

export function useUserRole() {
  const user = useUser()
  
  const checkPermission = async (permission: string) => {
    if (!user) return false
    
    const { data } = await supabase.rpc('has_permission', {
      requested_permission: permission
    })
    
    return data
  }
  
  return { checkPermission }
}
```

### RLS Policy Beispiele

```sql
-- Beispiel: Nur Admins können alle Profile sehen
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (has_permission('user_profiles.read'));

-- Beispiel: Benutzer können nur eigene Daten bearbeiten
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Wartung und Updates

### Neue Berechtigung hinzufügen

1. **Enum erweitern:**
```sql
ALTER TYPE app_permission ADD VALUE 'new_permission.action';
```

2. **Rollenzuweisungen aktualisieren:**
```sql
INSERT INTO role_permissions (role, permission) VALUES
  ('admin', 'new_permission.action'),
  ('superadmin', 'new_permission.action');
```

3. **RLS Policies erstellen:**
```sql
CREATE POLICY "Permission based access" ON your_table
  FOR SELECT USING (has_permission('new_permission.action'));
```

### Neue Rolle hinzufügen

1. **Enum erweitern:**
```sql
ALTER TYPE app_role ADD VALUE 'new_role';
```

2. **Berechtigungen zuweisen:**
```sql
INSERT INTO role_permissions (role, permission) VALUES
  ('new_role', 'categories.view'),
  ('new_role', 'design_template_types.view');
```

## Troubleshooting

### Häufige Probleme

**Problem**: `has_permission` Funktion gibt immer `false` zurück
**Lösung**: Prüfe ob JWT das `user_role` Claim enthält

**Problem**: RLS blockiert alle Zugriffe
**Lösung**: Prüfe ob Policies korrekt definiert sind und `authenticated` Role verwendet wird

**Problem**: Trigger funktionieren nicht
**Lösung**: Prüfe ob Funktionen mit `SECURITY DEFINER` erstellt wurden

### Debug-Queries

```sql
-- Aktuelle Benutzerrolle prüfen
SELECT auth.jwt() ->> 'user_role';

-- Benutzerrollen anzeigen
SELECT u.email, ur.role 
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id;

-- Rollenberechtigung prüfen
SELECT rp.role, rp.permission 
FROM role_permissions rp 
WHERE rp.role = 'admin';
```

## Sicherheitshinweise

1. **Superadmin-Zugang beschränken**: Nur wenige vertrauenswürdige Benutzer
2. **Regelmäßige Audits**: Rollenzuweisungen überprüfen
3. **Berechtigungen minimal halten**: Nur notwendige Berechtigungen vergeben
4. **Logging aktivieren**: Wichtige Aktionen protokollieren
5. **Backup-Strategie**: Regelmäßige Datensicherung

## Support

Bei Problemen oder Fragen:
1. Prüfe die Logs in Supabase Dashboard
2. Verwende die Debug-Queries oben
3. Konsultiere die Supabase-Dokumentation
4. Erstelle ein Issue im Projekt-Repository
