import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Dot, InfoIcon, UserMinus, UserPlus } from 'lucide-react'
import EditUserActions from '../components/edit-user-triggers'

import { createSuperClient } from '@/server/supabase/superadmin'
import { checkUserRole } from '@/lib/check-session-and-role'

import { encodedRedirect } from '@/utils/utils'
import EditUserTriggers from '../components/edit-user-triggers'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
type PageProps = {
  searchParams: SearchParams
}

export default async function EditUser({ searchParams }: PageProps) {
  const params = await searchParams

  if (!params) {
    console.log('no params')
  }

  const userID = params.id as string

  const checkRole = await checkUserRole()

  if (!checkRole) {
    return encodedRedirect('error', '/admin-dashboard/admin-feedback', 'Error fetching your role.')
  }

  const { user_role, isAdminOrAbove, availableRoles } = checkRole

  // console.log(userID)

  // const supabase = await createClient()
  // const {
  //   data: { session },
  //   error,
  // } = await supabase.auth.getSession()
  // const userRoleResponse = await getUserRole(session?.access_token as string)
  // const user_role = userRoleResponse?.payload?.user_role

  // // console.log(user_role)

  // const validUser = user_role === 'superadmin' || user_role === 'product_owner'

  console.log('Role of logged in user:', user_role)
  // console.log(availableRoles)

  if (!isAdminOrAbove) {
    return encodedRedirect('error', '/auth-feedback', 'You are not authorized.')
  }

  const supabaseAdmin = await createSuperClient()

  const { data: userAuthData, error: userAuthError } =
    await supabaseAdmin.auth.admin.getUserById(userID)

  const { user } = userAuthData

  // console.log(userAuthData)

  if (userAuthError) {
    return encodedRedirect('error', '/auth-feedback', 'Error fetching user auth data.')
  }

  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('has_permission', {
    requested_permission: 'consumers.manage',
  })

  if (rpcError) {
    console.error('Error calling has_permission:', rpcError)
  }
  console.log('Permission granted:', rpcData)

  const { data: role, error: roleError } = await supabaseAdmin
    .from('profiles_with_roles')
    .select('role')
    .eq('profile_id', userID)

  // console.log(role)

  return (
    <div className='flex flex-col gap-4 p-4'>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className='flex justify-between items-center'>
              <div className='flex gap-4 items-center'>
                <span>{user?.email}</span>
                <div className='py-2 px-4 border border-emerald-600 rounded-full text-sm'>
                  {role && role[0]?.role}
                </div>
              </div>

              <EditUserTriggers userID={userID} availableRoles={availableRoles || []} />
            </div>
          </CardTitle>
          <CardDescription>ID: {user?.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex-1 w-full flex flex-col gap-12'>
            <div className='w-full'>
              <div className='bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center'>
                <InfoIcon size='16' strokeWidth={2} />
                <div className='flex gap-2'>
                  <span>Member since:</span>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
                <Dot />
                <div className='flex gap-2'>
                  <span>Last Login:</span>
                  {user?.last_sign_in_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
                <Dot />
                <div className='flex gap-2'>
                  <span>Signs in with:</span>
                  {user?.app_metadata.provider}
                </div>
              </div>
            </div>
            <div></div>
            <div className='flex flex-col gap-4 items-start'>
              <div className='border rounded p-4 w-full'>
                <h2 className='font-bold text-2xl mb-4'>Balance</h2>
              </div>
              <div className='border rounded p-4 w-full'>
                <h2 className='font-bold text-2xl mb-4'>Generated content</h2>
              </div>
              <div className='border rounded p-4 w-full'>
                <h2 className='font-bold text-2xl mb-4'>Uploaded Assets</h2>
              </div>
              <div className='border rounded p-4 w-full'>
                <h2 className='font-bold text-2xl mb-4'>User Preferences</h2>
              </div>
              {/* <pre className='text-xs font-mono p-3 rounded border  overflow-auto'>
                {JSON.stringify(userAuthData, null, 1)}
                {JSON.stringify(userAuthData, null, 2)}
              </pre>*/}
            </div>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  )
}
