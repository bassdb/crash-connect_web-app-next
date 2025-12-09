# RBAC Berechtigungsmatrix

Diese Datei dokumentiert die Berechtigungsmatrix für das rollenbasierte Zugriffskontrollsystem (RBAC).

## Rollen-Hierarchie

```
superadmin (Vollzugriff)
├── owner (Produktverwaltung)
├── admin (Systemverwaltung)
├── team_admin (Team-Verwaltung)
├── creator (Inhalts-Erstellung)
└── consumer (Basis-Zugriff)
```

## Berechtigungsmatrix

| Berechtigung | superadmin | owner | admin | team_admin | creator | consumer |
|-------------|------------|---------------|-------|------------|---------|----------|
| **User Management** |
| consumers.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| creators.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| owner.manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| user_profiles.read | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| users.delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users.update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| users.create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| user_roles.update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| user_roles.view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Credits Management** |
| credits.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Team Management** |
| example_teams.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| team_assets.manage | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| team_categories.allowCRUD | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| team_categories.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| teams.allowCRUD | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

## Rollenbeschreibungen

### superadmin
- **Zweck**: Vollzugriff auf alle Systemfunktionen
- **Verwendung**: Technische Systemadministration
- **Besonderheiten**: Kann nicht gelöscht werden, kann andere Superadmins verwalten

### owner
- **Zweck**: Produktmanagement und Business-Logik
- **Verwendung**: Verwaltung von Benutzern, Inhalten und Geschäftsprozessen
- **Besonderheiten**: Kann keine anderen Owner verwalten

### admin
- **Zweck**: Tägliche Systemverwaltung
- **Verwendung**: Benutzerverwaltung, Content-Moderation, System-Monitoring
- **Besonderheiten**: Kann keine Benutzer löschen oder Rollen ändern

### team_admin
- **Zweck**: Team-spezifische Verwaltung
- **Verwendung**: Verwaltung von Teams und deren Assets
- **Besonderheiten**: Beschränkt auf Team-bezogene Funktionen

### creator
- **Zweck**: Inhalts-Erstellung
- **Verwendung**: Erstellen und Verwalten von Inhalten
- **Besonderheiten**: Keine spezifischen Systemberechtigungen, fokussiert auf Content-Erstellung

### consumer
- **Zweck**: Standard-Benutzer
- **Verwendung**: Grundlegende Nutzung der Plattform
- **Besonderheiten**: Minimale Berechtigungen, Standard-Rolle für neue Benutzer

## Sicherheitsrichtlinien

### Rollenzuweisung
- Neue Benutzer erhalten automatisch die `consumer` Rolle
- Rollenzuweisungen müssen von autorisierten Benutzern vorgenommen werden
- Superadmin-Rollen sollten sparsam vergeben werden

### Berechtigungsprüfung
- Alle sensiblen Operationen müssen `has_permission()` verwenden
- RLS Policies sollten Berechtigungen prüfen, nicht nur Rollen
- Berechtigungen werden zur Laufzeit geprüft, nicht gecacht

### Audit und Monitoring
- Rollenzuweisungen sollten geloggt werden
- Berechtigungsänderungen sollten überwacht werden
- Regelmäßige Überprüfung der Rollenzuweisungen

## Erweiterung des Systems

### Neue Berechtigungen hinzufügen
1. Berechtigung zum `app_permission` Enum hinzufügen
2. Entsprechende Einträge in `role_permissions` erstellen
3. RLS Policies und Anwendungslogik aktualisieren
4. Diese Dokumentation aktualisieren

### Neue Rollen hinzufügen
1. Rolle zum `app_role` Enum hinzufügen
2. Berechtigungen in `role_permissions` definieren
3. Rollenzuweisungslogik anpassen
4. Diese Dokumentation aktualisieren
