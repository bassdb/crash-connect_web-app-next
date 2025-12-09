'use client'

import { useEffect, useState } from 'react'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Image, Type, Square, ChevronDown } from 'lucide-react'
import * as fabric from 'fabric'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface LayerProperties {
  left: number
  top: number
  width: number
  height: number
  angle: number
  opacity: number
  visible: boolean
  text?: string
  fontSize?: number
  blendMode?: string
}

export default function LayerProperties() {
  const { selectedObject, fabricCanvas } = useCanvasStore()
  const [properties, setProperties] = useState<LayerProperties>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    angle: 0,
    opacity: 1,
    visible: true,
    text: '',
    fontSize: 40,
  })
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (selectedObject) {
      setProperties({
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        width: Math.round(selectedObject.width || 0),
        height: Math.round(selectedObject.height || 0),
        angle: Math.round(selectedObject.angle || 0),
        opacity: selectedObject.opacity || 1,
        visible: selectedObject.visible !== false,
        text: (selectedObject as fabric.Text).text || '',
        fontSize: (selectedObject as fabric.Text).fontSize || 40,
        blendMode: selectedObject.globalCompositeOperation || 'source-over',
      })
    }
  }, [selectedObject])

  const updateProperty = (property: keyof LayerProperties, value: any) => {
    if (!selectedObject || !fabricCanvas) return

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    const timeout = setTimeout(() => {
      try {
        switch (property) {
          case 'left':
            selectedObject.set('left', value)
            break
          case 'top':
            selectedObject.set('top', value)
            break
          case 'width':
            selectedObject.set('width', value)
            break
          case 'height':
            selectedObject.set('height', value)
            break
          case 'angle':
            selectedObject.set('angle', value)
            break
          case 'opacity':
            selectedObject.set('opacity', value)
            break
          case 'visible':
            selectedObject.set('visible', value)
            break
          case 'text':
            if (selectedObject.type === 'text') {
              ;(selectedObject as fabric.Text).set('text', value)
            }
            break
          case 'fontSize':
            if (selectedObject.type === 'text') {
              ;(selectedObject as fabric.Text).set('fontSize', value)
            }
            break
          case 'blendMode':
            selectedObject.set('globalCompositeOperation', value)
            break
        }

        selectedObject.setCoords()
        fabricCanvas.renderAll()
      } catch (error) {
        console.error('Error updating property:', error)
      }
    }, 100)

    setDebounceTimeout(timeout)
  }

  const getObjectTypeIcon = (obj: fabric.Object) => {
    switch (obj.type) {
      case 'text':
        return <Type className='h-4 w-4' />
      case 'image':
        return <Image className='h-4 w-4' />
      default:
        return <Square className='h-4 w-4' />
    }
  }

  const getObjectTypeName = (obj: fabric.Object) => {
    switch (obj.type) {
      case 'text':
        return 'Text'
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

  if (!selectedObject) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <div className='text-muted-foreground mb-2'>
          <Square className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p className='text-sm'>Kein Objekt ausgewählt</p>
          <p className='text-xs mt-1'>Wählen Sie ein Element im Canvas aus, um dessen Eigenschaften zu bearbeiten.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 p-3 bg-muted/50 rounded-lg'>
        {getObjectTypeIcon(selectedObject)}
        <div>
          <div className='font-medium text-sm'>{getObjectTypeName(selectedObject)}</div>
          <div className='text-xs text-muted-foreground'>
            {selectedObject.type === 'text' && (selectedObject as fabric.Text).text
              ? `"${(selectedObject as fabric.Text).text?.slice(0, 20)}${(selectedObject as fabric.Text).text!.length > 20 ? '...' : ''}"`
              : 'Ausgewählt'}
          </div>
        </div>
      </div>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2'>Position & Größe</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>

        <CollapsibleContent className='space-y-4 py-2'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='left' className='text-sm'>X</Label>
              <Input
                id='left'
                type='number'
                value={properties.left}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setProperties(prev => ({ ...prev, left: value }))
                  updateProperty('left', value)
                }}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='top' className='text-sm'>Y</Label>
              <Input
                id='top'
                type='number'
                value={properties.top}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setProperties(prev => ({ ...prev, top: value }))
                  updateProperty('top', value)
                }}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='width' className='text-sm'>Breite</Label>
              <Input
                id='width'
                type='number'
                value={properties.width}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setProperties(prev => ({ ...prev, width: value }))
                  updateProperty('width', value)
                }}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='height' className='text-sm'>Höhe</Label>
              <Input
                id='height'
                type='number'
                value={properties.height}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setProperties(prev => ({ ...prev, height: value }))
                  updateProperty('height', value)
                }}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='angle' className='text-sm'>Rotation: {properties.angle}°</Label>
            <Slider
              id='angle'
              min={-180}
              max={180}
              step={1}
              value={[properties.angle]}
              onValueChange={([value]) => {
                setProperties(prev => ({ ...prev, angle: value }))
                updateProperty('angle', value)
              }}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2'>Darstellung</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>

        <CollapsibleContent className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='opacity' className='text-sm'>Deckkraft: {Math.round(properties.opacity * 100)}%</Label>
            <Slider
              id='opacity'
              min={0}
              max={1}
              step={0.01}
              value={[properties.opacity]}
              onValueChange={([value]) => {
                setProperties(prev => ({ ...prev, opacity: value }))
                updateProperty('opacity', value)
              }}
            />
          </div>

          <div className='flex items-center justify-between'>
            <Label htmlFor='visible' className='text-sm'>Sichtbar</Label>
            <Switch
              id='visible'
              checked={properties.visible}
              onCheckedChange={(checked) => {
                setProperties(prev => ({ ...prev, visible: checked }))
                updateProperty('visible', checked)
              }}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {selectedObject.type === 'text' && (
        <>
          <Separator />
          <Collapsible defaultOpen>
            <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
              <Label className='ml-2'>Text Eigenschaften</Label>
              <ChevronDown className='h-4 w-4' />
            </CollapsibleTrigger>

            <CollapsibleContent className='space-y-4 py-2'>
              <div className='space-y-2'>
                <Label htmlFor='text' className='text-sm'>Text</Label>
                <Input
                  id='text'
                  value={properties.text}
                  onChange={(e) => {
                    setProperties(prev => ({ ...prev, text: e.target.value }))
                    updateProperty('text', e.target.value)
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='fontSize' className='text-sm'>Schriftgröße</Label>
                <Input
                  id='fontSize'
                  type='number'
                  value={properties.fontSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 12
                    setProperties(prev => ({ ...prev, fontSize: value }))
                    updateProperty('fontSize', value)
                  }}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  )
}
