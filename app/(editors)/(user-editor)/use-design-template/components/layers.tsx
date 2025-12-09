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

// SortableItem component
interface SortableItemProps {
  layer: any
  index: number
  activeLayerId: string | null
  onLayerClick: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
}

function SortableItem({
  layer,
  index,
  activeLayerId,
  onLayerClick,
  onToggleVisibility,
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
          className='h-4 w-4 cursor-pointer hover:text-primary transition-colors opacity-50'
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility(layer.id)
          }}
        />
      )}
    </div>
  )
}

export default function LayersEditor() {
  const {
    fabricCanvas,
    layers,
    setLayers,
    selectedObject,
    setSelectedObject,
    isTemplateCanvasDataLoaded,
  } = useCanvasStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (fabricCanvas && isTemplateCanvasDataLoaded) {
      updateLayers()
    }
  }, [fabricCanvas, isTemplateCanvasDataLoaded, selectedObject])

  const updateLayers = () => {
    if (!fabricCanvas) return

    const objects = fabricCanvas.getObjects()
    const layerData = objects.map((obj: any, index: number) => ({
      id: obj.id || `layer-${index}`,
      type: obj.type || 'unknown',
      filename: obj.name || getObjectTypeName(obj),
      visible: obj.visible !== false,
      object: obj,
    }))

    setLayers(layerData)
  }

  const getObjectTypeName = (obj: any) => {
    switch (obj.type) {
      case 'text':
        return `Text: ${obj.text?.slice(0, 15) || 'Unbenannt'}${obj.text?.length > 15 ? '...' : ''}`
      case 'image':
        return 'Bild'
      case 'rect':
        return 'Rechteck'
      case 'circle':
        return 'Kreis'
      case 'polygon':
        return 'Polygon'
      default:
        return obj.type || 'Objekt'
    }
  }

  const handleLayerClick = (layerId: string) => {
    if (!fabricCanvas) return

    const obj = fabricCanvas.getObjects().find((o: any) => (o.id || `layer-${fabricCanvas.getObjects().indexOf(o)}`) === layerId)
    if (obj) {
      fabricCanvas.setActiveObject(obj)
      setSelectedObject(obj)
      fabricCanvas.renderAll()
    }
  }

  const handleToggleVisibility = (layerId: string) => {
    if (!fabricCanvas) return

    const obj = fabricCanvas.getObjects().find((o: any) => (o.id || `layer-${fabricCanvas.getObjects().indexOf(o)}`) === layerId)
    if (obj) {
      obj.set('visible', !obj.visible)
      fabricCanvas.renderAll()
      updateLayers()
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLayers((items: any[]) => {
        const oldIndex = items.findIndex((item: any) => item.id === active.id)
        const newIndex = items.findIndex((item: any) => item.id === over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)

        // Update canvas layer order
        if (fabricCanvas) {
          const reorderedObjects = newOrder.map((layer: any) => layer.object)
          fabricCanvas.clear()
          reorderedObjects.forEach((obj: any) => fabricCanvas.add(obj))
          fabricCanvas.renderAll()
        }

        return newOrder
      })
    }
  }

  const activeLayerId = selectedObject ? ((selectedObject as any).id || `layer-${fabricCanvas?.getObjects().indexOf(selectedObject)}`) : null

  if (!isTemplateCanvasDataLoaded || layers.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-4 text-center'>
        <Layers className='h-8 w-8 text-muted-foreground mb-2' />
        <p className='text-sm text-muted-foreground'>Keine Ebenen gefunden</p>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium'>Ebenen ({layers.length})</span>
        <Badge variant='outline' className='text-xs'>
          Nur Ansicht
        </Badge>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layers.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className='space-y-1'>
            {layers.map((layer, index) => (
              <SortableItem
                key={layer.id}
                layer={layer}
                index={index}
                activeLayerId={activeLayerId}
                onLayerClick={handleLayerClick}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
