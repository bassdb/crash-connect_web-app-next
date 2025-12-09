'use client'

// UI imports
import { Button } from '@/components/ui/button'
import { LoaderCircle, CheckCircle, Save } from 'lucide-react'

// react imports
import { useState } from 'react'

// packages imports

// state imports
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'

// server logic imports
import { useToast } from '@/hooks/use-toast'
import { actionSaveCanvas } from '@/app/(editors)/_server/action-save-canvas'

// client logic imports
import { savePreviewImage } from '../../_canvas-functions/save-preview-image'
import { useAction } from 'next-safe-action/hooks'
import { serializeCanvasWithData } from '@/app/(editors)/_canvas-functions/dynamic-values/serialization'

interface SaveDesignTemplateButtonProps {
  designTemplateId?: string
}

export default function SaveDesignTemplateButton({
  designTemplateId,
}: SaveDesignTemplateButtonProps) {
  const { toast } = useToast()

  const { designTemplateData, previewImageUrl, setPreviewImageUrl, setDesignTemplateData } =
    useDesignTemplateStore()

  const { fabricCanvas, canvasWidth, canvasHeight, isCanvasSaved, markCanvasAsSaved } =
    useCanvasStore()

  const [isSaving, setIsSaving] = useState(false)

  const { execute: executeSaveCanvas, isExecuting } = useAction(actionSaveCanvas, {
    onSuccess: (data) => {
      // Check if action returned an error (database error, not server exception)
      if (data?.data?.error) {
        console.error('Error from action:', data.data.error, data.data.message)
        toast({
          title: 'Fehler',
          description: data.data.message || 'Canvas konnte nicht gespeichert werden',
          variant: 'destructive',
        })
        return
      }

      // Success case
      if (data?.data?.success) {
        // Update canvas saved status globally and local preview url in store
        markCanvasAsSaved()
        
        // Update design template data with the returned data
        if (data?.data?.data) {
          const updatedData = data.data.data
          setDesignTemplateData({
            ...designTemplateData,
            id: designTemplateId || updatedData.id,
            preview_image_url: updatedData.preview_image_url,
            canvas_data: updatedData.canvas_data,
          })
        } else if (designTemplateData && designTemplateId) {
          // Fallback to current data if no data returned
          setDesignTemplateData({
            ...designTemplateData,
            id: designTemplateId,
            preview_image_url: previewImageUrl || '',
          })
        }
        
        toast({
          title: 'Erfolgreich',
          description: 'Template gespeichert (Vorschau und Canvas).',
          className: 'border-green-500',
        })
        return
      }

      // Fallback error if neither error nor success
      toast({
        title: 'Fehler',
        description: 'Unerwartetes Ergebnis beim Speichern',
        variant: 'destructive',
      })
    },
    onError: (error) => {
      console.error('Error saving canvas via action:', error)
      toast({
        title: 'Fehler',
        description: 'Canvas konnte nicht gespeichert werden',
        variant: 'destructive',
      })
    },
  })

  const handleSaveImageURLAndCanvas = async () => {
    setIsSaving(true)
    const templateId = designTemplateId
    if (!templateId) {
      toast({
        title: 'Error',
        description: 'Design Template ID not found.',
        variant: 'destructive',
      })
      setIsSaving(false)
      return
    }

    if (!designTemplateData) {
      toast({ title: 'Error', description: 'No template data to save.', variant: 'destructive' })
      setIsSaving(false)
      return
    }

    try {
      toast({ title: 'Processing', description: 'Saving preview and canvas...' })

      // 1) Save/Update preview image and update store
      const currentName = designTemplateData.name || 'template'
      const newPreviewUrl = await savePreviewImage({
        templateId,
        templateName: currentName,
        fabricCanvas,
        canvasWidth,
        canvasHeight,
        existingPreviewUrl: previewImageUrl,
        setPreviewImageUrl,
      })

      if (!newPreviewUrl) {
        toast({
          title: 'Error',
          description: 'Failed to generate preview image',
          variant: 'destructive',
        })
        return
      }

      // 2) Save canvas JSON and mark as saved
      if (!fabricCanvas) {
        toast({ title: 'Error', description: 'Canvas not initialized', variant: 'destructive' })
        return
      }

      const canvasJson = serializeCanvasWithData(fabricCanvas)

      console.log('Serialized canvas data:', canvasJson)
      // Save canvas via next-safe-action
      executeSaveCanvas({
        id: templateId,
        canvas_data: canvasJson,
        preview_image_url: newPreviewUrl,
      })

      // Local store update and success toast are handled in onSuccess of useAction
    } catch (error) {
      console.error('Error saving design data:', error)
      toast({ title: 'Error', description: 'Failed to save template', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      onClick={handleSaveImageURLAndCanvas}
      className={`w-full gap-2 transition-all duration-200 h-12 text-base font-medium`}
      variant={isCanvasSaved && !isSaving ? 'outline' : 'default'}
      disabled={isSaving || isCanvasSaved}
    >
      {isSaving ? (
        <span className='animate-spin'>
          <LoaderCircle />
        </span>
      ) : isCanvasSaved ? (
        <CheckCircle size={16} className='text-green-600 dark:text-green-400' />
      ) : (
        <Save size={16} />
      )}
      {isCanvasSaved ? 'All changes saved' : 'Save Template'}
    </Button>
  )
}
