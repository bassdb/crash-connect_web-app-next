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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { updateExampleTeam, type UpdateExampleTeamInput } from '../../_actions'
import { updateTeamLogoUrl } from '../../_actions/update-team-logo-url'
import { uploadTeamLogoToSupabase } from '../../_actions/upload-team-logo-to-supabase'
import { updateExampleTeamPermission } from '../../_actions'
import { AdminTeamColorPicker } from './admin-team-color-picker'
import type { TeamColor } from '@/types/teams-types'

interface Team {
  id: string
  name: string
  description: string | null
  slug: string
  team_logo_url: string | null
  is_default: boolean
  status: 'active' | 'inactive' | 'archived'
  other_creators_can_use_example_team: boolean
  colors: TeamColor[]
  created_at: string
  updated_at: string
}

interface EditExampleTeamFormProps {
  team: Team
}

export default function EditExampleTeamForm({ team }: EditExampleTeamFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<UpdateExampleTeamInput>({
    id: team.id,
    name: team.name,
    description: team.description || '',
    slug: team.slug,
    status: team.status,
    is_default: team.is_default,
    team_logo_url: team.team_logo_url || '',
    colors: team.colors || [],
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(team.team_logo_url)
  const [teamColors, setTeamColors] = useState<TeamColor[]>(team.colors || [])
  const [permissionValue, setPermissionValue] = useState<boolean>(
    team.other_creators_can_use_example_team || false
  )

  const handleInputChange = (field: keyof UpdateExampleTeamInput, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleColorsUpdate = (colors: TeamColor[]) => {
    setTeamColors(colors)
    setFormData((prev) => ({
      ...prev,
      colors: colors,
    }))
  }

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo-Datei ist zu groß. Maximale Größe: 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wählen Sie eine Bilddatei aus')
      return
    }

    try {
      setIsUploading(true)
      setLogoFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      const uploadResult = await uploadTeamLogoToSupabase(team.id, file)
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload fehlgeschlagen')
      }
      console.log('uploadResult', uploadResult)
      const URLupdateResult = await updateTeamLogoUrl(team.id, uploadResult.url)
      if (!URLupdateResult.success) {
        console.log('URLupdateResult', URLupdateResult)
        throw new Error(URLupdateResult.error || 'Avatar-URL konnte nicht gespeichert werden')
      }
      setFormData((prev) => ({ ...prev, team_logo_url: uploadResult.url || '' }))
      toast.success('Logo erfolgreich hochgeladen')
      router.refresh()
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error(
        `Fehler beim Hochladen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      )
    } finally {
      setIsUploading(false)
    }
  }

  const removeLogo = async () => {
    try {
      setIsUploading(true)
      setLogoFile(null)
      setLogoPreview(null)
      setFormData((prev) => ({ ...prev, team_logo_url: '' }))
      const result = await updateTeamLogoUrl(team.id, '')
      if (!result.success) {
        throw new Error(result.error || 'Avatar-URL konnte nicht entfernt werden')
      }
      toast.success('Logo entfernt')
      router.refresh()
    } catch (error) {
      console.error('Error removing logo:', error)
      toast.error(
        `Fehler beim Entfernen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      )
    } finally {
      setIsUploading(false)
    }
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
    // Auto-generate slug if it hasn't been manually changed
    if (formData.slug === generateSlug(team.name)) {
      handleInputChange('slug', generateSlug(name))
    }
  }

  const onSubmitTeamInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update team data using server action
      const result = await updateExampleTeam(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success('Team-Informationen erfolgreich aktualisiert')
      router.refresh()
    } catch (error) {
      console.error('Error updating team:', error)
      toast.error(
        `Fehler beim Aktualisieren: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePermissionChange = async (checked: boolean) => {
    try {
      const result = await updateExampleTeamPermission({
        id: team.id,
        other_creators_can_use_example_team: checked,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update local state
      setPermissionValue(checked)

      toast.success(
        `Einstellung erfolgreich geändert: Andere Creator ${checked ? 'können' : 'können nicht mehr'} dieses Beispiel-Team verwenden`
      )
    } catch (error) {
      console.error('Error updating team permission:', error)
      toast.error(
        `Fehler beim Aktualisieren der Berechtigung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      )

      // Revert local state on error
      setPermissionValue(!checked)
    }
  }

  return (
    <div className='space-y-6 max-w-7xl'>
      <div className='flex items-center gap-4'>
        <Link href='/admin-dashboard/team-accounts/manage-example-teams'>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>

      {/* Team-Berechtigungen Sektion - Jetzt an erster Stelle */}
      <Card>
        <CardHeader>
          <CardTitle>Team-Berechtigungen</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Label htmlFor='other_creators_can_use_example_team'>
                Andere Creator können dieses Beispiel-Team verwenden
              </Label>
              <p className='text-xs text-muted-foreground'>
                Wenn aktiviert, können andere Creator dieses Beispiel-Team für ihre Design-Templates
                verwenden
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='other_creators_can_use_example_team'
                checked={permissionValue}
                onCheckedChange={handlePermissionChange}
              />
              <Label htmlFor='other_creators_can_use_example_team'>
                {permissionValue ? 'Ja' : 'Nein'}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team-Logo Sektion */}
      <Card>
        <CardHeader>
          <CardTitle>Team-Logo</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-8'>
            <div className='relative'>
              <Avatar className='h-32 w-32'>
                <AvatarImage src={logoPreview || ''} alt={formData.name} />
                <AvatarFallback className='bg-primary text-primary-foreground text-2xl'>
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Löschen-Button als kleines Icon in der oberen linken Ecke */}
              {logoPreview && (
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  className='absolute -top-2 -left-2 w-6 h-6 p-0 rounded-full shadow-md'
                  onClick={removeLogo}
                  title='Logo entfernen'
                >
                  <X className='w-3 h-3' />
                </Button>
              )}
            </div>

            <div className='space-y-4'>
              <Label htmlFor='logo'>{logoPreview ? 'Upload new Logo' : 'Upload a Logo'}</Label>
              <p className='text-xs text-muted-foreground'>PNG, JPG oder GIF bis 5MB</p>
              <Input
                id='logo'
                type='file'
                accept='image/*'
                onChange={handleLogoChange}
                className='max-w-xs'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team-Informationen Formular */}
      <form onSubmit={onSubmitTeamInfo}>
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
                value={formData.description || ''}
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
                  Standard-Teams werden neuen Benutzern als Beispiele angezeigt
                </p>
              </div>
            </div>

            {/* Submit Button für Team-Informationen - jetzt in der Karte und links */}
            <div className='flex items-center justify-start pt-4'>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Team-Informationen speichern
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Team-Farben Sektion - Separate Komponente mit eigenem Submit */}
      <AdminTeamColorPicker
        teamId={team.id}
        initialColors={team.colors || []}
        onColorsUpdate={handleColorsUpdate}
      />

      {/* Abbrechen Button */}
      <div className='flex items-center justify-start'>
        <Link href='/admin-dashboard/team-accounts/manage-example-teams'>
          <Button variant='outline' type='button'>
            Abbrechen
          </Button>
        </Link>
      </div>
    </div>
  )
}
