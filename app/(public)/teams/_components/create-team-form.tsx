'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createTeam } from '@/app/(public)/teams/_actions'
import { TeamLogoUpload } from './team-logo-upload'
import { TeamColorSelector } from './team-color-selector'
import { Loader2, Users, Building2 } from 'lucide-react'
import type { TeamColor } from '@/types/teams-types'

// Form validation schema
const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team-Name ist erforderlich')
    .max(255, 'Name darf maximal 255 Zeichen haben'),
  description: z.string().max(500, 'Beschreibung darf maximal 500 Zeichen haben').optional(),
  slug: z
    .string()
    .min(1, 'Slug ist erforderlich')
    .max(100, 'Slug darf maximal 100 Zeichen haben')
    .regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten'),
})

type CreateTeamFormData = z.infer<typeof createTeamSchema>

export function CreateTeamForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [tempTeamId, setTempTeamId] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<TeamColor[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
    },
  })

  // Auto-generate slug from name
  const watchedName = watch('name')
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Update slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = generateSlug(name)
    setValue('name', name)
    setValue('slug', slug)
  }

  const handleLogoUpdate = (url: string) => {
    setLogoUrl(url)
  }

  const handleLogoRemove = () => {
    setLogoUrl(null)
    setLogoFile(null)
  }

  const handleLogoFileSelect = (file: File) => {
    setLogoFile(file)
  }

  const onSubmit = async (data: CreateTeamFormData) => {
    setIsSubmitting(true)

    try {
      // Create team first
      const result = await createTeam({
        name: data.name,
        description: data.description || '',
        slug: data.slug,
        team_logo_url: logoUrl || '',
        logo_file: logoFile,
        colors: selectedColors,
      })

      if (result && typeof result === 'object' && 'error' in result && result.error) {
        toast({
          title: 'Fehler beim Erstellen des Teams',
          description: typeof result.error === 'string' ? result.error : 'Unbekannter Fehler',
          variant: 'destructive',
        })
        return
      }

      if (result && typeof result === 'object' && 'team_id' in result && result.team_id) {
        toast({
          title: 'Team erfolgreich erstellt',
          description: `Das Team "${data.name}" wurde erfolgreich erstellt.`,
        })

        // Redirect to the new team page
        router.push(`/teams/${result.team_id}`)
      }
    } catch (error) {
      console.error('Error creating team:', error)
      toast({
        title: 'Unerwarteter Fehler',
        description: 'Beim Erstellen des Teams ist ein Fehler aufgetreten.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Building2 className='w-5 h-5' />
          Neues Team erstellen
        </CardTitle>
        <CardDescription>
          Erstellen Sie ein neues Team und laden Sie ein Logo hoch. Alle Teammitglieder können
          später hinzugefügt werden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Team Name */}
          <div className='space-y-2'>
            <Label htmlFor='name'>Team Name *</Label>
            <Input
              id='name'
              {...register('name')}
              onChange={handleNameChange}
              placeholder='z.B. FC Bayern München'
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
          </div>

          {/* Team Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Beschreibung</Label>
            <Textarea
              id='description'
              {...register('description')}
              placeholder='Beschreiben Sie Ihr Team...'
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>{errors.description.message}</p>
            )}
          </div>

          {/* Team Slug */}
          <div className='space-y-2'>
            <Label htmlFor='slug'>Team Slug *</Label>
            <div className='relative'>
              <span className='absolute left-3 top-3 text-muted-foreground'>teams.com/</span>
              <Input
                id='slug'
                {...register('slug')}
                className={`pl-20 ${errors.slug ? 'border-red-500' : ''}`}
                placeholder='fc-bayern-muenchen'
              />
            </div>
            {errors.slug && <p className='text-sm text-red-500'>{errors.slug.message}</p>}
            <p className='text-xs text-muted-foreground'>
              Der Slug wird für die URL verwendet und kann später nicht geändert werden.
            </p>
          </div>

          {/* Team Logo Upload */}
          <div className='space-y-2'>
            <TeamLogoUpload
              teamId={tempTeamId || 'temp'}
              currentLogoUrl={logoUrl}
              onLogoUpdate={handleLogoUpdate}
              onLogoRemove={handleLogoRemove}
              onFileSelect={handleLogoFileSelect}
            />
            <p className='text-xs text-muted-foreground'>
              Laden Sie ein Logo für Ihr Team hoch. Empfohlen: 512x512px, PNG oder JPG.
            </p>
          </div>

          {/* Team Color Selector */}
          <div className='space-y-2'>
            <TeamColorSelector onColorsChange={setSelectedColors} initialColors={selectedColors} />
          </div>

          {/* Submit Button */}
          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Team wird erstellt...
              </>
            ) : (
              <>
                <Users className='w-4 h-4 mr-2' />
                Team erstellen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
