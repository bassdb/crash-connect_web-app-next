import { createClient } from '@/server/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url)
  const type = requestUrl.searchParams.get('type')?.toString()
  const token_hash = requestUrl.searchParams.get('token_hash')?.toString()
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString()

  console.log('type', type)
  console.log('token_hash', token_hash)

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (error) {
      console.error('Error verifying OTP:')
      return NextResponse.redirect(`${origin}/auth-feedback?error=Could not verify OTP`)
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`)
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/protected`)
}
