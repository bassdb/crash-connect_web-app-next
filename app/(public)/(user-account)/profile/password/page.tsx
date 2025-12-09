import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAction } from 'next-safe-action/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { updatePassword } from '@/app/(public)/(user-account)/profile/password/server/update-password'

import { UpdatePasswordSchema, updatePasswordSchema } from '@/types/update-password-schema'
import { redirect } from 'next/navigation'
import { createClient } from '@/server/supabase/server'
import UpdatePasswordForm from './update-password-form'

export default async function PasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm />
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  )
}
