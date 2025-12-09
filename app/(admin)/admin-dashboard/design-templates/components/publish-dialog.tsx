'use client'

// UI imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Globe, Loader2 } from 'lucide-react'

// server logic imports
import { publishTemplate } from '../_server-actions/design-templates'

// component imports
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

interface PublishDialogProps {
  templateId: string
  templateName: string
  children: React.ReactNode
}

export function PublishDialog({ templateId, templateName, children }: PublishDialogProps) {
  const [open, setOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  const { execute, isPending } = useAction(publishTemplate, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Template erfolgreich veröffentlicht!')
        setOpen(false)
        setReviewNotes('')
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Fehler beim Veröffentlichen des Templates')
    },
  })

  const handlePublish = () => {
    execute({
      id: templateId,
      reviewNotes: reviewNotes || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Template veröffentlichen
          </DialogTitle>
          <DialogDescription>
            Möchten Sie das Template <strong>"{templateName}"</strong> direkt veröffentlichen? 
            Das Template wird sofort für alle Benutzer sichtbar und kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="publish-notes">
              Veröffentlichungsnotizen (optional)
            </Label>
            <Textarea
              id="publish-notes"
              placeholder="Fügen Sie hier Notizen zur Veröffentlichung hinzu..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Veröffentliche...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Veröffentlichen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

