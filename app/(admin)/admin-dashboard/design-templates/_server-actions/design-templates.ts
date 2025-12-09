'use server'
// packages imports
import { createClient } from '@/server/supabase/server'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { checkUserRole } from '@/lib/check-session-and-role'

// server logic imports

export interface ListTemplatesParams {
  categorySlug?: string
  typeSlug?: string
  status?: 'draft' | 'published' | 'archived'
  limit?: number
  offset?: number
}

export async function listTemplates(params: ListTemplatesParams = {}) {
  const { categorySlug, typeSlug, status, limit = 50, offset = 0 } = params
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_design_templates_with_metadata', {
    p_category_slug: categorySlug ?? null,
    p_type_slug: typeSlug ?? null,
    p_status: status ?? null,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    return { success: false, error: error.message, templates: [] as any[] }
  }

  return { success: true, templates: data ?? [] }
}
// Schema für die Template-Validierung
const updateTemplateSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  name: z.string().min(1, 'Name ist erforderlich'),
  category: z.string().min(1, 'Kategorie ist erforderlich'),
  categoryId: z.string().optional(),
  type: z.string().optional(),
  typeId: z.string().optional(),
  tags: z.string().optional(),
  description: z.string().min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein'),
  status: z.enum(['draft', 'approved', 'published', 'waiting_for_approval', 'rejected', 'archived']).optional(),
})

export const updateDesignTemplate = actionClient
  .schema(updateTemplateSchema)
  .action(async ({ parsedInput }) => {
    const { id, name, category, categoryId, type, typeId, tags, description, status } = parsedInput
    const supabase = await createClient()

    const updateData: any = {
      name,
      category,
      description,
      updated_at: new Date().toISOString(),
    }

    // Nur status hinzufügen wenn vorhanden
    if (status) {
      updateData.status = status
    }

    // Nur tags hinzufügen wenn vorhanden
    if (tags) {
      updateData.tags = tags
    }

    // Validiere und setze category_id (Foreign Key)
    if (categoryId) {
      // Validiere, dass die Kategorie existiert
      const { data: categoryExists } = await supabase
        .from('design_template_categories')
        .select('id')
        .eq('id', categoryId)
        .single()
      
      if (categoryExists) {
        updateData.category_id = categoryId
        console.log('Setting category_id:', categoryId)
      } else {
        console.warn('Category ID not found:', categoryId)
        return { error: `Kategorie mit ID ${categoryId} nicht gefunden` }
      }
    } else if (category) {
      // Fallback: Suche Kategorie nach Slug
      const { data: categoryBySlug } = await supabase
        .from('design_template_categories')
        .select('id')
        .eq('slug', category)
        .single()
      
      if (categoryBySlug) {
        updateData.category_id = categoryBySlug.id
        console.log('Setting category_id by slug:', categoryBySlug.id)
      } else {
        console.warn('Category slug not found:', category)
        return { error: `Kategorie "${category}" nicht gefunden` }
      }
    }

    // Validiere und setze type_id (Foreign Key)
    if (typeId) {
      // Validiere, dass der Type existiert
      const { data: typeExists } = await supabase
        .from('design_template_types')
        .select('id')
        .eq('id', typeId)
        .single()
      
      if (typeExists) {
        updateData.type_id = typeId
        console.log('Setting type_id:', typeId)
      } else {
        console.warn('Type ID not found:', typeId)
        return { error: `Type mit ID ${typeId} nicht gefunden` }
      }
    } else if (type) {
      // Fallback: Suche Type nach Slug
      const { data: typeBySlug } = await supabase
        .from('design_template_types')
        .select('id')
        .eq('slug', type)
        .single()
      
      if (typeBySlug) {
        updateData.type_id = typeBySlug.id
        console.log('Setting type_id by slug:', typeBySlug.id)
      } else {
        console.warn('Type slug not found:', type)
        return { error: `Type "${type}" nicht gefunden` }
      }
    }

    // Setze auch die String-Werte für Rückwärtskompatibilität
    if (type) {
      updateData.type = type
    }

    console.log('Updating design template with data:', updateData)
    
    const { data, error } = await supabase
      .from('design_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update design template error:', error)
      return { error: `Fehler beim Aktualisieren: ${error.message}` }
    }

    if (!data) {
      console.error('No data returned from update')
      return { error: 'Template nicht gefunden' }
    }

    console.log('Update successful, returned data:', data)
    
    // Revalidiere die relevanten Pfade
    revalidatePath(`/admin-dashboard/design-templates/manage-design-templates/${id}`)
    revalidatePath('/admin-dashboard/design-templates/manage-design-templates')
    revalidatePath('/admin-dashboard/design-templates')
    
    return { success: true, template: data }
  })

// Schema für das Update des Template-Namens
const updateTemplateNameSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  name: z.string().min(1, 'Name ist erforderlich'),
})

export const updateTemplateName = actionClient
  .schema(updateTemplateNameSchema)
  .action(async ({ parsedInput }) => {
    const { id, name } = parsedInput
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('design_templates')
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update template name error:', error)
      return { error: `Fehler beim Aktualisieren: ${error.message}` }
    }

    if (!data) {
      return { error: 'Template nicht gefunden' }
    }

    // Revalidiere die relevanten Pfade
    revalidatePath(`/admin-dashboard/design-templates/manage-design-templates/${id}`)
    revalidatePath('/admin-dashboard/design-templates/manage-design-templates')
    revalidatePath('/admin-dashboard/design-templates')

    return { success: true, template: data }
  })

// Server-Aktion zum Laden der Kategorien
export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('design_template_categories')
    .select('id, name, slug, description, color, icon')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Get categories error:', error)
    return { success: false, error: error.message, categories: [] }
  }

  return { success: true, categories: data || [] }
}

// Server-Aktion zum Laden der Types
export async function getTypes() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('design_template_types')
    .select('id, name, slug, description, category_id')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Get types error:', error)
    return { success: false, error: error.message, types: [] }
  }

  return { success: true, types: data || [] }
}

// Schema für das Einreichen zur Genehmigung
const submitForApprovalSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
})

export const submitForApproval = actionClient
  .schema(submitForApprovalSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput
    const supabase = await createClient()

    // Validiere, dass alle erforderlichen Felder ausgefüllt sind
    const { data: template, error: fetchError } = await supabase
      .from('design_templates')
      .select('name, description, category, type, tags, preview_image_url')
      .eq('id', id)
      .single()

    if (fetchError || !template) {
      return { error: 'Template nicht gefunden' }
    }

    // Validiere erforderliche Felder
    const requiredFields = {
      name: template.name,
      description: template.description,
      category: template.category,
      preview_image_url: template.preview_image_url,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([field, _]) => field)

    if (missingFields.length > 0) {
      return { 
        error: `Folgende Felder müssen ausgefüllt sein: ${missingFields.join(', ')}` 
      }
    }

    // Update den Status auf waiting_for_approval
    const { data, error } = await supabase
      .from('design_templates')
      .update({
        status: 'waiting_for_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Submit for approval error:', error)
      return { error: `Fehler beim Einreichen: ${error.message}` }
    }

    if (!data) {
      return { error: 'Template nicht gefunden' }
    }

    // Revalidiere die relevanten Pfade
    revalidatePath(`/admin-dashboard/design-templates/manage-design-templates/${id}`)
    revalidatePath('/admin-dashboard/design-templates/manage-design-templates')
    revalidatePath('/admin-dashboard/design-templates')

    return { success: true, template: data }
  })

// Schema für Template-Genehmigung
const approveTemplateSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  reviewNotes: z.string().optional(),
})

export const approveTemplate = actionClient
  .schema(approveTemplateSchema)
  .action(async ({ parsedInput }) => {
    const { id, reviewNotes } = parsedInput
    const supabase = await createClient()

    // Rollencheck: nur Admin oder höher
    const roleCheck = await checkUserRole()
    if (!roleCheck || !roleCheck.isAdminOrAbove) {
      return { error: 'Nicht berechtigt. Nur Admins oder höher können genehmigen.' }
    }

    // Erlaubter Übergang: waiting_for_approval -> approved
    const { data: currentTemplate, error: fetchErr } = await supabase
      .from('design_templates')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchErr || !currentTemplate) {
      return { error: 'Template nicht gefunden' }
    }

    if (currentTemplate.status !== 'waiting_for_approval') {
      return { error: 'Ungültiger Statusübergang. Template ist nicht zur Genehmigung eingereicht.' }
    }

    // Update den Status auf approved
    const { data, error } = await supabase
      .from('design_templates')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Approve template error:', error)
      return { error: `Fehler beim Genehmigen: ${error.message}` }
    }

    if (!data) {
      return { error: 'Template nicht gefunden' }
    }

    // Revalidiere die relevanten Pfade
    revalidatePath('/admin-dashboard/design-templates/design-templates-approvals')
    revalidatePath('/admin-dashboard/design-templates/manage-design-templates')
    revalidatePath('/admin-dashboard/design-templates')

    return { success: true, template: data }
  })

// Schema für Template-Veröffentlichung
const publishTemplateSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
  reviewNotes: z.string().optional(),
})

export const publishTemplate = actionClient
  .schema(publishTemplateSchema)
  .action(async ({ parsedInput }) => {
    const { id, reviewNotes } = parsedInput
    const supabase = await createClient()

    // Rollencheck: Creator oder höher darf veröffentlichen (nicht zwingend Admin)
    const roleCheck = await checkUserRole()
    if (!roleCheck || !roleCheck.isCreatorOrAbove) {
      return { error: 'Nicht berechtigt. Nur Creator oder höher können veröffentlichen.' }
    }

    // Nur erlaubt, wenn Status bereits approved ist
    const { data: currentTemplate, error: fetchErr } = await supabase
      .from('design_templates')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchErr || !currentTemplate) {
      return { error: 'Template nicht gefunden' }
    }

    if (currentTemplate.status !== 'approved') {
      return { error: 'Veröffentlichen nur möglich, wenn der Status approved ist.' }
    }

    // Update den Status auf published
    const { data, error } = await supabase
      .from('design_templates')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Publish template error:', error)
      return { error: `Fehler beim Veröffentlichen: ${error.message}` }
    }

    if (!data) {
      return { error: 'Template nicht gefunden' }
    }

    // Revalidiere die relevanten Pfade
    revalidatePath('/admin-dashboard/design-templates/design-templates-approvals')
    revalidatePath('/admin-dashboard/design-templates/manage-design-templates')
    revalidatePath('/admin-dashboard/design-templates')

    return { success: true, template: data }
  })

// Schema für Template-Unpublish
const unpublishTemplateSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(val => String(val)),
})

export const unpublishTemplate = actionClient
  .schema(unpublishTemplateSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput
    const supabase = await createClient()

    const roleCheck = await checkUserRole()
    if (!roleCheck || !roleCheck.isCreatorOrAbove) {
      return { error: 'Nicht berechtigt. Nur Creator oder höher können unveröffentlichen.' }
    }

    const { data: currentTemplate, error: fetchErr } = await supabase
      .from('design_templates')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchErr || !currentTemplate) {
      return { error: 'Template nicht gefunden' }
    }

    if (currentTemplate.status !== 'published') {
      return { error: 'Unveröffentlichen nur möglich, wenn der Status published ist.' }
    }

    const { data, error } = await supabase
      .from('design_templates')
      .update({
        status: 'approved',
        published_at: null,
        published_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Unpublish template error:', error)
      return { error: `Fehler beim Unveröffentlichen: ${error.message}` }
    }

    if (!data) {
      return { error: 'Template nicht gefunden' }
    }

    revalidatePath(`/admin-dashboard/design-templates/manage-design-templates/${id}`)
    revalidatePath('/admin-dashboard/design-templates/manage-design-templates')
    revalidatePath('/admin-dashboard/design-templates')

    return { success: true, template: data }
  })

// Test-Server-Aktion zum Debuggen
export const testUpdate = actionClient
  .schema(z.object({ id: z.string(), test: z.string() }))
  .action(async ({ parsedInput }) => {
    console.log('Test update called with:', parsedInput)
    return { success: true, message: 'Test erfolgreich' }
  })