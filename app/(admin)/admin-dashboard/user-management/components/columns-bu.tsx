'use client'

import { ColumnDef } from '@tanstack/react-table'
import { SupabaseUserProfileWithRole } from '@/types/supabase-types'

import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed' | 'completed'
  email: string
}

export const columns: ColumnDef<SupabaseUserProfileWithRole>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },

  {
    accessorKey: 'last_sign_in_at',
    header: 'Last sign-in',
    // header: () => <div className='text-right'>Amount</div>,
    cell: ({ row }) => {
      console.log(row.getValue('last_sign_in_at'))
      const date = new Date(row.getValue('last_sign_in_at'))

      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      return <div className=''>{formatted}</div>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const payment = row.original

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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
