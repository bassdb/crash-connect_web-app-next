# Team Actions - Modulare Struktur

Diese Verzeichnisstruktur wurde refaktoriert, um die Verantwortlichkeiten klarer zu trennen und die Wartbarkeit zu verbessern.

## Dateistruktur

### `index.ts`
Hauptexport-Datei, die alle Funktionen aus den verschiedenen Modulen re-exportiert.

### `team-schemas.ts`
Enthält alle Zod-Schemas für die Validierung:
- `createTeamSchema`
- `updateTeamSchema`
- `inviteMemberSchema`
- `updateMemberSchema`
- `removeMemberSchema`
- `acceptInvitationSchema`
- `updateTeamLogoSchema`
- `removeTeamLogoSchema`
- `deleteTeamSchema`

### `team-permissions.ts`
Hilfsfunktionen für Berechtigungsprüfungen:
- `getUserTeamRole(teamId, userId)` - Ermittelt die Rolle eines Benutzers in einem Team
- `checkTeamPermission(teamId, requiredRole)` - Prüft, ob ein Benutzer die erforderlichen Berechtigungen hat

### `team-crud.ts`
CRUD-Operationen für Teams:
- `createTeam` - Erstellt ein neues Team
- `updateTeam` - Aktualisiert ein bestehendes Team
- `deleteTeam` - Löscht ein Team
- `getTeam` - Ruft ein Team anhand der ID ab
- `getTeamBySlug` - Ruft ein Team anhand des Slugs ab
- `getUserTeams` - Ruft alle Teams eines Benutzers ab
- `getDefaultTeams` - Ruft Standard-Teams ab

### `team-members.ts`
Mitgliederverwaltung:
- `getTeamMembers` - Ruft alle Mitglieder eines Teams ab
- `updateTeamMember` - Aktualisiert die Rolle eines Mitglieds
- `removeTeamMember` - Entfernt ein Mitglied aus dem Team

### `team-invitations.ts`
Einladungsverwaltung:
- `inviteTeamMember` - Lädt ein neues Mitglied ein
- `acceptTeamInvitation` - Nimmt eine Einladung an

### `team-assets.ts`
Asset-Verwaltung (Logo):
- `updateTeamLogo` - Aktualisiert das Team-Logo
- `removeTeamLogo` - Entfernt das Team-Logo

## Verwendung

Alle Funktionen können über die Hauptexport-Datei importiert werden:

```typescript
import { 
  createTeam, 
  inviteTeamMember, 
  getTeamMembers,
  checkTeamPermission 
} from '@/app/(frontend)/teams/_actions'
```

## Vorteile der neuen Struktur

1. **Klare Verantwortlichkeiten**: Jede Datei hat eine spezifische Aufgabe
2. **Bessere Wartbarkeit**: Änderungen sind auf spezifische Bereiche beschränkt
3. **Einfachere Tests**: Funktionen können isoliert getestet werden
4. **Bessere Übersichtlichkeit**: Entwickler finden schnell die relevanten Funktionen
5. **Reduzierte Komplexität**: Kleinere Dateien sind einfacher zu verstehen

## Migration

Die alte `teams-actions.ts` Datei wurde in diese modulare Struktur aufgeteilt. Alle bestehenden Imports wurden automatisch aktualisiert, um die neue `index.ts` Datei zu verwenden. 