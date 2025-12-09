'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/server/supabase/client'

import { Button } from '../ui/button'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { MailCheck } from 'lucide-react'
import { signInWithGoogleAction } from '@/server/actions/sign-in-socials'

function Socials() {
  const currentPath = usePathname()
  const supabase = createClient()
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
      },
    })
    // signInWithGoogleAction()
  }

  return (
    <div className='flex flex-col items-center w-full gap-4'>
      <Button className='flex w-full gap-4' variant='outline' asChild>
        <Link href='/sign-in-magic-link'>
          <MailCheck size={16} />
          <span>
            {currentPath === '/sign-in' ? 'Sign in with magic link' : 'Sign in with password'}
          </span>
          {/* <span>Sign in with magic link</span> */}
        </Link>
      </Button>
      <Button className='flex w-full gap-4' variant='outline' onClick={handleGoogleSignIn}>
        <FcGoogle />
        <span>Sign in with Google</span>
      </Button>
      <Button className='flex w-full gap-4' variant='outline'>
        <FaApple />
        <span>Sign in with Apple</span>
      </Button>
    </div>
  )
}
export default Socials
