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
  color?: string
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
    color: '#000000',
  })
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  // Update local state when selected object changes
  useEffect(() => {
    if (selectedObject) {
      setProperties({
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        width: Math.round(selectedObject.width || 0),
        height: Math.round(selectedObject.height || 0),
        angle: selectedObject.angle || 0,
        opacity: selectedObject.opacity || 1,
        visible: selectedObject.visible !== false,
        ...(selectedObject.type === 'text' && {
          text: (selectedObject as fabric.Text).text,
          fontSize: (selectedObject as fabric.Text).fontSize || 40,
          color:
            typeof (selectedObject as any).fill === 'string'
              ? ((selectedObject as any).fill as string)
              : '#000000',
        }),
      })
    }
  }, [selectedObject])

  // Update canvas object when properties change
  useEffect(() => {
    if (selectedObject && fabricCanvas) {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }

      const timeout = setTimeout(() => {
        const updates: Partial<LayerProperties> = {}

        // Only update properties that have changed
        Object.entries(properties).forEach(([key, value]) => {
          if (key === 'color') return // handle color separately as fabric uses 'fill'
          if (selectedObject[key as keyof fabric.Object] !== value) {
            updates[key as keyof LayerProperties] = value
          }
        })

        let didChange = false
        if (Object.keys(updates).length > 0) {
          selectedObject.set(updates)
          didChange = true
        }

        if (
          selectedObject.type === 'text' &&
          typeof properties.color === 'string' &&
          (selectedObject as any).fill !== properties.color
        ) {
          selectedObject.set('fill', properties.color)
          didChange = true
        }

        if (didChange) fabricCanvas.renderAll()
      }, 100) // 100ms debounce

      setDebounceTimeout(timeout)

      return () => {
        if (timeout) {
          clearTimeout(timeout)
        }
      }
    }
  }, [properties, selectedObject, fabricCanvas])

  const updateProperty = (key: keyof LayerProperties, value: any) => {
    setProperties((prev) => ({ ...prev, [key]: value }))
  }

  if (!selectedObject) {
    return null
    // return (
    //   <div className='min-h-16 bg-muted/50 border rounded-md p-4 text-center text-muted-foreground'>
    //     Wähle ein Element aus, um dessen Eigenschaften zu bearbeiten
    //   </div>
    // )
  }

  const getLayerIcon = () => {
    switch (selectedObject.type) {
      case 'image':
        return <Image size={16} />
      case 'text':
        return <Type size={16} />
      default:
        return <Square size={16} />
    }
  }

  return (
    <div className='space-y-4 p-4 bg-muted/50 border rounded-md'>
      <div className='flex items-center gap-2'>
        {getLayerIcon()}
        <Badge variant='outline'>{selectedObject.type}</Badge>
      </div>

      <Separator />

      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between'>
          <span>Eigenschaften</span>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='space-y-4'>
            {/* Position */}
            <div className='space-y-2'>
              <Label>Position</Label>
              <div className='grid grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-xs'>X</Label>
                  <Input
                    type='number'
                    value={properties.left}
                    onChange={(e) => updateProperty('left', parseFloat(e.target.value))}
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs'>Y</Label>
                  <Input
                    type='number'
                    value={properties.top}
                    onChange={(e) => updateProperty('top', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div className='space-y-2'>
              <Label>Größe</Label>
              <div className='grid grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label className='text-xs'>Breite</Label>
                  <Input
                    type='number'
                    value={properties.width}
                    onChange={(e) => updateProperty('width', parseFloat(e.target.value))}
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs'>Höhe</Label>
                  <Input
                    type='number'
                    value={properties.height}
                    onChange={(e) => updateProperty('height', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Label>Rotation</Label>
                <span className='text-sm text-muted-foreground'>
                  {Math.round(properties.angle)}°
                </span>
              </div>
              <Slider
                value={[properties.angle]}
                min={0}
                max={360}
                step={1}
                onValueChange={([value]) => updateProperty('angle', value)}
              />
            </div>

            {/* Opacity */}
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Label>Transparenz</Label>
                <span className='text-sm text-muted-foreground'>
                  {Math.round(properties.opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[properties.opacity * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => updateProperty('opacity', value / 100)}
              />
            </div>

            {/* Text specific properties */}
            {selectedObject.type === 'text' && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <Label>Text</Label>
                  <Input
                    value={properties.text ?? ''}
                    onChange={(e) => updateProperty('text', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Schriftgröße</Label>
                  <Input
                    type='number'
                    value={properties.fontSize ?? 40}
                    onChange={(e) => updateProperty('fontSize', parseFloat(e.target.value))}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Farbe</Label>
                  <Input
                    type='color'
                    value={properties.color ?? '#000000'}
                    onChange={(e) => updateProperty('color', e.target.value)}
                  />
                </div>
              </>
            )}
            <Separator />
            <div className='space-y-2'>
              <Label>Blend Mode</Label>
              <Select
                value={properties.blendMode || 'normal'}
                onValueChange={(value) => {
                  updateProperty('blendMode', value)
                  if (selectedObject) {
                    selectedObject.set('globalCompositeOperation', value)
                    fabricCanvas?.requestRenderAll()
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Wähle einen Blend Mode' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='normal'>Normal</SelectItem>
                  <SelectItem value='multiply'>Multiply</SelectItem>
                  <SelectItem value='screen'>Screen</SelectItem>
                  <SelectItem value='overlay'>Overlay</SelectItem>
                  <SelectItem value='darken'>Darken</SelectItem>
                  <SelectItem value='lighten'>Lighten</SelectItem>
                  <SelectItem value='color-dodge'>Color Dodge</SelectItem>
                  <SelectItem value='color-burn'>Color Burn</SelectItem>
                  <SelectItem value='hard-light'>Hard Light</SelectItem>
                  <SelectItem value='soft-light'>Soft Light</SelectItem>
                  <SelectItem value='difference'>Difference</SelectItem>
                  <SelectItem value='exclusion'>Exclusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility */}
            {/* <Separator />
            <div className='flex items-center justify-between'>
              <Label>Sichtbar</Label>
              <Switch
                checked={properties.visible}
                onCheckedChange={(checked) => updateProperty('visible', checked)}
              />
            </div> */}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
