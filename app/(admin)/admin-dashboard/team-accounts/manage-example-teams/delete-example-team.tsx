'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteExampleTeam } from '../_actions'

interface DeleteExampleTeamProps {
  teamId: string
  teamName: string
}

export default function DeleteExampleTeam({ teamId, teamName }: DeleteExampleTeamProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteExampleTeam({ teamId, teamName })

      if (!result.success) {
        toast.error(`Fehler beim Löschen: ${result.error}`, { style: { background: '#dc2626', color: '#fff' } })
        throw new Error(result.error)
      }

      toast.success(`Standard-Team "${teamName}" wurde erfolgreich gelöscht`)
      router.refresh()
      
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error(`Fehler beim Löschen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <strong>Standard-Team &quot;{teamName}&quot; löschen</strong>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie das Standard-Team "{teamName}" löschen möchten?
            <br /><br />
            <strong>Diese Aktion kann nicht rückgängig gemacht werden.</strong>
            <br />
            Alle Team-Mitglieder und Einladungen werden ebenfalls gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gelöscht...
              </>
            ) : (
              'Team löschen'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
