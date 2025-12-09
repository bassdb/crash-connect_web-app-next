'use client'

import { useEffect, useState, useRef } from 'react'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import useExampleTeamsStore from '@/app/(editors)/_hooks/useExampleTeamsStore'
import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'
import * as fabric from 'fabric'

import { loadExistingTemplate } from '../../_canvas-functions/load-existing-template'
import { normalizeCanvasDynamicLayers } from '../../_canvas-functions/layer-management'
import { initCanvasHistory } from '../../_canvas-functions/canvas-history'
import { useToast } from '@/hooks/use-toast'

interface EditorDesignTemplateInjectProps {
  designTemplateId?: string
  canvasData?: string | null
  designTemplateDataFromServer?: any | null
}

export default function EditorDesignTemplateInject({
  designTemplateId,
  canvasData,
  designTemplateDataFromServer,
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

  const { setStoreDesignTemplateId, setDesignTemplateData } = useDesignTemplateStore()

  const { updateSavedTeam, selectTeamForPreview } = useExampleTeamsStore()
  const { loadTemplateColorDefaults } = useDynamicValuesStore()

  const [isInitialCanvasLoaded, setIsInitialCanvasLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  // Single Source of Truth: Initialisiere Stores aus Server-Props
  useEffect(() => {
    if (!isInitialCanvasLoaded) return
    if (designTemplateId) setStoreDesignTemplateId(designTemplateId)
    if (designTemplateDataFromServer) {
      setDesignTemplateData(designTemplateDataFromServer as any)

      // Extract and set example team data if available
      if (designTemplateDataFromServer.example_team) {
        const exampleTeamData = designTemplateDataFromServer.example_team
        // Set as saved team (from database)
        updateSavedTeam(exampleTeamData)
        // Also set as previewed team so it's immediately visible
        selectTeamForPreview(exampleTeamData)
      }

      // Apply template color defaults to DynamicValuesStore
      const defaults = (designTemplateDataFromServer as any).color_defaults
      if (defaults && defaults.primary && defaults.secondary && defaults.tertiary) {
        loadTemplateColorDefaults({
          primary: defaults.primary,
          secondary: defaults.secondary,
          tertiary: defaults.tertiary,
        })
      }
    }
  }, [
    isInitialCanvasLoaded,
    designTemplateId,
    designTemplateDataFromServer,
    setStoreDesignTemplateId,
    setDesignTemplateData,
    updateSavedTeam,
    selectTeamForPreview,
    loadTemplateColorDefaults,
  ])

  useEffect(() => {
    if (canvasRef.current) {
      // Fabric custom properties werden global im Layout initialisiert
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 'grey',
      })

      // Initialize canvas history
      initCanvasHistory(initCanvas)

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
        console.log('renderFrameRef set to:', containerRef.current)
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
    if (designTemplateId && fabricCanvas && isInitialCanvasLoaded) {
      console.log('Loading existing template:', designTemplateId)
      // Load existing template assets
      loadExistingTemplate(designTemplateId)

      // Load canvas data if available
      if (canvasData) {
        try {
          const canvasJSON = canvasData
          fabricCanvas.loadFromJSON(canvasJSON, () => {
            // Nach dem Laden: dynamische Layer normalisieren und Namen fixieren
            normalizeCanvasDynamicLayers(fabricCanvas)
            setIsTemplateCanvasDataLoaded(true)
          })
          // console.log('renderFrameRef', renderFrameRef)
        } catch (error) {
          console.error('Error loading canvas data:', error)
          setIsTemplateCanvasDataLoaded(false)
          toast({
            title: 'Error loading canvas data',
            description: 'Please try again',
          })
        }
      } else {
        // No canvas data present, but we still want to mark as loaded so Layers and others work
        setIsTemplateCanvasDataLoaded(true)
      }
    }
  }, [designTemplateId, fabricCanvas, isInitialCanvasLoaded])

  // Separate useEffect for rendering after data is loaded
  useEffect(() => {
    if (fabricCanvas && isTemplateCanvasDataLoaded) {
      // Add a small delay before rendering
      const timeoutId = setTimeout(() => {
        // Ensure all objects have their coordinates set
        fabricCanvas.getObjects().forEach((obj) => {
          obj.setCoords()
        })

        // Force a complete re-render
        fabricCanvas.requestRenderAll()
        fabricCanvas.renderAll()
        console.log('Canvas data loaded and rendered successfully')
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [fabricCanvas, isTemplateCanvasDataLoaded])

  return (
    <div
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
      }}
      ref={containerRef}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
