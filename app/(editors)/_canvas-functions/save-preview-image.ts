import { createClient } from '@/server/supabase/client'
// import { fabric } from 'fabric'

interface SavePreviewImageOptions {
  templateId: string;
  templateName: string;
  fabricCanvas: any | null; // 'fabric' ist nicht definiert, daher 'any' verwenden
  canvasWidth: number;
  canvasHeight: number;
  existingPreviewUrl?: string | null;
  setPreviewImageUrl: (url: string) => void;
}

export async function savePreviewImage({
  templateId,
  templateName,
  fabricCanvas,
  canvasWidth,
  canvasHeight,
  existingPreviewUrl,
  setPreviewImageUrl,
}: SavePreviewImageOptions): Promise<string | null> {
  if (!fabricCanvas) {
    console.error('No fabric canvas found')
    return null
  }

  try {
    let dataURL
    try {
      dataURL = fabricCanvas.toDataURL({
        format: 'jpeg',
        quality: 0.8,
        multiplier: 2,
      })
    } catch (e) {
      console.error('Canvas export failed, likely due to CORS issues:', e)
    }

    if (!dataURL) {
      console.error('Failed to generate data URL from canvas')
      return null
    }

    const res = await fetch(dataURL)
    const blob = await res.blob()
    const uniqueId = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
    const cleanName = templateName.replace(/\s+/g, '')
    const file = new File(
      [blob],
      `${cleanName}_${templateId}_${canvasWidth}x${canvasHeight}_${uniqueId}_preview.jpg`,
      { type: 'image/jpeg' }
    )

    const supabase = createClient()
    
    // Delete existing preview image if it exists
    if (existingPreviewUrl) {
      console.log('Deleting existing preview image:', existingPreviewUrl)
      try {
        // Extract path from Supabase Storage URL
        const url = new URL(existingPreviewUrl)
        const pathParts = url.pathname.split('/')

        // Find storage path (usually after 'storage/v1/object/public/')
        const storageIndex = pathParts.findIndex((part) => part === 'storage')
        if (storageIndex !== -1 && pathParts.length > storageIndex + 4) {
          const bucket = pathParts[storageIndex + 3] // Bucket name
          const filePath = pathParts.slice(storageIndex + 4).join('/') // Full file path

          console.log(
            'Attempting to delete existing preview from bucket:',
            bucket,
            'path:',
            filePath
          )

          const { error: deleteError } = await supabase.storage.from(bucket).remove([filePath])
          if (deleteError) {
            console.error('Error deleting existing preview:', deleteError)
          } else {
            console.log('Successfully deleted existing preview image')
          }
        } else {
          console.warn('Could not parse existing preview image URL path:', existingPreviewUrl)
        }
      } catch (error) {
        console.error('Error parsing preview image URL for deletion:', error)
      }
    }

    // Upload new preview image
    const { data, error } = await supabase.storage
      .from('design-template-assets')
      .upload(`${templateId}/previews/${file.name}`, file, {
        cacheControl: 'no-cache',
        upsert: true,
      })

    if (error) {
      console.error('Error uploading preview:', error)
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('design-template-assets')
      .getPublicUrl(`${templateId}/previews/${file.name}`)

    // Update local state with new URL
    setPreviewImageUrl(publicUrl)
    console.log('Generated new preview URL:', publicUrl)

    // Save the preview URL to database using direct client update
    await updatePreviewUrlDirectly(templateId, publicUrl)

    return publicUrl
  } catch (error) {
    console.error('Error saving preview:', error)
    return null
  }
}

// Helper function for direct client update (fallback)
async function updatePreviewUrlDirectly(templateId: string, publicUrl: string): Promise<void> {
  try {
    console.log('Updating preview URL directly via client...')
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('design_templates')
      .update({ preview_image_url: publicUrl })
      .eq('id', templateId)
    
    if (updateError) {
      console.error('Error updating preview URL directly:', updateError)
    } else {
      console.log('Successfully updated preview URL directly via client')
    }
  } catch (error) {
    console.error('Error in direct preview URL update:', error)
  }
}
