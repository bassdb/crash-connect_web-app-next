// Hauptexport-Datei für alle Team-Actions
// Re-exportiert alle Funktionen aus den verschiedenen Modulen

// Berechtigungen
export { getUserTeamRole, checkTeamPermission } from './team-permissions'

// Schemas
export * from './team-schemas'

// CRUD-Operationen
export {
  createTeam,
  updateTeam,
  deleteTeam,
  getTeam,
  getTeamBySlug,
  getUserTeams,
  getDefaultTeams,
} from './team-crud'

// Mitgliederverwaltung
export {
  getTeamMembers,
  updateTeamMember,
  removeTeamMember,
} from './team-members'

// Einladungsverwaltung
export {
  inviteTeamMember,
  acceptTeamInvitation,
  sendInvitationMagicLink,
  processInvitationAfterRegistration,
  revokeTeamInvitation,
  updateTeamInvitationRole,
  resendTeamInvitationEmail,
} from './team-invitations'

// Asset-Verwaltung
export {
  updateTeamLogo,
  removeTeamLogo,
} from './team-assets' 