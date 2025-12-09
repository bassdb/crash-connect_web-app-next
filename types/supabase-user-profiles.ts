export type SupabaseUserProfile = {
  id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url?: string | null
  updated_at?: string | null
  website?: string | null
  is_admin?: boolean | null
  role?: string | null
}
