import { Button } from '@/components/ui/button'
import { ImageIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { savePreviewImage } from '../../_canvas-functions/save-preview-image'

export default function TemplatePreviewImageMetadataBottom({ designTemplateId }: { designTemplateId?: string }) {
  const {
    fabricCanvas,
    canvasWidth,
    canvasHeight,
  } = useCanvasStore()

  const [localWidth, setLocalWidth] = useState(canvasWidth.toString())
  const [localHeight, setLocalHeight] = useState(canvasHeight.toString())

  useEffect(() => {
    setLocalWidth(canvasWidth.toString())
    setLocalHeight(canvasHeight.toString())
  }, [canvasWidth, canvasHeight])

  const {
    designTemplateData,
    storeDesignTemplateId,
    previewImageUrl,
    setPreviewImageUrl,
  } = useDesignTemplateStore()

  const { toast } = useToast()

  const handleSavePreviewImage = async (templateId: string, name: string) => {
    return await savePreviewImage({
      templateId,
      templateName: name,
      fabricCanvas,
      canvasWidth,
      canvasHeight,
      existingPreviewUrl: previewImageUrl,
      setPreviewImageUrl,
    })
  }

  return (
   
  

        
        <div className='flex flex-row gap-4'>
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt={`${designTemplateData?.name || 'Template'} preview`}
              className='aspect-[9/16] w-20 rounded-md object-cover'
            />
          ) : (
            <div className='aspect-[9/16] w-20 rounded-md bg-emerald-100 flex items-center justify-center'>
              <ImageIcon className='h-5 w-5 text-emerald-600' />
            </div>
          )}
          <div className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col gap-1'>
             
              {/* Template ID Anzeige */}
              {designTemplateData?.name && (
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {designTemplateData.name}
                </span>
              )}
              {designTemplateId && (
                <span className='text-xs text-primary font-mono'>ID: {designTemplateId}</span>
              )}
            </div>
            {storeDesignTemplateId && (
              <Button
                onClick={async () => {
                  const currentName = designTemplateData?.name || 'template'
                  if (!storeDesignTemplateId || !currentName) {
                    toast({
                      title: 'Error',
                      description: 'Template ID or name missing',
                      variant: 'destructive',
                    })
                    return
                  }

                  toast({
                    title: 'Processing',
                    description: 'Generating and saving preview image...',
                  })

                  const newPreviewUrl = await handleSavePreviewImage(
                    storeDesignTemplateId,
                    currentName
                  )

                  if (newPreviewUrl) {
                    toast({
                      title: 'Success',
                      description: 'Preview image saved successfully',
                      className: 'border-green-500',
                    })
                  } else {
                    toast({
                      title: 'Error',
                      description: 'Failed to save preview image',
                      variant: 'destructive',
                    })
                  }
                }}
                variant='outline'
                size='sm'
                className='w-full'
              >
                <ImageIcon className='h-4 w-4 mr-2' />
                Save new preview image
              </Button>
            )}
          </div>
        </div>
 
  
  )
}
