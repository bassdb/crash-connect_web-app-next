'use server'

import { createClient } from '@/server/supabase/server'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

const savePreviewUrlSchema = z.object({
  id: z.string().min(1, 'Template ID ist erforderlich'),
  preview_image_url: z.string().url('Gültige URL erforderlich'),
})

export type SavePreviewUrlResult = {
  success?: string
  error?: string
  message: string
  data?: {
    id: string
    preview_image_url: string
  }
}

export const actionSavePreviewUrl = actionClient
  .schema(savePreviewUrlSchema)
  .action(async ({ parsedInput: { id, preview_image_url } }): Promise<SavePreviewUrlResult> => {
    try {
      console.log('=== actionSavePreviewUrl called ===')
      console.log('Template ID:', id)
      console.log('Preview URL:', preview_image_url)

      const supabase = await createClient()
      
      // Verify user authentication
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        console.error('User not authenticated:', userError)
        return {
          error: 'Authentifizierung fehlgeschlagen',
          message: 'Benutzer ist nicht authentifiziert',
        }
      }

      // Update the preview_image_url in the design_templates table
      const updatedAt = new Date().toISOString()
      const { data, error } = await supabase
        .from('design_templates')
        .update({ 
          preview_image_url: preview_image_url, 
          updated_at: updatedAt 
        })
        .eq('id', id)
        .eq('creator', userData.user.id) // Ensure user owns the template
        .select('id, name, preview_image_url')
        .single()

      if (error) {
        console.error('Error updating preview URL:', error)
        return {
          error: 'Fehler beim Speichern der Preview-URL',
          message: error.message,
        }
      }

      if (!data) {
        return {
          error: 'Template nicht gefunden',
          message: 'Das Template konnte nicht gefunden werden oder Sie haben keine Berechtigung dafür',
        }
      }

      console.log('Preview URL successfully updated:', data)

      return {
        success: 'Preview-URL erfolgreich gespeichert',
        message: `Preview-URL für Template "${data.name}" wurde erfolgreich aktualisiert`,
        data: {
          id: data.id,
          preview_image_url: data.preview_image_url,
        },
      }
    } catch (error) {
      console.error('Unexpected error in actionSavePreviewUrl:', error)
      const message = error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten'
      return {
        error: 'Unerwarteter Server-Fehler',
        message: `Speichern der Preview-URL fehlgeschlagen: ${message}`,
      }
    }
  })
