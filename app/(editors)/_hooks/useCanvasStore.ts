import { create } from 'zustand'
import * as fabric from 'fabric'

// Define a custom interface extending FabricObject if needed to strongly type 'data'
interface FabricObjectWithData extends fabric.Object {
  data?: {
    id?: string
    zIndex?: number
    name?: string
    type?: 'static' | 'dynamic'
    dynamicType?:
      | 'team_logo'
      | 'primary_color'
      | 'secondary_color'
      | 'tertiary_color'
      | 'text'
      | 'jersey_number'
      | 'additional_text'
    replaceable?: boolean
    teamId?: string
    colorProperty?: string
    textProperty?: string
    // Add other custom data properties here
  }
}

export interface LayerItem {
  id: string
  filename: string
  visible: boolean
  type: string
  supabaseUrl?: string
}

interface CanvasState {
  fabricCanvas: fabric.Canvas | null
  setFabricCanvas: (fabricCanvas: fabric.Canvas | null) => void
  isTemplateCanvasDataLoaded: boolean
  setIsTemplateCanvasDataLoaded: (isLoaded: boolean) => void
  canvasWidth: number
  setCanvasWidth: (width: number) => void
  canvasHeight: number
  setCanvasHeight: (height: number) => void
  temporaryAssets: File[] // Files staged for upload/canvas addition
  setTemporaryAssets: (temporaryAssets: File[]) => void
  layers: LayerItem[] // Representation of canvas objects for UI
  setLayers: (layers: LayerItem[]) => void
  selectedLayer: LayerItem | null // Corresponds to selectedObject
  setSelectedLayer: (selectedLayer: LayerItem | null) => void
  activeLayerId: string | null // ID of the layer currently selected in the UI
  setActiveLayerId: (id: string | null) => void
  selectedObject: FabricObjectWithData | null // Actual Fabric object selected on canvas
  setSelectedObject: (object: FabricObjectWithData | null) => void
  enableEffects: boolean // Specific visual effect setting
  setEnableEffects: (enableEffects: boolean) => void
  guidesVisible: boolean
  setGuidesVisible: (guidesVisible: boolean) => void
  uploadedFiles: File[] | null // Files that have been successfully uploaded
  setUploadedFiles: (files: File[] | null) => void
  layerOrder: number[] // Consider if needed if layers array holds order
  updateLayerOrder: (fromIndex: number, toIndex: number) => void
  canvasState: 'draft' | 'saved' | 'exported' // State related to canvas saving/modification
  setCanvasState: (canvasState: 'draft' | 'saved' | 'exported') => void
  isCanvasSaved: boolean // New unified canvas save state
  setIsCanvasSaved: (isCanvasSaved: boolean) => void
  markCanvasAsSaved: () => void
  lastCanvasState: string | null // Last saved canvas JSON state
  setLastCanvasState: (lastCanvasState: string | null) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  uploadProgress: { [key: string]: number }
  setUploadProgress: (progress: { [key: string]: number }) => void
  renderFrameRef: HTMLDivElement | null
  setRenderFrameRef: (containerRef: HTMLDivElement | null) => void
  initializeCanvasChangeTracking: () => void
}

const useCanvasStore = create<CanvasState>((set, get) => ({
  fabricCanvas: null,
  setFabricCanvas: (fabricCanvas: fabric.Canvas | null) => set({ fabricCanvas }),
  isTemplateCanvasDataLoaded: false,
  setIsTemplateCanvasDataLoaded: (isLoaded: boolean) =>
    set({ isTemplateCanvasDataLoaded: isLoaded }),
  canvasWidth: 1080,
  setCanvasWidth: (width: number) => {
    set({ canvasWidth: width })
    get().fabricCanvas?.setDimensions({ width })
    get().fabricCanvas?.renderAll()
  },
  canvasHeight: 1920,
  setCanvasHeight: (height: number) => {
    set({ canvasHeight: height })
    get().fabricCanvas?.setDimensions({ height })
    get().fabricCanvas?.renderAll()
  },
  temporaryAssets: [] as File[],
  setTemporaryAssets: (temporaryAssets: File[]) => set({ temporaryAssets }),
  layers: [] as LayerItem[],
  setLayers: (layers: LayerItem[]) => set({ layers }),
  selectedLayer: null,
  setSelectedLayer: (selectedLayer: LayerItem | null) => set({ selectedLayer }),
  activeLayerId: null,
  setActiveLayerId: (id) => set({ activeLayerId: id }),
  selectedObject: null,
  setSelectedObject: (object) => set({ selectedObject: object }),
  enableEffects: false,
  setEnableEffects: (enableEffects: boolean) => set({ enableEffects }),
  guidesVisible: true,
  setGuidesVisible: (guidesVisible: boolean) => set({ guidesVisible }),
  uploadedFiles: null,
  setUploadedFiles: (files: File[] | null) => set({ uploadedFiles: files }),
  layerOrder: [], // Maybe remove if `layers` array order is source of truth
  updateLayerOrder: (fromIndex: number, toIndex: number) =>
    set((state) => {
      const newLayers = [...state.layers]
      const [movedLayer] = newLayers.splice(fromIndex, 1)
      newLayers.splice(toIndex, 0, movedLayer)
      // Re-assign order based on new array index
      const orderedLayers = newLayers.map((layer, idx) => ({ ...layer, order: idx }))
      // Update canvas object zIndex based on new order
      const canvas = get().fabricCanvas
      if (canvas) {
        orderedLayers.forEach((layer) => {
          const obj = canvas.getObjects().find((o: FabricObjectWithData) => o.data?.id === layer.id)
          if (obj) {
            // Use fabric.Canvas methods for z-index manipulation
            // @ts-ignore - Bypassing potential type issue with moveTo
            canvas.moveTo(obj, orderedLayers.length - 1 - layer.order) // Move to specific index
          }
        })
        canvas.renderAll()
      }
      return { layers: orderedLayers }
    }),
  canvasState: 'draft',
  setCanvasState: (canvasState: 'draft' | 'saved' | 'exported') => set({ canvasState }),
  isCanvasSaved: true, // Start as saved
  setIsCanvasSaved: (isCanvasSaved: boolean) => set({ isCanvasSaved }),
  lastCanvasState: null,
  setLastCanvasState: (lastCanvasState: string | null) => set({ lastCanvasState }),
  backgroundColor: '#FFFFFF', // Default background color
  setBackgroundColor: (backgroundColor: string) => {
    set({ backgroundColor })
    get().fabricCanvas?.set('backgroundColor', backgroundColor)
    get().fabricCanvas?.renderAll()
  },
  uploadProgress: {},
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  renderFrameRef: null,
  setRenderFrameRef: (renderFrameRef: HTMLDivElement | null) => set({ renderFrameRef }),

  initializeCanvasChangeTracking: () => {
    const { fabricCanvas, isTemplateCanvasDataLoaded } = get()
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) return

    // Cleanup only listeners this tracker manages to avoid removing selection handlers
    fabricCanvas.off('object:added')
    fabricCanvas.off('object:removed')
    fabricCanvas.off('object:modified')
    fabricCanvas.off('path:created')
    fabricCanvas.off('object:moving')
    fabricCanvas.off('object:scaling')
    fabricCanvas.off('object:rotating')

    const checkCanvasChanges = () => {
      try {
        const currentCanvasState = JSON.stringify(fabricCanvas.toJSON(['data']))
        const { lastCanvasState } = get()

        // Beim ersten Laden den aktuellen Zustand als gespeichert markieren
        if (lastCanvasState === null) {
          set({ lastCanvasState: currentCanvasState, isCanvasSaved: true, canvasState: 'saved' })
          return
        }

        // Vergleiche aktuellen Zustand mit letztem gespeicherten Zustand
        const hasChanges = currentCanvasState !== lastCanvasState
        set({
          isCanvasSaved: !hasChanges,
          canvasState: hasChanges ? 'draft' : 'saved',
        })
      } catch (error) {
        console.error('Error checking canvas changes:', error)
      }
    }

    // Event-Listener für Canvas-Änderungen
    const handleCanvasChange = () => {
      // Kleine Verzögerung um mehrere schnelle Änderungen zu debounce
      setTimeout(checkCanvasChanges, 100)
    }

    // Canvas Events überwachen
    fabricCanvas.on('object:added', handleCanvasChange)
    fabricCanvas.on('object:removed', handleCanvasChange)
    fabricCanvas.on('object:modified', handleCanvasChange)
    fabricCanvas.on('path:created', handleCanvasChange)
    fabricCanvas.on('object:moving', handleCanvasChange)
    fabricCanvas.on('object:scaling', handleCanvasChange)
    fabricCanvas.on('object:rotating', handleCanvasChange)

    // Initialer Check - setze den aktuellen Zustand als "gespeichert"
    setTimeout(() => {
      const currentCanvasState = JSON.stringify(fabricCanvas.toJSON(['data']))
      set({
        lastCanvasState: currentCanvasState,
        isCanvasSaved: true,
        canvasState: 'saved',
      })
    }, 50)
  },

  markCanvasAsSaved: () => {
    const { fabricCanvas } = get()
    if (!fabricCanvas) return

    try {
      const currentCanvasState = JSON.stringify(fabricCanvas.toJSON(['data']))
      set({
        lastCanvasState: currentCanvasState,
        isCanvasSaved: true,
        canvasState: 'saved',
      })
    } catch (error) {
      console.error('Error marking canvas as saved:', error)
    }
  },
}))

export default useCanvasStore
