'use client'

import { createClient } from '@/server/supabase/client'

export async function uploadTeamLogoToSupabase(
  teamId: string,
  file: File,
  opts?: { currentLogoUrl?: string }
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const supabase = createClient()

    // Validate file
    if (!file || file.size === 0) {
      return { success: false, error: 'Datei ist leer oder ungültig' }
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return { success: false, error: 'Logo-Datei ist zu groß. Maximale Größe: 5MB' }
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Bitte wählen Sie eine Bilddatei aus' }
    }

    // Generate filename
    const fileExt = file.name.includes('.')
      ? file.name.split('.').pop()
      : file.type.split('/')[1] || 'png'
    const fileName = `${teamId}-logo.${fileExt}`
    const filePath = `teams/${teamId}/logo/${fileName}`

    // Remove previous logo if provided
    if (opts?.currentLogoUrl) {
      try {
        const url = new URL(opts.currentLogoUrl)
        const pathParts = url.pathname.split('/')
        const oldPath = pathParts.slice(5).join('/') // remove /storage/v1/object/public/team-assets/
        if (oldPath) {
          await supabase.storage.from('team-assets').remove([oldPath])
        }
      } catch {}
    }

    // Upload file directly to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('team-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/png',
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('team-assets').getPublicUrl(filePath)

    return { success: true, url: publicUrl, path: filePath }
  } catch (error) {
    console.error('Error uploading team logo:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}
