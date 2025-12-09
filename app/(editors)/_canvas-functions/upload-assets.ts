import { createClient } from '@/server/supabase/client'
import { FileObject } from '@supabase/storage-js'

export const supabase = createClient()

export async function uploadFileToSupabase(file: File, path: string) {
  const newPath = `${path}/${file.name}`
  try {
    const { data, error } = await supabase.storage
      .from('design-template-assets')
      .upload(`${path}/${file.name}`, file)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from('design-template-assets').getPublicUrl(path)
  return data.publicUrl
}

export type StorageFile = FileObject

export async function listFiles(hypeTemplateId: string): Promise<StorageFile[]> {
  try {
    console.log('Listing files for template:', hypeTemplateId)
    const { data, error } = await supabase.storage
      .from('design-template-assets')
      .list(`${hypeTemplateId}/assets`)

    if (error) {
      console.error('Error listing files:', error)
      throw error
    }

    console.log('Files found:', data)
    return data || []
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from('design-template-assets').remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}
