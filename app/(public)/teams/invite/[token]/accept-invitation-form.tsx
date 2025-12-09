'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { acceptTeamInvitation } from '@/app/(public)/teams/_actions'

interface AcceptInvitationFormProps {
  token: string
  teamId: string
}

export function AcceptInvitationForm({ token, teamId }: AcceptInvitationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAcceptInvitation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await acceptTeamInvitation({ token })

      if (result?.validationErrors) {
        setError(result.validationErrors.token?._errors?.[0] || 'Validierungsfehler')
        return
      }

      if (result?.serverError) {
        setError(result.serverError)
        return
      }

      if (result?.data?.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/teams/${teamId}`)
        }, 2000)
      } else if (result?.data?.error) {
        setError(result.data.error)
      } else if (result?.data) {
        // Direkte Erfolgsbehandlung für den Fall, dass data direkt true ist
        setSuccess(true)
        setTimeout(() => {
          router.push(`/teams/${teamId}`)
        }, 2000)
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'>
        <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
        <AlertDescription className='text-green-800 dark:text-green-200'>
          Einladung erfolgreich angenommen! Sie werden zum Team weitergeleitet...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-4'>
      {error && (
        <Alert
          variant='destructive'
          className='border-destructive bg-destructive/10 text-destructive'
        >
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleAcceptInvitation} disabled={isLoading} className='w-full gap-2'>
        {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
        <CheckCircle className='w-4 h-4' />
        Einladung annehmen
      </Button>
    </div>
  )
}
