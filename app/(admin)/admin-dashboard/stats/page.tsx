import { checkUserRole } from '@/lib/check-session-and-role'
import { encodedRedirect } from '@/utils/utils'

export default async function StatsForOwnersAndAbove() {
  const userRoleCheck = await checkUserRole()

  if (!userRoleCheck) {
    return encodedRedirect(
      'error',
      '/auth-feedback',
      'Could not find your role which is needed to view this ressoure.'
    )
  }

  const { user_role, isOwnerOrAbove, isAdminOrAbove, availableRoles } = userRoleCheck

  if (!isOwnerOrAbove) {
    return encodedRedirect(
      'error',
      '/admin-dashboard/admin-feedback',
      'You are not authorized to view this page'
    )
  }

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
        <div className='aspect-video rounded-xl bg-muted/50'>Stats Overview</div>
        <div className='aspect-video rounded-xl bg-muted/50'></div>
        <div className='aspect-video rounded-xl bg-muted/50'></div>
      </div>
      <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
    </div>
  )
}
