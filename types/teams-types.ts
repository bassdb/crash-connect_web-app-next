// Teams System TypeScript Types für Supabase

export type TeamMemberRole = 'owner' | 'admin' | 'member'
export type TeamStatus = 'active' | 'inactive' | 'archived'

export interface TeamColor {
  name: string
  value: string
  label: string
}

export interface Team {
  id: string
  name: string
  description: string | null
  slug: string
  avatar_url: string | null
  is_default: boolean
  status: TeamStatus
  other_creators_can_use_example_team: boolean
  colors: TeamColor[]
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamMemberRole
  joined_at: string
  // Joined fields from user profiles
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

export interface TeamInvitation {
  id: string
  team_id: string
  email: string
  role: TeamMemberRole
  invited_by: string
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
  // Joined fields
  team?: Team
  invited_by_user?: {
    id: string
    email: string
    full_name?: string
  }
}

// Request/Response Types für API Calls
export interface CreateTeamRequest {
  name: string
  description?: string
  slug: string
  avatar_url?: string
}

export interface UpdateTeamRequest {
  name?: string
  description?: string
  slug?: string
  avatar_url?: string
  status?: TeamStatus
}

export interface InviteTeamMemberRequest {
  email: string
  role: TeamMemberRole
}

export interface UpdateTeamMemberRequest {
  role: TeamMemberRole
}

// Database Views für erweiterte Abfragen
export interface TeamWithMembers extends Team {
  members: TeamMember[]
  member_count: number
}

export interface UserTeams {
  teams: Team[]
  owned_teams: Team[]
  admin_teams: Team[]
  member_teams: Team[]
}

// Utility Types
export type TeamPermission = 'view' | 'edit' | 'delete' | 'invite' | 'manage_members'

export interface TeamPermissions {
  can_view: boolean
  can_edit: boolean
  can_delete: boolean
  can_invite: boolean
  can_manage_members: boolean
  role: TeamMemberRole | null
}

// API Response Types
export interface TeamsApiResponse<T> {
  data: T
  error: string | null
}

export interface PaginatedTeamsResponse {
  teams: Team[]
  total: number
  page: number
  limit: number
  has_more: boolean
}
