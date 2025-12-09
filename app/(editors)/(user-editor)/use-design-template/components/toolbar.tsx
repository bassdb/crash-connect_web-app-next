'use client'

import { Download, MousePointer2, Hand, ZoomIn, ZoomOut, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import useEditorStore from '@/app/(editors)/_hooks/useEditorStore'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import { useToast } from '@/hooks/use-toast'
import CanvasInfos from './canvas-infos'
import { useState, useEffect } from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Badge } from '@/components/ui/badge'

export default function Toolbar() {
  const { scale, setScale, canPan, setCanPan } = useEditorStore()
  const { canvasWidth, canvasHeight, fabricCanvas } = useCanvasStore()
  const { storeDesignTemplateId, designTemplateData } = useDesignTemplateStore()
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

  const handleExport = () => {
    if (!fabricCanvas) {
      toast({
        title: 'Fehler',
        description: 'Canvas nicht bereit für Export.',
        variant: 'destructive',
      })
      return
    }

    try {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      })

      const link = document.createElement('a')
      link.download = `${designTemplateData?.name || 'design-template'}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export erfolgreich',
        description: 'Das Design wurde als PNG-Datei heruntergeladen.',
        className: 'border-green-500',
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export fehlgeschlagen',
        description: 'Das Design konnte nicht exportiert werden.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='fixed bottom-8 left-0 right-0 z-50 px-4 pointer-events-none'>
      <div className='relative max-w-screen-xl mx-auto flex items-center justify-between'>
        <div className='flex-shrink-0 pointer-events-auto'>
          <CanvasInfos />
        </div>

        <div id='main-toolbar' className='absolute left-1/2 -translate-x-1/2 pointer-events-auto'>
          <div className='bg-background/80 backdrop-blur-sm border rounded-full shadow-lg p-2'>
            <TooltipProvider>
              <div className='flex items-center gap-1'>
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
                      onClick={handleExport}
                      className='h-10 w-10 rounded-full'
                    >
                      <Download className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Design exportieren</p>
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
