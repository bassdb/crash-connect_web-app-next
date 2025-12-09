'use client'

import { useEffect, useState, useRef } from 'react'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import * as fabric from 'fabric'

import { useToast } from '@/hooks/use-toast'

interface EditorDesignTemplateInjectProps {
  templateId?: string
  canvasData?: string | null
}

export default function EditorDesignTemplateInject({
  templateId,
  canvasData,
}: EditorDesignTemplateInjectProps) {
  const {
    fabricCanvas,
    setFabricCanvas,
    canvasWidth,
    canvasHeight,
    setRenderFrameRef,
    renderFrameRef,
    isTemplateCanvasDataLoaded,
    setIsTemplateCanvasDataLoaded,
    setSelectedObject,
  } = useCanvasStore()

  const { setStoreDesignTemplateId } = useDesignTemplateStore()

  const [isInitialCanvasLoaded, setIsInitialCanvasLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (canvasRef.current) {
      // Fabric custom properties werden global im Layout initialisiert
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 'white',
      })

      // Add selection event listeners
      initCanvas.on('selection:created', (e) => {
        setSelectedObject(e.selected?.[0] || null)
      })
      initCanvas.on('selection:updated', (e) => {
        setSelectedObject(e.selected?.[0] || null)
      })
      initCanvas.on('selection:cleared', () => {
        setSelectedObject(null)
      })

      initCanvas.renderAll()
      setFabricCanvas(initCanvas)
      if (containerRef.current) {
        setRenderFrameRef(containerRef.current)
        console.log('renderFrameRef set for use-template:', containerRef.current)
      }
      setIsInitialCanvasLoaded(true)

      return () => {
        initCanvas.dispose()
        setIsInitialCanvasLoaded(false)
        setIsTemplateCanvasDataLoaded(false)
        setSelectedObject(null)
      }
    }
  }, [])

  useEffect(() => {
    if (templateId && fabricCanvas && isInitialCanvasLoaded) {
      console.log('Loading template for use:', templateId)
      setStoreDesignTemplateId(templateId)

      // Load canvas data if available
      if (canvasData) {
        try {
          const canvasJSON = canvasData
          fabricCanvas.loadFromJSON(canvasJSON, () => {
            // Nach dem Laden: Canvas für Nutzung vorbereiten
            fabricCanvas.renderAll()
            setIsTemplateCanvasDataLoaded(true)

            toast({
              title: 'Template geladen',
              description: 'Das Template wurde erfolgreich geladen und kann verwendet werden.',
              className: 'border-green-500',
            })
          })
        } catch (error) {
          console.error('Error loading template canvas data:', error)
          setIsTemplateCanvasDataLoaded(false)
          toast({
            title: 'Fehler beim Laden',
            description: 'Das Template konnte nicht geladen werden.',
            variant: 'destructive',
          })
        }
      } else {
        // Kein Canvas-Data verfügbar
        setIsTemplateCanvasDataLoaded(true)
        toast({
          title: 'Template ohne Canvas-Daten',
          description: 'Das Template wurde geladen, enthält aber keine Canvas-Daten.',
          variant: 'destructive',
        })
      }
    }
  }, [templateId, fabricCanvas, isInitialCanvasLoaded, canvasData])

  // Update canvas dimensions wenn sich die Größe ändert
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.setWidth(canvasWidth)
      fabricCanvas.setHeight(canvasHeight)
      fabricCanvas.renderAll()
    }
  }, [canvasWidth, canvasHeight, fabricCanvas])

  return (
    <div
      ref={containerRef}
      className='w-full h-full relative'
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
      }}
    >
      <canvas ref={canvasRef} className='border border-gray-300' />
    </div>
  )
}
