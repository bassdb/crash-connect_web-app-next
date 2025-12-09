'use server'

import { createClient } from '@/server/supabase/server'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

const saveCanvasSchema = z.object({
  id: z.string(),
  canvas_data: z.string(),
  preview_image_url: z.string().optional(),
})

export const actionSaveCanvas = actionClient
  .schema(saveCanvasSchema)
  .action(async ({ parsedInput: { id, canvas_data, preview_image_url } }) => {
    try {
      const supabase = await createClient()
      const updatedAt = new Date().toISOString()
      const { data, error } = await supabase
        .from('design_templates')
        .update({ canvas_data: canvas_data, updated_at: updatedAt, preview_image_url: preview_image_url })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error saving canvas:', error)
        return {
          error: 'Error saving canvas',
          message: error.message,
        }
      }

      return {
        success: 'Successfully saved canvas',
        message: `Design Template ${data.name} with ID ${data.id} saved successfully`,
        data: data, // Return the updated template data
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      return {
        error: 'Unexpected server error',
        message: 'saving canvas failed!',
      }
    }
  })
