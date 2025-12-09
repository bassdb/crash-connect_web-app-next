'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Mail, MoreHorizontal, Settings, X } from 'lucide-react'
import { revokeTeamInvitation, updateTeamInvitationRole, resendTeamInvitationEmail } from '@/app/(public)/teams/_actions'
import { toast } from 'sonner'

interface PendingInvitationActionsProps {
  invitationId: string
  currentRole: 'owner' | 'admin' | 'member'
}

export function PendingInvitationActions({ invitationId, currentRole }: PendingInvitationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRevoke = async () => {
    setIsLoading(true)
    const result = await revokeTeamInvitation({ invitation_id: invitationId })
    setIsLoading(false)
    if (result?.data?.success) {
      toast.success('Einladung widerrufen')
      router.refresh()
    } else {
      toast.error(result?.data?.error || 'Fehler beim Widerrufen')
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    const result = await resendTeamInvitationEmail({ invitation_id: invitationId })
    setIsLoading(false)
    if (result?.data?.success) {
      toast.success('Einladung erneut gesendet')
      router.refresh()
    } else {
      toast.error(result?.data?.error || 'Fehler beim Senden')
    }
  }

  const updateRole = async (role: 'owner' | 'admin' | 'member') => {
    setIsLoading(true)
    const result = await updateTeamInvitationRole({ invitation_id: invitationId, role })
    setIsLoading(false)
    if (result?.data?.success) {
      toast.success('Rolle aktualisiert')
      router.refresh()
    } else {
      toast.error(result?.data?.error || 'Fehler beim Aktualisieren der Rolle')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' disabled={isLoading}>
          <MoreHorizontal className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='gap-2' onClick={handleResend} disabled={isLoading}>
          <Mail className='w-4 h-4' />
          Einladung erneut senden
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-2' onClick={() => updateRole('member')} disabled={isLoading || currentRole === 'member'}>
          <Settings className='w-4 h-4' />
          Rolle: Mitglied
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-2' onClick={() => updateRole('admin')} disabled={isLoading || currentRole === 'admin'}>
          <Settings className='w-4 h-4' />
          Rolle: Admin
        </DropdownMenuItem>
        <DropdownMenuItem className='gap-2' onClick={() => updateRole('owner')} disabled={isLoading || currentRole === 'owner'}>
          <Settings className='w-4 h-4' />
          Rolle: Besitzer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='gap-2 text-destructive' onClick={handleRevoke} disabled={isLoading}>
          <X className='w-4 h-4' />
          Einladung widerrufen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


