'use client'

// react imports
import { useEffect } from 'react'

// ui imports
import { Badge } from '@/components/ui/badge'

import {
  ChevronDown,
  FileImage,
  Layers,
  Settings,
  Edit,
  ArrowLeft,
  GripVertical,
  Type,
  Trash,
  Eye,
  EyeOff,
} from 'lucide-react'

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// logic imports
import { Canvas, ActiveSelection } from 'fabric'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import { updateCanvasLayerOrder } from '@/app/(editors)/_canvas-functions/layer-management'

// SortableItem component
interface SortableItemProps {
  layer: any
  index: number
  activeLayerId: string | null
  onLayerClick: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
  onDeleteLayer: (layerId: string) => void
}

function SortableItem({
  layer,
  index,
  activeLayerId,
  onLayerClick,
  onToggleVisibility,
  onDeleteLayer,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: layer.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border border-primary/50 h-10
        ${
          activeLayerId === layer.id
            ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/10'
            : 'bg-secondary/75'
        }`}
      onClick={() => onLayerClick(layer.id)}
    >
      <GripVertical
        className='h-4 w-4 text-muted-foreground cursor-move'
        {...attributes}
        {...listeners}
      />
      <span className='text-sm truncate flex-1'>{layer.filename}</span>
      {layer.visible ? (
        <Eye
          className='h-4 w-4 cursor-pointer hover:text-primary transition-colors'
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility(layer.id)
          }}
        />
      ) : (
        <EyeOff
          className='h-4 w-4 cursor-pointer hover:text-primary transition-colors text-muted-foreground'
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility(layer.id)
          }}
        />
      )}
      <Trash
        className='h-4 w-4 cursor-pointer hover:text-destructive transition-colors'
        onClick={(e) => {
          e.stopPropagation()
          onDeleteLayer(layer.id)
        }}
      />
    </div>
  )
}

export default function LayersEditor() {
  const {
    fabricCanvas,
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    isTemplateCanvasDataLoaded,
  } = useCanvasStore()

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const updateLayers = () => {
    console.log('now updating layers')
    if (fabricCanvas) {
      const objects = fabricCanvas.getObjects()
      console.log('objects: ', objects)

      // Create a map to track counts for each type
      const typeCounts: { [key: string]: number } = {}

      objects.forEach((object, index) => {
        object.set('data', {
          ...object.get('data'),
          id:
            object.get('data')?.id ||
            `${object.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          zIndex: objects.length - index - 1, // Reverse the zIndex so top objects have higher numbers
          visible: object.visible ?? true,
        })
      })

      const layerObjects = objects
        .filter((object) => !object.get('data')?.id?.startsWith('horizontal_'))
        .map((object) => {
          // Increment count for this type only if no specific name is set
          const hasSpecificName = object.get('data')?.name
          if (!hasSpecificName) {
            typeCounts[object.type] = (typeCounts[object.type] || 0) + 1
          }
          // Capitalize first letter and make type name friendly
          const friendlyType = object.type.charAt(0).toUpperCase() + object.type.slice(1)

          return {
            id:
              object.get('data')?.id ||
              `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            order: object.get('data')?.zIndex,
            type: object.type,
            filename: object.get('data')?.name || `${friendlyType} ${typeCounts[object.type] || 1}`,
            file: new File([], object.get('data')?.name || 'layer'),
            visible: object.visible ?? true,
          }
        })
        .sort((a, b) => (b.order || 0) - (a.order || 0)) // Sort by zIndex, highest first
      setLayers(layerObjects)
      fabricCanvas.renderAll()
      console.log('layers are up to date now')
    }
  }

  const handleDeleteLayer = (layerId: string) => {
    if (!fabricCanvas) return

    const objects = fabricCanvas.getObjects()
    const objectToDelete = objects.find((obj) => obj.get('data')?.id === layerId)

    if (objectToDelete) {
      fabricCanvas.remove(objectToDelete)
      fabricCanvas.renderAll()
      // updateLayers will be called automatically due to the 'object:removed' event
    }
  }

  const handleToggleVisibility = (layerId: string) => {
    if (!fabricCanvas) return

    const objects = fabricCanvas.getObjects()
    const objectToToggle = objects.find((obj) => obj.get('data')?.id === layerId)

    if (objectToToggle) {
      objectToToggle.visible = !objectToToggle.visible
      fabricCanvas.renderAll()
      updateLayers()
    }
  }

  useEffect(() => {
    if (fabricCanvas && isTemplateCanvasDataLoaded) {
      console.log('Template canvas data loaded.')
      updateLayers()
    }
  }, [isTemplateCanvasDataLoaded])

  useEffect(() => {
    if (fabricCanvas) {
      // Event-Handler für Canvas-Selektion
      const handleSelection = (e: any) => {
        const selectedObject = e.selected?.[0]
        if (selectedObject) {
          const layerId = selectedObject.get('data')?.id
          if (layerId) {
            setActiveLayerId(layerId)
          }
        } else {
          setActiveLayerId(null)
        }
      }

      // Event-Handler für Selektion aufheben
      const handleDeselection = () => {
        setActiveLayerId(null)
      }

      fabricCanvas.on('selection:created', handleSelection)
      fabricCanvas.on('selection:updated', handleSelection)
      fabricCanvas.on('selection:cleared', handleDeselection)

      // Bestehende Event-Listener
      fabricCanvas.on('object:added', updateLayers)
      fabricCanvas.on('object:removed', updateLayers)
      fabricCanvas.on('object:modified', updateLayers)

      return () => {
        fabricCanvas.off('selection:created', handleSelection)
        fabricCanvas.off('selection:updated', handleSelection)
        fabricCanvas.off('selection:cleared', handleDeselection)
        fabricCanvas.off('object:added', updateLayers)
        fabricCanvas.off('object:removed', updateLayers)
        fabricCanvas.off('object:modified', updateLayers)
      }
    }
  }, [fabricCanvas, setActiveLayerId])

  const handleLayerClick = (layerId: string) => {
    if (!fabricCanvas) return

    setActiveLayerId(layerId)

    // Find the object to activate
    const objects = fabricCanvas.getObjects()
    const objectToActivate = objects.find((obj) => obj.get('data')?.id === layerId)

    if (objectToActivate) {
      // Deselect all objects first
      fabricCanvas.discardActiveObject()

      // Create a temporary selection without bringing the object to front
      const selection = new ActiveSelection([objectToActivate], {
        canvas: fabricCanvas,
      })

      fabricCanvas.setActiveObject(selection)
      fabricCanvas.requestRenderAll()
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = layers.findIndex((layer) => layer.id === active.id)
      const newIndex = layers.findIndex((layer) => layer.id === over?.id)

      const newLayers = arrayMove(layers, oldIndex, newIndex)
      setLayers(newLayers)

      // Update fabric canvas object order
      if (fabricCanvas) {
        // Create a new array with objects in the correct order
        const reorderedObjects = newLayers
          .map((layer) => fabricCanvas.getObjects().find((obj) => obj.get('data')?.id === layer.id))
          .filter(Boolean)

        // Clear canvas and re-add objects in new order
        const allObjects = fabricCanvas.getObjects()
        fabricCanvas.clear()

        // Add objects back in the new order
        reorderedObjects.forEach((object, index) => {
          if (object) {
            object.set('data', {
              ...object.get('data'),
              zIndex: index,
            })
            fabricCanvas.add(object)
          }
        })

        fabricCanvas.renderAll()
      }
    }
  }

  return isTemplateCanvasDataLoaded ? (
    <div className='flex flex-row'>
      {/* Numbering column */}
      <div className='flex flex-col items-center pr-2 select-none gap-2'>
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`flex items-center justify-center gap-2 p-4 text-xs font-semibold text-muted-foreground w-6 ${
              activeLayerId === layer.id ? 'text-emerald-600' : ''
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      {/* Layers list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={layers.map((layer) => layer.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='border rounded-md p-2 space-y-4 min-h-6 flex-1'>
            {layers.map((layer, index) => (
              <SortableItem
                key={layer.id}
                layer={layer}
                index={index}
                activeLayerId={activeLayerId}
                onLayerClick={handleLayerClick}
                onToggleVisibility={handleToggleVisibility}
                onDeleteLayer={handleDeleteLayer}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  ) : (
    <p>No layers to show</p>
  )
}
