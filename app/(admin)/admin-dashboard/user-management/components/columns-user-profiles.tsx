'use client'

import { ColumnDef } from '@tanstack/react-table'
import { UserProfileWithRole } from '@/types/supabase-types'
import { deleteUser } from '@/server/actions/admin-usermanagement/admin-deletes-user'
import { MoreHorizontal, UserMinus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed' | 'completed'
  email: string
}

export const columns: ColumnDef<UserProfileWithRole>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'username',
    header: 'Username',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },

  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const userID = row.original.profile_id
      const [isOpen, setIsOpen] = useState(false)

      return (
        <div className='flex justify-end'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild className='hover:cursor-pointer'>
                <Link href={`/admin-dashboard/user-management/edit-user?id=${userID}`}>
                  View user
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    className='hover:cursor-pointer'
                    onSelect={(e) => {
                      e.preventDefault()
                      setIsOpen(true)
                    }}
                  >
                    Delete User
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure to delete this user?</DialogTitle>
                    <DialogDescription className='flex flex-col gap-8'>
                      This action cannot be undone. This will permanently delete your account and
                      remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='flex gap-4'>
                    <Button
                      variant='destructive'
                      className='flex items-center space-x-1'
                      onClick={() => {
                        deleteUser({ user_id: userID })
                        setIsOpen(false)
                      }}
                    >
                      <UserMinus />
                      <span>Delete User</span>
                    </Button>
                    <DialogClose asChild>
                      <Button
                        variant='ghost'
                        className='flex items-center space-x-1'
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenuItem className='hover:cursor-pointer'>Ban User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
