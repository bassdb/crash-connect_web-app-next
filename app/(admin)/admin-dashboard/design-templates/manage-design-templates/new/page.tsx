'use client'

// UI imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// react imports
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

// packages imports
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// state imports
import { useToast } from '@/hooks/use-toast'

// server logic imports
import { actionInitDesignTemplate } from '@/app/(editors)/_server/actions'

// client logic imports

const initSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(120, 'Max. 120 Zeichen'),
})

type InitFormData = z.infer<typeof initSchema>

export default function NewDesignTemplateInitPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InitFormData>({
    resolver: zodResolver(initSchema),
    mode: 'onChange',
    defaultValues: { name: '' },
  })

  const handleSubmit = (data: InitFormData) => {
    setIsSubmitting(true)
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.append('name', data.name.trim())
        const result = await actionInitDesignTemplate(fd)
        if ((result as any)?.error) {
          toast({
            title: 'Fehler',
            description: (result as any).message || 'Template konnte nicht erstellt werden.',
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }

        const createdId = (result as any)?.id
        toast({
          title: 'Erstellt',
          description: 'Neues Template wurde initialisiert.',
        })

        if (createdId) {
          router.push(`/create-design-template?designTemplateId=${createdId}`)
        } else {
          router.push('/admin-dashboard/design-templates/manage-design-templates')
        }
      } catch (err) {
        toast({
          title: 'Fehler',
          description: 'Unerwarteter Fehler beim Erstellen.',
          variant: 'destructive',
        })
        setIsSubmitting(false)
      }
    })
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Neues Design-Template</h1>
        <p className='text-sm text-muted-foreground'>
          Initialisieren Sie ein neues Template. Mindestens ein Name ist erforderlich.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='relative'>
              <div className='w-full rounded-lg border bg-gray-50 dark:bg-gray-900 flex items-center justify-center aspect-[9/16]'>
                <div className='text-center'>
                  <div className='mx-auto mb-2 h-8 w-8 rounded-md border border-dashed border-gray-300' />
                  <p className='text-sm text-gray-500'>Kein Vorschaubild verfügbar</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Template Metadaten</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Name *</Label>
                  <Input
                    id='name'
                    placeholder='Template-Name eingeben'
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className='text-sm text-red-600'>{form.formState.errors.name.message}</p>
                  )}
                </div>

                <Separator />

                <div className='flex gap-2'>
                  <Button
                    type='submit'
                    disabled={isSubmitting || isPending || !form.formState.isValid}
                  >
                    {isSubmitting || isPending ? 'Erstelle…' : 'Template erstellen'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
