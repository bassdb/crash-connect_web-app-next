import { createClient } from '@/server/supabase/server'

export async function getBrowseCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('design_template_categories')
    .select('id, name, slug, description, color, icon')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Get browse categories error:', error)
    return { success: false, error: error.message, categories: [] }
  }

  return { success: true, categories: data || [] }
}

export async function getBrowseTypes() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('design_template_types')
    .select('id, name, slug, description, category_id')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Get browse types error:', error)
    return { success: false, error: error.message, types: [] }
  }

  return { success: true, types: data || [] }
}
