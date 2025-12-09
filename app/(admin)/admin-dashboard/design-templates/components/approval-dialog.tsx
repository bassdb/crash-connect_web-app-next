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
import { CheckCircle, Loader2 } from 'lucide-react'

// server logic imports
import { approveTemplate } from '../_server-actions/design-templates'

// component imports
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

interface ApprovalDialogProps {
  templateId: string
  templateName: string
  children: React.ReactNode
}

export function ApprovalDialog({ templateId, templateName, children }: ApprovalDialogProps) {
  const [open, setOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  const { execute, isPending } = useAction(approveTemplate, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Template erfolgreich genehmigt!')
        setOpen(false)
        setReviewNotes('')
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Fehler beim Genehmigen des Templates')
    },
  })

  const handleApprove = () => {
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
            <CheckCircle className="h-5 w-5 text-green-600" />
            Template genehmigen
          </DialogTitle>
          <DialogDescription>
            Möchten Sie das Template <strong>"{templateName}"</strong> genehmigen? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="review-notes">
              Bewertungsnotizen (optional)
            </Label>
            <Textarea
              id="review-notes"
              placeholder="Fügen Sie hier Notizen zur Genehmigung hinzu..."
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
            onClick={handleApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Genehmige...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Genehmigen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

