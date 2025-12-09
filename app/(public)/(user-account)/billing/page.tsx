import { createClient } from '@/server/supabase/server'
import { redirect } from 'next/navigation'

export default async function Billing() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <>
      <div>your billing history, {user.email}!</div>
    </>
  )
}
