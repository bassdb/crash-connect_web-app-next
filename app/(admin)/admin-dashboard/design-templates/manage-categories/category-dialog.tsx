"use client"
import { useState } from 'react'

// UI imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

type CategoryDialogProps = {
  mode: 'create' | 'edit'
  action: (formData: FormData) => Promise<void>
  initialValues?: {
    id?: string
    name?: string
    description?: string
    color?: string
    icon?: string
    is_active?: boolean
  }
  children: React.ReactNode
}

export default function CategoryDialog({ mode, action, initialValues, children }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await action(formData)
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Neue Kategorie erstellen' : 'Kategorie bearbeiten'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className='space-y-4'>
          {mode === 'edit' && initialValues?.id && (
            <input type='hidden' name='id' defaultValue={initialValues.id} />
          )}

          <div className='grid gap-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' name='name' required defaultValue={initialValues?.name ?? ''} placeholder='z. B. Social Templates' />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='description'>Beschreibung</Label>
            <Textarea id='description' name='description' defaultValue={initialValues?.description ?? ''} placeholder='Kurzbeschreibung' />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='color'>Farbe (Hex)</Label>
            <Input id='color' name='color' defaultValue={initialValues?.color ?? ''} placeholder='#FF9900' />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='icon'>Icon</Label>
            <Input id='icon' name='icon' defaultValue={initialValues?.icon ?? ''} placeholder='z. B. star' />
          </div>

          {mode === 'edit' && (
            <div className='flex items-center gap-2'>
              <Checkbox id='is_active' name='is_active' defaultChecked={initialValues?.is_active ?? true} />
              <Label htmlFor='is_active'>Aktiv</Label>
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Speichern…' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



