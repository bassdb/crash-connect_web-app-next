'use client'

import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/server/actions/auth-actions'

export default function SignOutButton() {
  return (
    <button
      className='w-full flex items-center justify-start text-sm'
      onClick={() => {
        signOutAction()
      }}
    >
      <LogOut size={14} className='mr-3 transition-all duration-200 group-hover:translate-x-1' />
      Sign Out
    </button>
  )
}
