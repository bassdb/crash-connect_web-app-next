'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2, Mail, Shield, Crown, User } from 'lucide-react'
import { inviteTeamMember } from '@/app/(public)/teams/_actions'

interface InviteMemberFormProps {
  teamId: string
  userRole: string
}

export function InviteMemberForm({ teamId, userRole }: InviteMemberFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as 'member' | 'admin' | 'owner',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setWarning(null)

    // Client-side validation
    if (!formData.email.trim()) {
      setError('E-Mail-Adresse ist erforderlich')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      setIsLoading(false)
      return
    }

    try {
      const result: any = await inviteTeamMember({
        team_id: teamId,
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.warning) {
        setWarning(result.warning)
      }

      setSuccess(true)
      setFormData({ email: '', role: 'member' })

      // Auto-refresh after 2 seconds
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error('Error inviting member:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className='w-4 h-4' />
      case 'admin':
        return <Shield className='w-4 h-4' />
      case 'member':
        return <User className='w-4 h-4' />
      default:
        return <User className='w-4 h-4' />
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Vollzugriff auf alle Team-Funktionen'
      case 'admin':
        return 'Kann Mitglieder verwalten und Einstellungen ändern'
      case 'member':
        return 'Standard-Zugriff auf Team-Ressourcen'
      default:
        return ''
    }
  }

  if (success) {
    return (
      <Alert className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'>
        <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
        <AlertDescription className='text-green-800 dark:text-green-200'>
          <div className='space-y-1'>
            <p>Einladung erfolgreich gesendet!</p>
            {warning && (
              <p className='text-yellow-700 dark:text-yellow-300 text-sm'>{warning}</p>
            )}
            <p className='text-sm'>Die Seite wird automatisch aktualisiert...</p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {warning && (
        <Alert className='border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'>
          <AlertCircle className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
          <AlertDescription className='text-yellow-800 dark:text-yellow-200'>
            {warning}
          </AlertDescription>
        </Alert>
      )}

      <div className='space-y-2'>
        <Label htmlFor='email' className='flex items-center gap-2'>
          <Mail className='w-4 h-4' />
          E-Mail-Adresse
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='benutzer@beispiel.de'
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
          disabled={isLoading}
          className='transition-colors focus:ring-2 focus:ring-primary/20'
        />
        <p className='text-xs text-muted-foreground'>
          Die Einladung wird an diese E-Mail-Adresse gesendet
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='role'>Rolle</Label>
        <Select
          value={formData.role}
          onValueChange={(value: 'member' | 'admin' | 'owner') =>
            setFormData((prev) => ({ ...prev, role: value }))
          }
          disabled={isLoading}
        >
          <SelectTrigger className='transition-colors focus:ring-2 focus:ring-primary/20 cursor-pointer'>
            <div className="flex items-center gap-2">
              {/* Optional: Icon für aktuelle Auswahl anzeigen */}
              {/* Sie können hier ein dynamisches Icon basierend auf dem Wert anzeigen, falls gewünscht */}
              <SelectValue placeholder='Rolle auswählen' />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='member' className="cursor-pointer">
              <div className="flex items-center gap-3">
                <User className='w-5 h-5 shrink-0' />
                <div className="flex flex-col items-start">
                  <span className='font-medium leading-tight'>Mitglied</span>
                  <span className='text-xs text-muted-foreground leading-tight'>
                    Standard-Zugriff auf Team-Ressourcen
                  </span>
                </div>
              </div>
            </SelectItem>
            <SelectItem value='admin' className="cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className='w-5 h-5 shrink-0' />
                <div className="flex flex-col items-start">
                  <span className='font-medium leading-tight'>Admin</span>
                  <span className='text-xs text-muted-foreground leading-tight'>
                    Kann Mitglieder verwalten und Einstellungen ändern
                  </span>
                </div>
              </div>
            </SelectItem>
            {userRole === 'owner' && (
              <SelectItem value='owner' className="cursor-pointer">
                <div className="flex items-center gap-3">
                  <Crown className='w-5 h-5 shrink-0' />
                  <div className="flex flex-col items-start">
                    <span className='font-medium leading-tight'>Besitzer</span>
                    <span className='text-xs text-muted-foreground leading-tight'>
                      Vollzugriff auf alle Team-Funktionen
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <p className='text-xs text-muted-foreground'>
          {getRoleDescription(formData.role)}
        </p>
      </div>

      <Button 
        type='submit' 
        className='w-full gap-2' 
        disabled={isLoading || !formData.email.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className='w-4 h-4 animate-spin' />
            Einladung wird gesendet...
          </>
        ) : (
          <>
            <Mail className='w-4 h-4' />
            Einladung senden
          </>
        )}
      </Button>
    </form>
  )
}
