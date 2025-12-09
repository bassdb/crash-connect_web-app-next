'use client'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'

import { UserRoles, OwnerRoles, AdminRoles } from '@/types/supabase-types'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'

import { cn } from '@/utils/cn'

import { useForm } from 'react-hook-form'
import { set, z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailSchema, emailSchemaWithRole } from '@/types/email-schema'
import { Button } from '@/components/ui/button'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { useState, useEffect } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { adminAddsUserWithRole } from '@/server/actions/admin-usermanagement/admin-adds-User'
import { User, UserPlus } from 'lucide-react'
import { FormSuccess } from '@/components/error-handling/form-success'
import { FormError } from '@/components/error-handling/form-error'
import Link from 'next/link'
import { checkUserRole } from '@/lib/check-session-and-role'
import { encodedRedirect } from '@/utils/utils'

export default function AddUserForm({ availableRoles }: { availableRoles: string[] }) {
  // add a useEffect to check the user role

  const form = useForm<z.infer<typeof emailSchemaWithRole>>({
    resolver: zodResolver(emailSchemaWithRole),
    defaultValues: {
      email: '',
      role: UserRoles.CONSUMER,
    },
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { toast } = useToast()

  const { execute, isPending, status, result } = useAction(adminAddsUserWithRole, {
    onSuccess: ({ data }) => {
      // if (!data) {
      //   setError('Error creating user')
      // }
      if (data?.error) {
        setError(data.error)
      }
      if (data?.success) {
        setSuccess(data.success)
      }
    },
  })

  const onSubmit = (values: z.infer<typeof emailSchemaWithRole>) => {
    console.log(values)
    execute(values)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <div>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <div className='flex gap-4 pl-3'>
                    <FormLabel className='text-xs'>Email</FormLabel>
                    <FormMessage className='text-xs' />
                  </div>
                  <FormControl>
                    <Input
                      placeholder='your@example.com'
                      {...field}
                      type='email'
                      autoComplete='email'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className='min-w-48'>
                      <SelectValue placeholder='Select user role to assign' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {Object.values(UserRoles).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))} */}
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          {!success ? (
            <Button
              disabled={isPending}
              type='submit'
              className={cn(
                'my-2 flex items-center gap-2',
                status === 'executing' ? 'animate-pulse' : ''
              )}
            >
              <UserPlus size={16} />
              <span>{isPending ? 'Creating User...' : 'Create User'}</span>
            </Button>
          ) : (
            <Button type='button' variant='secondary' asChild>
              <Link href='/admin-dashboard/user-management'>Check new user in user managent</Link>
            </Button>
          )}
        </form>
      </Form>
      <FormSuccess message={success} />
      <FormError message={error} />
    </div>
  )
}
