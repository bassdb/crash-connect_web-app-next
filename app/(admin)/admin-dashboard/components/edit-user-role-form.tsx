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

import { UserRoles } from '@/types/supabase-types'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { redirect } from 'next/navigation'
import { cn } from '@/utils/cn'

import { useForm } from 'react-hook-form'
import { set, z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { userRoleSchema, userIdWithRoleSchema } from '@/types/email-schema'
import { Button } from '@/components/ui/button'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { adminUpdatesUserRole } from '@/server/actions/admin-usermanagement/admin-updates-userrole'
import { UserPen } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { ToastAction } from '@/components/ui/toast'

export default function EditUserRoleForm({
  userId,
  availableRoles,
}: {
  userId: string
  availableRoles: string[]
}) {
  const form = useForm<z.infer<typeof userRoleSchema>>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      role: UserRoles.CONSUMER,
    },
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const { execute, isPending, status, result } = useAction(adminUpdatesUserRole, {
    onSuccess: ({ data }) => {
      // if (!data) {
      //   setError('Error creating user')
      // }
      if (data?.error) {
        setError(data.error)
        console.log(data.error)
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.',
          action: <ToastAction altText='Try again'>Try again</ToastAction>,
        })
      }
      if (data?.success) {
        setSuccess(data.success)
        console.log(data.success)
        toast({
          title: 'Success',
          description: data.success,
          className: 'bg-green-500 border border-green-800 text-white',
        })
        router.push(`/admin-dashboard/user-management/edit-user?id=${userId}`)
      }
    },
  })

  const onSubmit = (values: z.infer<typeof userRoleSchema>) => {
    const roleWithUserId = { userID: userId, ...values }
    console.log(roleWithUserId)
    execute(roleWithUserId)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-1 items-center'>
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

          <Button
            disabled={isPending}
            type='submit'
            variant='outline'
            className={cn(
              'my-2 flex items-center gap-2',
              status === 'executing' ? 'animate-pulse' : ''
            )}
          >
            <UserPen size={16} />
            <span>{isPending ? 'Updating...' : 'Update Role'}</span>
          </Button>
        </form>
      </Form>
    </div>
  )
}
