import { createClient } from '@/server/supabase/server'
import { redirect } from 'next/navigation'
//* ---------------------------------
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { ProfileSidebar } from '../components/ProfileSidebar'

import InputUsername from './input-username'
import InputFullName from './input-full-name'
import EmailPreferences from './input-email-preferences'
import InputAvatar from './input-avatar'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

//* ---------------------------------

export default async function Profile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  const {
    data: { username, full_name, avatar_url },
  } = await supabase.from('profiles').select().eq('id', user.id).single()

  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Your user profile details!</CardTitle>
          <CardDescription>
            Edit and mange your details you provide for your account{' '}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='flex flex-col gap-4 max-w-xl'>
            <div className='w-fit p-1 rounded-full border border-slate-900 dark:border-slate-100'>
              <Avatar className='w-24 h-24 bg-transparent'>
                <AvatarImage className='bg-transparent' src={avatar_url || undefined} />
                <AvatarFallback className='border bg-slate-200 text-2xl font-bold '>
                  {username && username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <InputAvatar />
            </div>
          </div>

          <InputUsername userN={username} />
          <InputFullName userFullName={full_name} />
        </CardContent>
      </Card>

      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>Adjust your preferences here</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailPreferences />
        </CardContent>
      </Card>

      <Card className='w-full border border-dashed border-red-600'>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            If you don't want to use our services anymore, you can delete your account here. All
            your data will be lost and deleted permanently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='destructive'>Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  )
}
