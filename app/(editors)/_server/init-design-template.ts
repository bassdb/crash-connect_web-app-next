'use server'

import { createClient } from '@/server/supabase/server'
import { designTemplateMetadataSchema } from './schema-designTemplateMetadata'
import { z } from 'zod'

// Define the expected response type
type InitDesignTemplateResponse = {
  success?: boolean
  message: string
  id?: string
  error?: string
}

export async function actionInitDesignTemplate(
  formData: FormData
): Promise<InitDesignTemplateResponse> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    console.error('User not authenticated:', userError)
    return {
      error: 'Authentifizierung fehlgeschlagen!',
      message: 'Benutzer konnte nicht authentifiziert werden.',
    }
  }

  // Parse form data
  const rawData = {
    name: formData.get('name') as string,
    category: (formData.get('category') as string) || undefined,
    tags: (formData.get('tags') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    preview_image_url: (formData.get('preview_image_url') as string) || undefined,
  }

  // Validate with zod
  const validationResult = designTemplateMetadataSchema.safeParse(rawData)
  if (!validationResult.success) {
    console.error('Validation failed:', validationResult.error)
    return {
      error: 'Validierung fehlgeschlagen!',
      message: 'Bitte überprüfen Sie die eingegebenen Daten.',
    }
  }

  const { name, category, tags, description, preview_image_url } = validationResult.data

  const templateData: Record<string, unknown> = {
    name: name,
    creator: userData.user.id,
  }

  if (category) templateData.category = category
  if (tags) templateData.tags = tags
  if (description) templateData.description = description
  if (preview_image_url) templateData.preview_image_url = preview_image_url

  try {
    // Insert new template only - updates are handled by actionUpdateDesignTemplate
    const { data, error } = await supabase
      .from('design_templates')
      .insert(templateData)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating design template:', error)
      return {
        error: 'Error initializing template!',
        message: error.message,
      }
    }

    return {
      success: true,
      message: 'Template successfully initialized',
      id: data.id,
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return {
      error: 'Unexpected error processing template',
      message: message,
    }
  }
}
