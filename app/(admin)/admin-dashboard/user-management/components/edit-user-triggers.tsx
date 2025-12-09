'use client'

import { Button } from '@/components/ui/button'
import { deleteUser } from '@/server/actions/admin-usermanagement/admin-deletes-user'
import { UserMinus, UserPen } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import EditUserRoleForm from '../../components/edit-user-role-form'

type EditUserActionsProps = {
  userID: string
  availableRoles: string[]
}

export default function EditUserTriggers({ userID, availableRoles }: EditUserActionsProps) {
  console.log('ID from form: ' + userID)
  console.log('Available roles: ' + availableRoles)
  return (
    <div className='flex items-center gap-8'>
      <EditUserRoleForm userId={userID} availableRoles={availableRoles} />

      <Dialog>
        <DialogTrigger asChild>
          <Button variant='destructive' className='flex items-center space-x-1'>
            <UserMinus size={16} />
            <span>Delete User</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure to delete this user?</DialogTitle>
            <DialogDescription className='flex flex-col gap-8'>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className='flex gap-4'>
            <Button
              variant='destructive'
              className='flex items-center space-x-1'
              onClick={() => deleteUser({ user_id: userID })}
            >
              <UserMinus />
              <span>Delete User</span>
            </Button>
            <DialogClose asChild>
              <Button variant='ghost' className='flex items-center space-x-1'>
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
