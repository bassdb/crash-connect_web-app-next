import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import AddUserForm from '../../components/add-user-form'
import { Form } from 'react-hook-form'
import { FormSuccess } from '@/components/error-handling/form-success'

import { checkUserRole } from '@/lib/check-session-and-role'
import { encodedRedirect } from '@/utils/utils'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
type PageProps = {
  searchParams: SearchParams
}

export default async function AddUser() {
  const userRoleCheck = await checkUserRole()

  if (!userRoleCheck) {
    return encodedRedirect(
      'error',
      '/admin-dashboard/admin-feedback',
      'Could not find your role which is needed to view this ressoure.'
    )
  }

  const { availableRoles } = userRoleCheck

  if (!availableRoles) {
    return encodedRedirect(
      'error',
      '/admin-dashboard/admin-feedback',
      'Could not find the available roles'
    )
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Create a new user</CardTitle>
          <CardDescription>Add the e-mail adress and specify the role</CardDescription>
        </CardHeader>
        <CardContent>
          <AddUserForm availableRoles={availableRoles} />
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  )
}
