import { createClient } from '@/server/supabase/server'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeSwitcher } from '../theme-switcher'
import { LogOut, UserPen, Wallet, Users } from 'lucide-react'
import SignOutButton from './sign-out-button'
import CreditProgress from './credit-progress'

import { getCreditBalance } from '@/lib/credit-balance'

interface HeaderAuthProps {
  userRole: string
}

export default async function Headerauth({ userRole }: HeaderAuthProps) {
  const supabase = await createClient()
  // const router = useRouter()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const {
      data: { username, full_name, avatar_url, role },
    } = await supabase.from('profiles').select().eq('id', user?.id).single()

    const { currentBalance, latestPurchase, progressValue, percentageNotUsed } =
      await getCreditBalance()
    // console.log(latestPurchase)
    const avatarUrl = avatar_url || undefined

    return (
      <div className='flex items-center justify-end gap-2'>
        <div className='hidden lg:flex flex-col items-center gap-1 pb-2 pt-1 px-6 border rounded-full'>
          <Link href='/your-credits'>
            <span className='text-xs'>
              {currentBalance}/{latestPurchase?.[0]?.credit_amount} left
            </span>
          </Link>
          <CreditProgress percentageNotUsed={percentageNotUsed} />
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className='cursor:pointer'>
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className='border bg-slate-200'>
                {user.email && user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <div className='flex flex-col items-center p-4 m-4 rounded-md bg-primary/5 gap-4'>
              <Avatar className='w-16 h-16'>
                <AvatarImage src={avatarUrl} alt={full_name || user.email || 'User'} />

                <AvatarFallback className='font-medium text-white bg-slate-800'>
                  <div>{user.email?.charAt(0).toUpperCase()}</div>
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col items-center gap-2 '>
                {/* <p className='text-xs font-bold'>{user.name}</p> */}
                <span className='text-xs font-medium text-secondary-foreground'>{user.email}</span>
                {/* <span className='text-xs font-medium text-emerald-600'>{user_role}</span> */}
              </div>
            </div>
            {/* <DropdownMenuLabel> {user.email}'s account</DropdownMenuLabel> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserPen
                size={14}
                className='mr-3 transition-all duration-200 group-hover:translate-x-1'
              />
              <Link href='/profile'>Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Wallet
                size={14}
                className='mr-3 transition-all duration-200 group-hover:translate-x-1'
              />
              <Link href='/your-credits'>Your Credits</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPen
                size={14}
                className='mr-3 transition-all duration-200 group-hover:translate-x-1'
              />
              <Link href='/buy-credits'>Buy Credits</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users
                size={14}
                className='mr-3 transition-all duration-200 group-hover:translate-x-1'
              />
              <Link href='/insert-data'>Your Teams</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {/* <LogOut
              size={14}
              className='mr-3 transition-all duration-200 group-hover:translate-x-1'
            />
            Sign out */}
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeSwitcher />
      </div>
    )
  }
  if (!user) {
    return (
      <div className='flex items-center justify-end gap-2'>
        <Button asChild size='sm' variant={'outline'}>
          <Link href='/sign-in'>Sign in</Link>
        </Button>
        <Button asChild size='sm' variant={'default'}>
          <Link href='/sign-up'>Sign up</Link>
        </Button>
        <ThemeSwitcher />
      </div>
    )
  }
}
