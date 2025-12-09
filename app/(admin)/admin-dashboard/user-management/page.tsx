import { createClient } from '@/server/supabase/server'
import { createSuperClient } from '@/server/supabase/superadmin'
import { getUserRole } from '@/utils/decode-jwt'
import { encodedRedirect } from '@/utils/utils'
import { checkUserRole } from '@/lib/check-session-and-role'
import { toast } from 'sonner'
import { columns } from './components/columns-user-profiles'
import { DataTable } from './components/data-table'
import UserStatsCard from '../components/status-card'
import Link from 'next/link'

import { UserProfileWithRole, UserRoles } from '@/types/supabase-types'
import { Button } from '@/components/ui/button'

import SelectUserType from '../components/select-user-type'
import { UserPlus } from 'lucide-react'
import SearchUser from '../components/searchUser'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
type PageProps = {
  searchParams: SearchParams
}

export default async function UserManagement({ searchParams }: PageProps) {
  //* check if the user has the correct role to access this page

  const userRoleCheck = await checkUserRole()

  if (!userRoleCheck) {
    return encodedRedirect(
      'error',
      '/auth-feedback',
      'Could not find your role which is needed to view this ressoure.'
    )
  }

  const { user_role, isOwnerOrAbove, isAdminOrAbove, availableRoles } = userRoleCheck

  let requestFilterAccordingToRole: string[] = []

  if (user_role === 'superadmin') {
    requestFilterAccordingToRole = ['product_owner', 'admin', 'creator', 'consumer']
  }
  if (user_role === 'product_owner') {
    requestFilterAccordingToRole = ['admin', 'creator', 'consumer']
  }
  if (user_role === 'admin') {
    requestFilterAccordingToRole = ['creator', 'consumer']
  }

  const supabase = await createClient()

  // make a request to fetch all user profiles with roles and filter out the roles that are not allowed to be viewed by the user which is at the same hierarchy or above

  const { data: allUserProfilesWithRoles, error: userError } = await supabase
    .from('profiles_with_roles')
    .select()
    .in('role', requestFilterAccordingToRole)

  const params = await searchParams

  if (Object.keys(params).length === 0) {
    console.log('No Search Params found')
  }

  const { userType, foundUser } = params

  let userData: UserProfileWithRole[] = allUserProfilesWithRoles || []

  if (userType) {
    console.log('User Type:', userType)
    switch (userType) {
      case 'consumer':
        userData = allUserProfilesWithRoles?.filter((user) => user.role === 'consumer') || []
        break
      case 'creator':
        userData = allUserProfilesWithRoles?.filter((user) => user.role === 'creator') || []
        break
      case 'admin':
        userData = allUserProfilesWithRoles?.filter((user) => user.role === 'admin') || []
        break
      case 'product_owner':
        userData = allUserProfilesWithRoles?.filter((user) => user.role === 'product_owner') || []
        break
      default:
        userData = allUserProfilesWithRoles || []
        break
    }
  }

  if (foundUser) {
    // extract the URLSearchPrams encoded foundUser query from the searchParams foundUser

    // userData = [foundUserProfile]

    console.log('Found User:', foundUser)
  }

  if (userError) {
    // toast('Error fetching data.')
    // return encodedRedirect('error', '/auth-feedback', 'Error fetching user data.')
  }

  const consumers = allUserProfilesWithRoles?.filter((user) => user.role === 'consumer') || []
  const creators = allUserProfilesWithRoles?.filter((user) => user.role === 'creator') || []
  const admins = allUserProfilesWithRoles?.filter((user) => user.role === 'admin') || []
  const owners = allUserProfilesWithRoles?.filter((user) => user.role === 'product_owner') || []

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='grid auto-rows-min gap-8 md:grid-cols-3'>
        <Link href='/admin-dashboard/user-management?userType=consumer'>
          <div className='aspect-video rounded-xl'>
            <UserStatsCard
              title='Regular Users'
              registeredUsers={consumers.length}
              activeUsers={consumers.length}
            />
          </div>
        </Link>
        <Link href='/admin-dashboard/user-management?userType=creator'>
          <div className='aspect-video rounded-xl'>
            <UserStatsCard
              title='Creators'
              registeredUsers={creators.length}
              activeUsers={creators.length}
            />
          </div>
        </Link>
        <Link href='/admin-dashboard/user-management?userType=admin'>
          <div className='aspect-video rounded-xl'>
            <UserStatsCard
              title='Admins'
              registeredUsers={admins.length}
              activeUsers={admins.length}
            />
          </div>
        </Link>
      </div>

      <div className='flex lg:flex-row lg:gap-8 flex-col gap-4 items-center'>
        {/* <div className='grid auto-rows-min gap-8 md:grid-cols-3'> */}
        <div className='flex gap-2'>
          <SelectUserType availableRoles={availableRoles || []} />
          <Button variant='default' asChild>
            <Link href='/admin-dashboard/user-management'>Show all users</Link>
          </Button>
        </div>

        <SearchUser />

        <Button variant='default' asChild>
          <Link
            className='flex gap-2 justify-center items-center'
            href='/admin-dashboard/user-management/add-user'
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </Link>
        </Button>
      </div>
      <div className='w-full mx-auto'>
        {allUserProfilesWithRoles ? (
          <DataTable columns={columns} data={userData} />
        ) : (
          <p>No data there...</p>
        )}
      </div>
    </div>
  )
}
