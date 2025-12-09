'use server'

import { createClient } from '@/server/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteHypeTemplate(templateId: string) {
  try {
    const supabase = await createClient()

    // Delete the template from the database
    const { data: files, error: listError } = await supabase.storage
      .from('design-template-assets')
      .list(`${templateId}/assets`)

    if (listError) {
      console.error('Error listing files:', listError.message)
      return { error: listError.message }
    }

    // If no files are found, the folder is effectively empty.
    if (!files || files.length === 0) {
      console.log('Folder is empty. Nothing to delete.')
      // return { error: 'Folder is empty. Nothing to delete.' }
    }

    // Build an array of complete file paths.
    // Note: For nested folders, you might need a recursive approach.
    const filePaths = files.map((file) => `${templateId}/assets/${file.name}`)
    console.log('Files to delete:', filePaths)

    // Delete the files in the folder.
    const { data: deleteData, error: deleteAssetError } = await supabase.storage
      .from('design-template-assets')
      .remove(filePaths)

    if (deleteAssetError) {
      console.error('Error deleting files:', deleteAssetError.message)
    } else {
      console.log('Deleted files:', deleteData)
    }
    const { error: deleteError } = await supabase
      .from('design_templates')
      .delete()
      .eq('id', templateId)

    if (deleteError) {
      console.error('Error deleting template:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Delete associated files from storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('design-template-assets')
      .list(templateId)

    if (!storageError && storageData && storageData.length > 0) {
      const filesToDelete = storageData.map((file) => `${templateId}/${file.name}`)
      const { error: deleteStorageError } = await supabase.storage
        .from('design-template-assets')
        .remove(filesToDelete)

      if (deleteStorageError) {
        console.error('Error deleting storage files:', deleteStorageError)
      }
    }

    // Revalidate the page to show updated data
    revalidatePath('/admin-dashboard/manage-hypes')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteHypeTemplate:', error)
    return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten.' }
  }
}
