'use server'

import { createClient } from '@/server/supabase/server'
import { designTemplateMetadataSchema } from './schema-designTemplateMetadata'

// Define the expected response type
type UpdateDesignTemplateResponse = {
  success: boolean
  message: string
  id?: string
  preview_image_url?: string
  error?: string
}

export async function actionUpdateDesignTemplate(
  formData: FormData,
  templateId: string,
  previewImageUrl: string
): Promise<UpdateDesignTemplateResponse> {
  console.log('=== actionUpdateDesignTemplate called ===')
  console.log('Received templateId:', templateId)
  console.log('Received previewImageUrl:', previewImageUrl)

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    console.error('User not authenticated:', userError)
    return {
      success: false,
      error: 'Authentifizierung fehlgeschlagen!',
      message: 'Benutzer konnte nicht authentifiziert werden.',
    }
  }

  if (!templateId) {
    console.error('Template ID is missing')
    return {
      success: false,
      error: 'Template-ID fehlt',
      message: 'Template-ID ist erforderlich für Updates.',
    }
  }

  // Parse form data
  const rawData = {
    name: formData.get('name') as string,
    category: (formData.get('category') as string) || undefined,
    tags: (formData.get('tags') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    preview_image_url: previewImageUrl || undefined, // Use the bound previewImageUrl
  }

  console.log('Parsed form data:', rawData)
  console.log('Preview image URL to be used:', previewImageUrl)

  // Validate with zod
  const validationResult = designTemplateMetadataSchema.safeParse(rawData)
  if (!validationResult.success) {
    console.error('Validation failed:', validationResult.error)
    return {
      success: false,
      error: 'Validierung fehlgeschlagen!',
      message: 'Bitte überprüfen Sie die eingegebenen Daten.',
    }
  }

  const { name, category, tags, description } = validationResult.data

  try {
    console.log('Updating existing template:', templateId)
    console.log('Data to update:', {
      name,
      category,
      tags,
      description,
      preview_image_url: previewImageUrl,
    })

    // Update existing template
    const { data, error } = await supabase
      .from('design_templates')
      .update(
        (() => {
          const updateData: Record<string, unknown> = {
            name: name,
            updated_at: new Date().toISOString(),
          }
          if (category) updateData.category = category
          if (tags) updateData.tags = tags
          if (description) updateData.description = description
          if (previewImageUrl) {
            updateData.preview_image_url = previewImageUrl
            console.log('Including preview_image_url in update:', previewImageUrl)
          } else {
            console.log('No preview_image_url provided for update')
          }
          return updateData
        })()
      )
      .eq('id', templateId)
      .select('id, preview_image_url')
      .single()

    if (error) {
      console.error('Error updating design template:', error)
      return {
        success: false,
        error: 'Error updating template!',
        message: error.message,
      }
    }

    console.log('Template updated successfully. Result:', data)
    console.log('Updated preview_image_url:', data?.preview_image_url)

    return {
      success: true,
      message: 'Template successfully updated',
      id: templateId,
      preview_image_url: data?.preview_image_url, // Return the updated preview URL
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return {
      success: false,
      error: 'Unexpected error processing template',
      message: message,
    }
  }
}
