'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { uploadTeamAsset, deleteTeamAsset } from '@/app/(public)/teams/_lib/team-assets'
import { updateTeamLogo, removeTeamLogo } from '@/app/(public)/teams/_actions'
import { useRouter } from 'next/navigation'

interface TeamLogoUploadProps {
  teamId: string
  currentLogoUrl?: string | null
  onLogoUpdate?: (url: string) => void
  onLogoRemove?: () => void
  onFileSelect?: (file: File) => void
}

export function TeamLogoUpload({
  teamId,
  currentLogoUrl,
  onLogoUpdate,
  onLogoRemove,
  onFileSelect,
}: TeamLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ungültiger Dateityp',
        description: 'Bitte wählen Sie eine Bilddatei aus (PNG, JPG, WebP).',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Datei zu groß',
        description: 'Die Datei darf maximal 5MB groß sein.',
        variant: 'destructive',
      })
      return
    }

    // Validate file dimensions (optional, but recommended)
    if (file.type.startsWith('image/')) {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl)

        // Check if image is too small
        if (img.width < 100 || img.height < 100) {
          toast({
            title: 'Bild zu klein',
            description: 'Das Bild sollte mindestens 100x100 Pixel groß sein.',
            variant: 'destructive',
          })
          return
        }

        // Check if image is too large
        if (img.width > 2048 || img.height > 2048) {
          toast({
            title: 'Bild zu groß',
            description: 'Das Bild sollte maximal 2048x2048 Pixel groß sein.',
            variant: 'destructive',
          })
          return
        }

        // If all validations pass, proceed with upload
        await performUpload(file)
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        toast({
          title: 'Ungültige Bilddatei',
          description: 'Die Datei konnte nicht als Bild gelesen werden.',
          variant: 'destructive',
        })
      }

      img.src = objectUrl
      return
    }

    // Fallback for non-image files (shouldn't happen due to accept="image/*")
    await performUpload(file)
  }

  const performUpload = async (file: File) => {
    // If we have a file select callback, use it (for form handling)
    if (onFileSelect) {
      onFileSelect(file)
      return
    }

    // Otherwise, upload immediately
    setIsUploading(true)

    try {
      // Delete old logo if exists
      if (currentLogoUrl) {
        try {
          const url = new URL(currentLogoUrl)
          const pathParts = url.pathname.split('/')
          const oldPath = pathParts.slice(5).join('/') // Remove /storage/v1/object/public/team-assets/
          if (oldPath) {
            await deleteTeamAsset(oldPath)
          }
        } catch (error) {
          console.warn('Could not parse old logo URL for deletion:', error)
          // Continue with upload even if deletion fails
        }
      }

      // Upload new logo
      const result = await uploadTeamAsset(teamId, file, 'logo')

      if (result) {
        // Update database with new logo URL
        const updateResult = await updateTeamLogo({
          team_id: teamId,
          team_logo_url: result.publicUrl,
        })

        if (updateResult && 'error' in updateResult) {
          throw new Error(updateResult.error as string)
        }

        onLogoUpdate?.(result.publicUrl)
        toast({
          title: 'Logo erfolgreich hochgeladen',
          description: 'Das Team-Logo wurde aktualisiert.',
        })

        // Refresh the page to show the updated logo
        router.refresh()
      } else {
        throw new Error('Upload fehlgeschlagen')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: 'Fehler beim Hochladen',
        description:
          error instanceof Error ? error.message : 'Das Logo konnte nicht hochgeladen werden.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogoRemove = async () => {
    if (!currentLogoUrl) return

    setIsUploading(true)

    try {
      // Delete from storage
      try {
        const url = new URL(currentLogoUrl)
        const pathParts = url.pathname.split('/')
        const oldPath = pathParts.slice(5).join('/') // Remove /storage/v1/object/public/team-assets/
        if (oldPath) {
          await deleteTeamAsset(oldPath)
        }
      } catch (error) {
        console.warn('Could not parse logo URL for deletion:', error)
        // Continue with database update even if storage deletion fails
      }

      // Update database
      const removeResult = await removeTeamLogo({
        team_id: teamId,
      })

      if (removeResult && 'error' in removeResult) {
        throw new Error(removeResult.error as string)
      }

      onLogoRemove?.()
      toast({
        title: 'Logo erfolgreich entfernt',
        description: 'Das Team-Logo wurde entfernt.',
      })

      // Refresh the page to show the updated state
      router.refresh()
    } catch (error) {
      console.error('Error removing logo:', error)
      toast({
        title: 'Fehler beim Entfernen',
        description:
          error instanceof Error ? error.message : 'Das Logo konnte nicht entfernt werden.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  return (
    <div className='space-y-4'>
      <Label htmlFor='team-logo'>Team Logo</Label>

      {/* Current Logo Display */}
      {currentLogoUrl && (
        <div className='relative inline-block'>
          <img
            src={currentLogoUrl}
            alt='Team Logo'
            className='w-24 h-24 object-cover rounded-lg border'
          />
          <Button
            type='button'
            variant='destructive'
            size='sm'
            className='absolute -top-2 -right-2 w-6 h-6 p-0'
            onClick={handleLogoRemove}
            disabled={isUploading}
          >
            <X className='w-3 h-3' />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className='flex flex-col items-center gap-2'>
          <ImageIcon className='w-8 h-8 text-muted-foreground' />
          <div className='text-xs text-muted-foreground'>
            <span className='font-medium'>Klicken Sie zum Hochladen</span> oder ziehen Sie eine
            Datei hierher
          </div>
          <div className='text-xs text-muted-foreground'>
            PNG, JPG, WebP • 100x100 bis 2048x2048px • max. 5MB
          </div>

          <Input
            id='team-logo'
            type='file'
            accept='image/*'
            onChange={handleFileInput}
            className='hidden'
            disabled={isUploading}
          />

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => document.getElementById('team-logo')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Upload className='w-4 h-4 mr-2 animate-spin' />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className='w-4 h-4 mr-2' />
                Logo auswählen
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
