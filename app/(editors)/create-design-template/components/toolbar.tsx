'use client'

import { Undo2, Redo2, Save, MousePointer2, Hand, ZoomIn, ZoomOut, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import useEditorStore from '@/app/(editors)/_hooks/useEditorStore'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useHypeTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { actionSaveCanvas } from '../../_server/action-save-canvas'
import { useAction } from 'next-safe-action/hooks'
import { Badge } from '@/components/ui/badge'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'

export default function Toolbar() {
  const { scale, setScale, canPan, setCanPan } = useEditorStore()
  const { canvasWidth, canvasHeight, fabricCanvas } = useCanvasStore()
  const { storeDesignTemplateId } = useDesignTemplateStore() 
  const { toast } = useToast()

  useEffect(() => {
    const handleGlobalMouseDown = (event: MouseEvent) => {
      const toolbarElement = document.getElementById('main-toolbar')
      if (canPan && toolbarElement && !toolbarElement.contains(event.target as Node)) {
        setCanPan(false)
        if (fabricCanvas) {
          fabricCanvas.defaultCursor = 'default'
          fabricCanvas.selection = true
          fabricCanvas.renderAll()
        }
      }
    }

    window.addEventListener('mousedown', handleGlobalMouseDown)
    return () => window.removeEventListener('mousedown', handleGlobalMouseDown)
  }, [canPan, setCanPan, fabricCanvas])

  const { execute: executeSave, isExecuting: isSaving } = useAction(actionSaveCanvas, {
    onSuccess: (result) => {
      if (result.data?.success) {
        toast({
          title: 'Template saved!',
          description: result.data.message || 'Your changes have been saved.',
          duration: 1500,
          className: 'border-green-500',
        })
      } else {
        toast({
          title: 'Error saving template',
          description: result.data?.message || 'An error occurred.',
          variant: 'destructive',
        })
      }
    },
    onError: (error) => {
      const errorMessage =
        error.error?.serverError ||
        JSON.stringify(error.error?.validationErrors) ||
        'An error occurred while saving.'
      toast({
        title: 'Error saving template',
        description: errorMessage,
        variant: 'destructive',
      })
    },
  })

  const handleUndo = () => {
    if (fabricCanvas && fabricCanvas.historyUndo) {
      fabricCanvas.historyUndo()
      fabricCanvas.renderAll()
      toast({
        title: 'Rückgängig gemacht',
        duration: 1000,
      })
    }
  }

  const handleRedo = () => {
    if (fabricCanvas && fabricCanvas.historyRedo) {
      fabricCanvas.historyRedo()
      fabricCanvas.renderAll()
      toast({
        title: 'Wiederholt',
        duration: 1000,
      })
    }
  }

  const handleSave = () => {
    if (fabricCanvas && storeDesignTemplateId) {
      executeSave({
        id: storeDesignTemplateId,
        canvas_data: JSON.stringify(fabricCanvas.toJSON()),
      })
    } else if (!storeDesignTemplateId) {
      toast({
        title: 'Cannot Save',
        description: 'Please initialize a template first (Metadata Tab).',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Cannot Save',
        description: 'Canvas is not ready.',
        variant: 'destructive',
      })
    }
  }

  const handleDeselect = () => {
    if (fabricCanvas) {
      fabricCanvas.discardActiveObject()
      fabricCanvas.renderAll()
      toast({
        title: 'Auswahl aufgehoben',
        duration: 1000,
      })
    }
  }

  const handleZoom = (delta: number) => {
    const currentScale = scale
    const zoomFactor = 0.1
    const newScale = Math.min(Math.max(0.1, currentScale + delta * zoomFactor), 4)
    setScale(newScale)
  }

  const handlePanToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newPanState = !canPan
    setCanPan(newPanState)
    if (fabricCanvas) {
      fabricCanvas.defaultCursor = newPanState ? 'grab' : 'default'
      fabricCanvas.selection = !newPanState
      if (newPanState) {
        fabricCanvas.on('mouse:down', () => {
          fabricCanvas.defaultCursor = 'grabbing'
        })
        fabricCanvas.on('mouse:up', () => {
          fabricCanvas.defaultCursor = 'grab'
        })
      } else {
        fabricCanvas.off('mouse:down')
        fabricCanvas.off('mouse:up')
      }
      fabricCanvas.renderAll()
    }
  }

  return (
    <div className='fixed bottom-8 left-0 right-0 z-50 px-4 pointer-events-none'>
      <div className='relative max-w-screen-xl mx-auto flex items-center justify-center'>
        <div id='main-toolbar' className='pointer-events-auto'>
          <div className='bg-background/80 backdrop-blur-sm border rounded-full shadow-lg p-2'>
            <TooltipProvider>
              <div className='flex items-center gap-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleUndo}
                      className='h-10 w-10 rounded-full'
                    >
                      <Undo2 className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rückgängig (Strg+Z)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleRedo}
                      className='h-10 w-10 rounded-full'
                    >
                      <Redo2 className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Wiederholen (Strg+Y)</p>
                  </TooltipContent>
                </Tooltip>
                <div className='w-px h-6 bg-border mx-1' />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleDeselect}
                      className='h-10 w-10 rounded-full'
                    >
                      <MousePointer2 className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Auswahl aufheben (Esc)</p>
                  </TooltipContent>
                </Tooltip>
                <div className='w-px h-6 bg-border mx-1' />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleZoom(1)}
                      className='h-10 w-10 rounded-full'
                    >
                      <ZoomIn className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vergrößern</p>
                  </TooltipContent>
                </Tooltip>
                <Badge variant='outline' className='px-3 py-1 text-xs min-w-[50px] text-center'>
                  {Math.round(scale * 100)}%
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleZoom(-1)}
                      className='h-10 w-10 rounded-full'
                    >
                      <ZoomOut className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Verkleinern</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={canPan ? 'default' : 'ghost'}
                      size='icon'
                      onClick={handlePanToggle}
                      className='h-10 w-10 rounded-full'
                    >
                      <Hand className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{canPan ? 'Verschieben (Klicken zum Beenden)' : 'Verschieben aktivieren'}</p>
                  </TooltipContent>
                </Tooltip>
                <div className='w-px h-6 bg-border mx-1' />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleSave}
                      className='h-10 w-10 rounded-full'
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-current'></div>
                      ) : (
                        <Save className='h-5 w-5' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Speichern (Strg+S)</p>
                  </TooltipContent>
                </Tooltip>
                <ThemeSwitcher />
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
