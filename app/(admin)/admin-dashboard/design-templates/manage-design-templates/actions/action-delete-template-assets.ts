'use server'

import { createClient } from '@/server/supabase/server'

export async function deleteTemplateAssets(hypeTemplateId: string) {
  const supabase = await createClient()
  const { data: files, error: listError } = await supabase.storage
    .from('hype-cards-layers')
    .list(`${hypeTemplateId}/assets`)

  if (listError) {
    console.error('Error listing files:', listError.message)
    return { error: listError.message }
  }

  // If no files are found, the folder is effectively empty.
  if (!files || files.length === 0) {
    console.log('Folder is empty. Nothing to delete.')
    return { error: 'Folder is empty. Nothing to delete.' }
  }

  // Build an array of complete file paths.
  // Note: For nested folders, you might need a recursive approach.
  const filePaths = files.map((file) => `${hypeTemplateId}/assets/${file.name}`)
  console.log('Files to delete:', filePaths)

  // Delete the files in the folder.
  const { data: deleteData, error: deleteError } = await supabase.storage
    .from('hype-cards-layers')
    .remove(filePaths)

  if (deleteError) {
    console.error('Error deleting files:', deleteError.message)
  } else {
    console.log('Deleted files:', deleteData)
  }
}
