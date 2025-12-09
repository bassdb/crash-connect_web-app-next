# User Management Setup

Dieses Verzeichnis enthält alle notwendigen Migrations- und Setup-Dateien für das Benutzer-Management-System mit rollenbasierter Zugriffskontrolle (RBAC).

## Übersicht

Das User-Management-System besteht aus folgenden Komponenten:

- **Enums**: Anwendungsrollen und Berechtigungen
- **Tabellen**: Profile, Benutzerrollen und Rollenberechtigung
- **Funktionen**: Berechtigungsprüfung und Benutzer-Management
- **Trigger**: Automatische Profil- und Rollenerstellung
- **Storage**: Bucket für Benutzer-Assets

## Migrations-Reihenfolge

Die Migrations müssen in folgender Reihenfolge ausgeführt werden:

1. `001_create_enums.sql` - Erstellt app_role und app_permission Enums
2. `002_create_profiles_table.sql` - Erstellt die profiles Tabelle
3. `003_create_user_roles_table.sql` - Erstellt die user_roles Tabelle
4. `004_create_role_permissions_table.sql` - Erstellt die role_permissions Tabelle
5. `005_create_functions.sql` - Erstellt alle notwendigen Funktionen
6. `006_create_triggers.sql` - Erstellt Trigger für automatische Aktionen
7. `007_insert_default_permissions.sql` - Fügt Standard-Berechtigungen ein
8. `008_create_storage_bucket.sql` - Erstellt user_assets Storage Bucket
9. `009_create_custom_access_token_hook.sql` - Erstellt Custom Access Token Hook für JWT-Claims

## Rollen-System

### Verfügbare Rollen

- **superadmin**: Vollzugriff auf alle Funktionen
- **owner**: Erweiterte Verwaltungsrechte
- **admin**: Standard-Administratorrechte
- **team_admin**: Team-spezifische Verwaltungsrechte
- **creator**: Ersteller von Inhalten
- **consumer**: Basis-Benutzerrechte (Standard für neue Benutzer)

### Automatische Rollenzuweisung

Neue Benutzer erhalten automatisch die Rolle `consumer` durch den `set_consumer_role` Trigger.

## Berechtigungssystem

Das System verwendet granulare Berechtigungen, die über die `has_permission()` Funktion geprüft werden können.

### Beispiel-Verwendung

```sql
-- Prüfen ob Benutzer Berechtigung hat
SELECT has_permission('users.delete');

-- In RLS Policy verwenden
CREATE POLICY "Admin can delete users" ON some_table
  FOR DELETE USING (has_permission('users.delete'));
```

## Storage

Der `user_assets` Bucket ist für Benutzer-Uploads konfiguriert mit:

- 50MB Dateigrößenlimit
- Unterstützte Dateitypen: Bilder, PDFs, Text, JSON
- Benutzer können nur ihre eigenen Dateien verwalten
- Admins können alle Dateien einsehen

## Row Level Security (RLS)

Alle Tabellen haben RLS aktiviert mit entsprechenden Policies für:

- Benutzer können ihre eigenen Daten einsehen/bearbeiten
- Administratoren haben erweiterte Zugriffsrechte basierend auf Berechtigungen
- Sichere Trennung zwischen Benutzerdaten

## Custom Access Token Hook

Das System enthält eine `custom_access_token_hook` Funktion, die automatisch Benutzerinformationen zu JWT-Tokens hinzufügt. Diese Funktion:

- Lädt die Benutzerrolle aus der `user_roles` Tabelle
- Lädt Profildaten (`avatar_url`, `full_name`, `username`) aus der `profiles` Tabelle
- Fügt alle Informationen als Claims zum JWT hinzu
- Verwendet `consumer` als Fallback-Rolle
- Ermöglicht rollenbasierte Zugriffskontrolle und Profildaten-Zugriff im Frontend

**Konfiguration in Supabase:**
Nach der Migration muss die Hook in den Supabase Auth-Einstellungen konfiguriert werden.

## Nächste Schritte

Nach der Ausführung aller Migrations:

1. Erstelle die Trigger manuell im Supabase Dashboard (siehe SETUP_GUIDE.md)
2. Konfiguriere den Custom Access Token Hook in den Auth-Einstellungen
3. Erstelle einen ersten Superadmin-Benutzer
4. Teste die Berechtigungsfunktionen
5. Konfiguriere weitere rollenspezifische Policies nach Bedarf
6. Erweitere das Berechtigungssystem für neue Features
