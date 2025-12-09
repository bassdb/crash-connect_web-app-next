'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { UserRoles } from '@/types/supabase-types'

import { useRouter } from 'next/navigation'

export default function SelectUserType({ availableRoles }: { availableRoles: string[] }) {
  const router = useRouter()

  function showFilteredUsers(userType: string) {
    console.log('Showing users of type:', userType)
    router.push(`/admin-dashboard/user-management?userType=${userType}`)
  }
  return (
    <Select onValueChange={(value) => showFilteredUsers(value)}>
      <SelectTrigger className='min-w-48'>
        <SelectValue placeholder='Select user role to display' />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
        <SelectItem value='all'>All</SelectItem>
      </SelectContent>
    </Select>
  )
}
