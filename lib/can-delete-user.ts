import { createClient } from '@/server/supabase/server'

export async function canDeleteUser(targetUserID: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('can_delete_user', { target_user_id: targetUserID })
  if (error) {
    console.error('Could not find out the requested permission:', error)
    return false
  }
  return data
}
