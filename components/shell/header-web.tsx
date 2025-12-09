import HeaderAuth from '@/components/shell/header-auth'
import NavigationMain from './navigation-main'

import Link from 'next/link'
import { createClient } from '@/server/supabase/server'
import Logo from './logo'
import { getUserRole } from '@/utils/decode-jwt'
import { SquareArrowOutUpRight } from 'lucide-react'
import { Button } from '../ui/button'

export default async function HeaderWeb() {
  const supabase = await createClient()

  const navLinksPublic = [
    {
      href: '/explore',
      label: 'Explore',
    },
    {
      href: '/about',
      label: 'About',
    },
  ]

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (!session) {
      return (
        <header className='grid grid-cols-[1fr_auto_1fr] gap-4 items-center w-full border-b border-b-foreground/10 h-16'>
          <Logo />
          <NavigationMain navLinks={navLinksPublic} />
          <HeaderAuth userRole={''} />
        </header>
      )
    }
    const userRole = await getUserRole(session?.access_token as string)
    if (!userRole) {
      console.error('Error fetching user role')
    }
    const user_role = userRole?.payload?.user_role

    // console.log(user_role)

    const isStaff =
      user_role === 'admin' ||
      user_role === 'superadmin' ||
      user_role === 'product_owner' ||
      user_role === 'creator'

    // console.log(isStaff)

    const navLinksConsumer = user_role
      ? [
          {
            href: '/dashboard',
            label: 'Home',
          },
          {
            href: '/browse',
            label: 'Browse',
          },
          {
            href: '/use-design-template',
            label: 'Create',
          },
          {
            href: '/library',
            label: 'Your Creations',
          },
          {
            href: '/teams',
            label: 'Your Teams',
          },
        ]
      : []

    const allLinks = [...navLinksConsumer, ...navLinksPublic]

    return (
      <header className='grid lg:grid-cols-[1fr_auto_1fr] grid-cols-[1fr_1fr]  gap-4 items-center w-full border-b border-b-foreground/10 h-16'>
        <div className='flex items-center gap-4'>
          <Logo />
          {isStaff && (
            <Button
              className='flex items-center justify-center gap-2 py-2 px-4 border border-emerald-600 rounded-full bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900'
              style={{ backgroundColor: 'transparent' }}
            >
              <Link
                href='/admin-dashboard/'
                className='flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300'
              >
                {user_role}
              </Link>
              <SquareArrowOutUpRight size={16} className='text-emerald-700 dark:text-emerald-300' />
            </Button>
          )}
        </div>
        <div className='hidden lg:flex'>
          <NavigationMain navLinks={user_role ? navLinksConsumer : navLinksPublic} />
        </div>
        <HeaderAuth userRole={user_role} />
      </header>
    )
  } catch (e) {
    console.error(e)
  }
}
