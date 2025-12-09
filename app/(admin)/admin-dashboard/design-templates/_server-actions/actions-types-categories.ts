'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// server logic imports
import { actionClient } from '@/lib/safe-action'
import { createClient } from '@/server/supabase/server'

// Schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  sort_order: z.number().int().min(0).optional(),
})

const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
})

const createTypeSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
})

const updateTypeSchema = createTypeSchema.partial().extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
})

// Utils
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Category Actions
export const createCategoryAction = actionClient
  .schema(createCategorySchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const payload = { ...parsedInput }
    if (!payload.slug && payload.name) payload.slug = generateSlug(payload.name)
    const { data, error } = await supabase
      .from('design_template_categories')
      .insert([{ ...payload, sort_order: payload.sort_order ?? 0 }])
      .select()
      .single()
    if (error) return { error: error.message }
    revalidatePath('/admin-dashboard/design-templates/manage-categories')
    return { data }
  })

export const updateCategoryAction = actionClient
  .schema(updateCategorySchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, ...rest } = parsedInput
    const update = { ...rest }
    if (update.name && !update.slug) update.slug = generateSlug(update.name)
    const { data, error } = await supabase
      .from('design_template_categories')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) return { error: error.message }
    revalidatePath('/admin-dashboard/design-templates/manage-categories')
    return { data }
  })

export const deleteCategoryAction = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id } }) => {
    const supabase = await createClient()
    const { error: depErr } = await supabase
      .from('design_template_types')
      .select('id')
      .eq('category_id', id)
      .limit(1)
      .maybeSingle()
    if (depErr && depErr.code && depErr.code !== 'PGRST116') return { error: depErr.message }
    const { error } = await supabase
      .from('design_template_categories')
      .delete()
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin-dashboard/design-templates/manage-categories')
    return { success: true as const }
  })

// Type Actions
export const createTypeAction = actionClient
  .schema(createTypeSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const payload = { ...parsedInput }
    if (!payload.slug && payload.name) payload.slug = generateSlug(payload.name)
    const { data, error } = await supabase
      .from('design_template_types')
      .insert([{ ...payload, sort_order: 0 }])
      .select()
      .single()
    if (error) return { error: error.message }
    revalidatePath('/admin-dashboard/design-templates/manage-types')
    return { data }
  })

export const updateTypeAction = actionClient
  .schema(updateTypeSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient()
    const { id, ...rest } = parsedInput
    const update = { ...rest }
    if (update.name && !update.slug) update.slug = generateSlug(update.name)
    const { data, error } = await supabase
      .from('design_template_types')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) return { error: error.message }
    revalidatePath('/admin-dashboard/design-templates/manage-types')
    return { data }
  })

export const deleteTypeAction = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id } }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from('design_template_types')
      .delete()
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin-dashboard/design-templates/manage-types')
    return { success: true as const }
  })

// FormData-compatible wrappers for existing UI components
export async function createCategoryActionForm(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '')
  const descriptionRaw = formData.get('description')
  const colorRaw = formData.get('color')
  const iconRaw = formData.get('icon')
  const payload: any = { name }
  if (typeof descriptionRaw === 'string' && descriptionRaw) payload.description = descriptionRaw
  if (typeof colorRaw === 'string' && colorRaw) payload.color = colorRaw
  if (typeof iconRaw === 'string' && iconRaw) payload.icon = iconRaw
  await createCategoryAction(payload)
}

export async function updateCategoryActionForm(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  const nameRaw = formData.get('name')
  const descriptionRaw = formData.get('description')
  const colorRaw = formData.get('color')
  const iconRaw = formData.get('icon')
  const isActiveRaw = formData.get('is_active')
  const payload: any = { id }
  if (typeof nameRaw === 'string') payload.name = nameRaw
  if (typeof descriptionRaw === 'string') payload.description = descriptionRaw
  if (typeof colorRaw === 'string') payload.color = colorRaw
  if (typeof iconRaw === 'string') payload.icon = iconRaw
  if (typeof isActiveRaw !== 'undefined') payload.is_active = true
  await updateCategoryAction(payload)
}

export async function deleteCategoryActionForm(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  await deleteCategoryAction({ id })
}
export async function createTypeActionForm(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '')
  const description = String(formData.get('description') || '')
  await createTypeAction({ name, description })
}

export async function updateTypeActionForm(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  const nameRaw = formData.get('name')
  const descriptionRaw = formData.get('description')
  const isActiveRaw = formData.get('is_active')
  const payload: any = { id }
  if (typeof nameRaw === 'string') payload.name = nameRaw
  if (typeof descriptionRaw === 'string') payload.description = descriptionRaw
  if (typeof isActiveRaw !== 'undefined') payload.is_active = true
  await updateTypeAction(payload)
}

export async function deleteTypeActionForm(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  await deleteTypeAction({ id })
}


