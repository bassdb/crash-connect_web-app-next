'use client'

// react imports
import { useEffect } from 'react'

// ui imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Palette, RotateCcw } from 'lucide-react'

// logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'
import { updateTextLayers, updateColorLayers } from '@/app/(editors)/_canvas-functions/layer-management'

interface TabValuesProps {
  templateId?: string
  defaultTeamValues?: Record<string, any>
}

export default function TabValues({ templateId, defaultTeamValues }: TabValuesProps) {
  const { fabricCanvas, isTemplateCanvasDataLoaded } = useCanvasStore()
  const {
    previewValues,
    setPreviewName,
    setPreviewJerseyNumber,
    setPreviewAdditionalText,
    setPreviewUserPrimaryColor,
    setPreviewUserSecondaryColor,
    setPreviewUserTertiaryColor,
    _resetToDefaults,
  } = useDynamicValuesStore()

  // Initialwerte aus Canvas extrahieren (analog Create-Editor UserValuesSection)
  useEffect(() => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) return
    const timer = setTimeout(() => {
      const objects = fabricCanvas.getObjects()
      const extracted: Record<string, any> = {}

      objects.forEach((obj: any) => {
        if (obj.dynamicLayerType === 'text' && obj.textProperty) {
          const textValue = obj.text || ''
          switch (obj.textProperty) {
            case 'name':
              extracted.name = textValue
              break
            case 'jersey_number':
              {
                const n = parseInt(textValue, 10)
                if (!isNaN(n)) extracted.jerseyNumber = n
              }
              break
            case 'additional_text':
              extracted.additionalText = textValue
              break
          }
        }

        if (obj.dynamicLayerType && obj.dynamicLayerType.includes('color')) {
          const color = obj.fill
          if (typeof color === 'string') {
            switch (obj.dynamicLayerType) {
              case 'primary_color':
                extracted.userPrimaryColor = color
                break
              case 'secondary_color':
                extracted.userSecondaryColor = color
                break
              case 'tertiary_color':
                extracted.userTertiaryColor = color
                break
            }
          }
        }
      })

      if (extracted.name !== undefined) setPreviewName(extracted.name)
      if (extracted.jerseyNumber !== undefined) setPreviewJerseyNumber(extracted.jerseyNumber)
      if (extracted.additionalText !== undefined) setPreviewAdditionalText(extracted.additionalText)
      if (extracted.userPrimaryColor) setPreviewUserPrimaryColor(extracted.userPrimaryColor)
      if (extracted.userSecondaryColor) setPreviewUserSecondaryColor(extracted.userSecondaryColor)
      if (extracted.userTertiaryColor) setPreviewUserTertiaryColor(extracted.userTertiaryColor)
    }, 100)

    return () => clearTimeout(timer)
  }, [fabricCanvas, isTemplateCanvasDataLoaded, setPreviewName, setPreviewJerseyNumber, setPreviewAdditionalText, setPreviewUserPrimaryColor, setPreviewUserSecondaryColor, setPreviewUserTertiaryColor])

  const handleReset = () => {
    _resetToDefaults()
    if (!fabricCanvas) return
    updateTextLayers(fabricCanvas, 'name', 'Your Name')
    updateTextLayers(fabricCanvas, 'jersey_number', String(10))
    updateTextLayers(fabricCanvas, 'additional_text', 'Additional Text')
    updateColorLayers(fabricCanvas, 'primary_color', '#000000')
    updateColorLayers(fabricCanvas, 'secondary_color', '#FFFFFF')
    updateColorLayers(fabricCanvas, 'tertiary_color', '#808080')
  }

  return (
    <div className='space-y-6'>
      {/* Farben – Vorschau-Änderungen anwenden (wie TemplateColors, ohne Server-Save) */}
      <div className='space-y-2'>
        <Label className='font-semibold flex items-center gap-2'>
          <Palette size={16} />
          Farben (Vorschau)
        </Label>
        <div className='flex flex-wrap gap-4 items-start'>
          {/* Primär */}
          <div className='flex flex-col items-center gap-2'>
            <div
              className='relative h-16 w-16 rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow'
              style={{ backgroundColor: previewValues.userPrimaryColor || '#000000' }}
              onClick={() => (document.getElementById('user-primary-picker') as HTMLInputElement)?.click()}
              title={`Primär: ${previewValues.userPrimaryColor || '#000000'}`}
            >
              <input
                id='user-primary-picker'
                type='color'
                aria-label='Primärfarbe wählen'
                className='absolute inset-0 opacity-0 cursor-pointer'
                value={previewValues.userPrimaryColor || '#000000'}
                onChange={(e) => {
                  const v = e.target.value
                  setPreviewUserPrimaryColor(v)
                  if (fabricCanvas) updateColorLayers(fabricCanvas, 'primary_color', v)
                }}
              />
            </div>
            <span className='text-xs text-muted-foreground'>Primär</span>
          </div>

          {/* Sekundär */}
          <div className='flex flex-col items-center gap-2'>
            <div
              className='relative h-16 w-16 rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow'
              style={{ backgroundColor: previewValues.userSecondaryColor || '#FFFFFF' }}
              onClick={() => (document.getElementById('user-secondary-picker') as HTMLInputElement)?.click()}
              title={`Sekundär: ${previewValues.userSecondaryColor || '#FFFFFF'}`}
            >
              <input
                id='user-secondary-picker'
                type='color'
                aria-label='Sekundärfarbe wählen'
                className='absolute inset-0 opacity-0 cursor-pointer'
                value={previewValues.userSecondaryColor || '#FFFFFF'}
                onChange={(e) => {
                  const v = e.target.value
                  setPreviewUserSecondaryColor(v)
                  if (fabricCanvas) updateColorLayers(fabricCanvas, 'secondary_color', v)
                }}
              />
            </div>
            <span className='text-xs text-muted-foreground'>Sekundär</span>
          </div>

          {/* Tertiär */}
          <div className='flex flex-col items-center gap-2'>
            <div
              className='relative h-16 w-16 rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow'
              style={{ backgroundColor: previewValues.userTertiaryColor || '#808080' }}
              onClick={() => (document.getElementById('user-tertiary-picker') as HTMLInputElement)?.click()}
              title={`Tertiär: ${previewValues.userTertiaryColor || '#808080'}`}
            >
              <input
                id='user-tertiary-picker'
                type='color'
                aria-label='Tertiärfarbe wählen'
                className='absolute inset-0 opacity-0 cursor-pointer'
                value={previewValues.userTertiaryColor || '#808080'}
                onChange={(e) => {
                  const v = e.target.value
                  setPreviewUserTertiaryColor(v)
                  if (fabricCanvas) updateColorLayers(fabricCanvas, 'tertiary_color', v)
                }}
              />
            </div>
            <span className='text-xs text-muted-foreground'>Tertiär</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Benutzer-Werte */}
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Name</Label>
          <Input
            type='text'
            value={previewValues.name ?? ''}
            onChange={(e) => {
              setPreviewName(e.target.value)
              if (fabricCanvas) updateTextLayers(fabricCanvas, 'name', e.target.value)
            }}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Trikotnummer</Label>
          <Input
            type='number'
            value={previewValues.jerseyNumber ?? 0}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10) || 0
              setPreviewJerseyNumber(n)
              if (fabricCanvas) updateTextLayers(fabricCanvas, 'jersey_number', String(n))
            }}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Zusatztext</Label>
          <Input
            type='text'
            value={previewValues.additionalText || ''}
            onChange={(e) => {
              setPreviewAdditionalText(e.target.value)
              if (fabricCanvas) updateTextLayers(fabricCanvas, 'additional_text', e.target.value)
            }}
          />
        </div>
      </div>

      <Separator />

      <div className='flex gap-2'>
        <Button variant='outline' size='sm' onClick={handleReset} className='flex-1'>
          <RotateCcw className='h-4 w-4 mr-2' />
          Zurücksetzen
        </Button>
      </div>

      <div className='mt-2 p-3 bg-muted/50 rounded-lg'>
        <p className='text-xs text-muted-foreground'>
          Änderungen werden sofort im Canvas angewendet. Es findet kein Template-Speichern statt.
        </p>
      </div>
    </div>
  )
}
