'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createExampleTeam, type CreateExampleTeamInput } from '../_actions'

export default function CreateExampleTeamForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateExampleTeamInput>({
    name: '',
    description: '',
    slug: '',
    status: 'active',
    is_default: false,
    other_creators_can_use_example_team: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    handleInputChange('name', name)
    // Auto-generate slug
    handleInputChange('slug', generateSlug(name))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Team-Name ist erforderlich')
      return false
    }
    if (!formData.slug.trim()) {
      toast.error('Slug ist erforderlich')
      return false
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten')
      return false
    }
    return true
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create team first
      const result = await createExampleTeam({
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        status: formData.status,
        is_default: formData.is_default,
        other_creators_can_use_example_team: formData.other_creators_can_use_example_team,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success('Standard-Team erfolgreich erstellt')
      router.push('/admin-dashboard/team-accounts/manage-example-teams')
      router.refresh()
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error(
        `Fehler beim Erstellen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-6 max-w-4xl'>
      <div className='flex items-center gap-4'>
        <Link href='/admin-dashboard/team-accounts/manage-example-teams'>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>

      <form onSubmit={onSubmit} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Team-Informationen</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Team-Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder='Team-Name eingeben'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='slug'>Slug *</Label>
                <Input
                  id='slug'
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder='team-slug'
                  pattern='^[a-z0-9-]+$'
                  title='Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt'
                  required
                />
                <p className='text-xs text-muted-foreground'>
                  URL-freundlicher Bezeichner für das Team
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Beschreibung</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder='Beschreibung des Teams...'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleInputChange('status', value as 'active' | 'inactive' | 'archived')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Aktiv</SelectItem>
                    <SelectItem value='inactive'>Inaktiv</SelectItem>
                    <SelectItem value='archived'>Archiviert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='is_default'>Standard-Team</Label>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='is_default'
                    checked={formData.is_default}
                    onCheckedChange={(checked) => handleInputChange('is_default', checked)}
                  />
                  <Label htmlFor='is_default'>{formData.is_default ? 'Ja' : 'Nein'}</Label>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Beispiel Teams können für Design Templates verwendet werden um ein Design
                  exemplarisch zu zeigen. Das Design mit dm ausgewählten Team wird als Preview Bild
                  im Design Katalog verwendet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team-Berechtigungen Sektion */}
        <Card>
          <CardHeader>
            <CardTitle>Team-Berechtigungen</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='other_creators_can_use_example_team'>
                Andere Creator können dieses Beispiel-Team verwenden
              </Label>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='other_creators_can_use_example_team'
                  checked={formData.other_creators_can_use_example_team}
                  onCheckedChange={(checked) =>
                    handleInputChange('other_creators_can_use_example_team', checked)
                  }
                />
                <Label htmlFor='other_creators_can_use_example_team'>
                  {formData.other_creators_can_use_example_team ? 'Ja' : 'Nein'}
                </Label>
              </div>
              <p className='text-xs text-muted-foreground'>
                Wenn aktiviert, können andere Creator dieses Beispiel-Team für ihre Design-Templates
                verwenden
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team-Logo</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Lade im nächsten Schritt im Team-Editor ein Logo hoch.
            </p>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col items-start justify-center space-y-2'>
              <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-8 w-8 text-muted-foreground'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12'
                  />
                </svg>
              </div>
              <span className='text-xs text-muted-foreground'>Placeholder</span>
            </div>
          </CardContent>
        </Card>

        <div className='flex items-center justify-between'>
          <Link href='/admin-dashboard/team-accounts/manage-example-teams'>
            <Button variant='outline' type='button'>
              Abbrechen
            </Button>
          </Link>

          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Wird erstellt...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Standard-Team erstellen
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
