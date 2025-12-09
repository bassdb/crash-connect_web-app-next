import { createClient } from '@/server/supabase/client'
import { FileObject } from '@supabase/storage-js'

export const supabase = createClient()

export type TeamAssetType = 'logo' | 'asset' | 'preview'

export interface UploadResult {
  data: any | null
  publicUrl: string
  path: string
}

export interface DeleteResult {
  success: boolean
  error?: string
}

export async function uploadTeamAsset(
  teamId: string,
  file: File,
  assetType: TeamAssetType = 'asset',
  subfolder?: string
): Promise<UploadResult | null> {
  try {
    // Validate file
    if (!file || file.size === 0) {
      throw new Error('Datei ist leer oder ungültig')
    }

    // Validate file size (max 10MB for assets, 5MB for logos)
    const maxSize = assetType === 'logo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`Datei zu groß. Maximale Größe: ${maxSize / (1024 * 1024)}MB`)
    }

    // Validate file type
    const allowedTypes = {
      logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      asset: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
      preview: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    }

    if (!allowedTypes[assetType].includes(file.type)) {
      throw new Error(`Ungültiger Dateityp. Erlaubt: ${allowedTypes[assetType].join(', ')}`)
    }

    // Generate filename based on asset type
    let fileName: string
    let uploadPath: string

    if (assetType === 'logo') {
      // For logos, use consistent naming like admin version
      const fileExt = file.name.includes('.')
        ? file.name.split('.').pop()
        : file.type.split('/')[1] || 'png'
      fileName = `${teamId}-logo.${fileExt}`
      uploadPath = `teams/${teamId}/logo/${fileName}`
    } else {
      // For other assets, use unique naming with timestamp
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      fileName = `${timestamp}_${randomString}.${fileExtension}`

      if (assetType === 'preview') {
        uploadPath = `teams/${teamId}/previews/${fileName}`
      } else {
        uploadPath = subfolder
          ? `teams/${teamId}/assets/${subfolder}/${fileName}`
          : `teams/${teamId}/assets/${fileName}`
      }
    }

    // Upload file with metadata
    const { data, error } = await supabase.storage.from('team-assets').upload(uploadPath, file, {
      cacheControl: '3600',
      upsert: assetType === 'logo', // Allow overwriting for logos
      contentType: file.type || 'image/png',
      metadata: {
        teamId,
        assetType,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Upload fehlgeschlagen: ${error.message}`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('team-assets').getPublicUrl(uploadPath)

    // Überprüfe, ob publicUrl vorhanden ist
    if (!publicUrl) {
      console.error('Fehler beim Abrufen der öffentlichen URL für den Team-Asset:', uploadPath)
      throw new Error('Öffentliche URL konnte nicht abgerufen werden')
    }

    return { data, publicUrl, path: uploadPath }
  } catch (error) {
    console.error('Fehler beim Hochladen des Team-Assets:', error)
    return null
  }
}

export async function deleteTeamAsset(path: string): Promise<DeleteResult> {
  try {
    if (!path) {
      return { success: false, error: 'Pfad ist erforderlich' }
    }

    const { error } = await supabase.storage.from('team-assets').remove([path])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting team asset:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

export async function listTeamAssets(
  teamId: string,
  assetType?: TeamAssetType
): Promise<FileObject[]> {
  try {
    let path = `teams/${teamId}`

    if (assetType) {
      path += `/${assetType === 'asset' ? 'assets' : assetType}`
    }

    const { data, error } = await supabase.storage.from('team-assets').list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      console.error('List error:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error listing team assets:', error)
    return []
  }
}

export async function getTeamAssetUrl(path: string): Promise<string> {
  try {
    const { data } = supabase.storage.from('team-assets').getPublicUrl(path)
    return data.publicUrl
  } catch (error) {
    console.error('Error getting asset URL:', error)
    return ''
  }
}

export async function getTeamAssetMetadata(path: string) {
  try {
    const { data, error } = await supabase.storage
      .from('team-assets')
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop(),
      })

    if (error || !data || data.length === 0) {
      return null
    }

    return data[0]
  } catch (error) {
    console.error('Error getting asset metadata:', error)
    return null
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType === 'application/pdf') return '📄'
  if (fileType.startsWith('video/')) return '🎥'
  if (fileType.startsWith('audio/')) return '��'
  return '📁'
}
