import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, User } from 'lucide-react'
import useCanvasStore from '../../_hooks/useCanvasStore'
import useDesignTemplateStore from '../../_hooks/useDesignTemplateStore'
import { useDynamicValuesStore } from '@/app/(editors)/_hooks/useDynamicValues'
import { updateTextLayers } from '../../_canvas-functions/layer-management'

export default function UserValuesSection() {
  const { fabricCanvas, isTemplateCanvasDataLoaded } = useCanvasStore()
  const { designTemplateData } = useDesignTemplateStore()
  const { currentValues, updateValue, updateMultipleValues } = useDynamicValuesStore()

  const { name, jerseyNumber, additionalText, primaryColor, secondaryColor, tertiaryColor } =
    currentValues

  const defaultTeamValues = designTemplateData?.default_team_values

  // Debug: Zeige aktuelle Werte
  useEffect(() => {
    console.log('🎯 Aktuelle Werte in UI:', {
      name,
      jerseyNumber,
      additionalText,
      primaryColor,
      secondaryColor,
      tertiaryColor,
    })
  }, [name, jerseyNumber, additionalText, primaryColor, secondaryColor, tertiaryColor])

  // Extrahiere Werte aus Canvas-Layern beim Laden
  useEffect(() => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) return

    console.log('🔍 Extrahiere Werte aus Canvas-Layern...')
    
    // Kleine Verzögerung, um sicherzustellen, dass Canvas vollständig geladen ist
    const timer = setTimeout(() => {
      const objects = fabricCanvas.getObjects()
      console.log(`📊 Anzahl Canvas-Objekte: ${objects.length}`)

      // Sammle alle Werte zuerst
      const extractedValues: Record<string, any> = {}
      let foundValues = {
        texts: 0,
        colors: 0,
      }

      objects.forEach((obj: any) => {
        // Extrahiere Text-Werte
        if (obj.dynamicLayerType === 'text' && obj.textProperty) {
          const textValue = obj.text || ''
          console.log(`📝 Text Layer gefunden: ${obj.textProperty} = "${textValue}"`)

          switch (obj.textProperty) {
            case 'name':
              extractedValues.name = textValue
              foundValues.texts++
              break
            case 'jersey_number':
              const jerseyNum = parseInt(textValue, 10)
              if (!isNaN(jerseyNum)) {
                extractedValues.jerseyNumber = jerseyNum
                foundValues.texts++
              }
              break
            case 'additional_text':
              extractedValues.additionalText = textValue
              foundValues.texts++
              break
          }
        }

        // Extrahiere Farb-Werte
        if (obj.dynamicLayerType && obj.dynamicLayerType.includes('color')) {
          const colorValue = obj.fill
          console.log(`🎨 Farb-Layer gefunden: ${obj.dynamicLayerType} = ${colorValue}`)

          if (typeof colorValue === 'string') {
            switch (obj.dynamicLayerType) {
              case 'primary_color':
                extractedValues.primaryColor = colorValue
                foundValues.colors++
                break
              case 'secondary_color':
                extractedValues.secondaryColor = colorValue
                foundValues.colors++
                break
              case 'tertiary_color':
                extractedValues.tertiaryColor = colorValue
                foundValues.colors++
                break
            }
          }
        }
      })

      console.log(`✅ Extraktion abgeschlossen: ${foundValues.texts} Text-Werte, ${foundValues.colors} Farb-Werte`)
      console.log('📦 Extrahierte Werte:', extractedValues)

      // Setze alle Werte auf einmal (Batch-Update für bessere Performance)
      if (Object.keys(extractedValues).length > 0) {
        console.log('➡️ Batch-Update mit allen extrahierten Werten')
        updateMultipleValues(extractedValues)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [fabricCanvas, isTemplateCanvasDataLoaded, updateMultipleValues])

  return (
    <div className='space-y-4'>
      <Label className='font-semibold flex items-center gap-2'>
        <Eye size={16} />
        Aktuelle User Infos
      </Label>

      {!defaultTeamValues && (
        <div className='p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md'>
          <p className='text-xs text-blue-700 dark:text-blue-300'>
            ℹ️ Es ist kein Example User dem Design Template zugeordnet. Ein willkürlicher User wurde
            gewählt.
          </p>
        </div>
      )}

      <div className='p-3 bg-muted/50 rounded-md space-y-4'>
        <div className='space-y-3'>
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Name</Label>
            <Input
              type='text'
              value={name ?? ''}
              placeholder='Name eingeben'
              onChange={(e) => {
                updateValue('name', e.target.value)
                if (fabricCanvas) {
                  updateTextLayers(fabricCanvas, 'name', e.target.value)
                }
              }}
              className='text-sm'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Trikotnummer</Label>
            <Input
              type='number'
              value={jerseyNumber ?? 0}
              placeholder='0'
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 0
                updateValue('jerseyNumber', value)
                if (fabricCanvas) {
                  updateTextLayers(fabricCanvas, 'jersey_number', value.toString())
                }
              }}
              className='text-sm'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Zusatztext</Label>
            <Input
              type='text'
              value={additionalText || ''}
              placeholder='Zusatztext eingeben'
              onChange={(e) => {
                updateValue('additionalText', e.target.value)
                if (fabricCanvas) {
                  updateTextLayers(fabricCanvas, 'additional_text', e.target.value)
                }
              }}
              className='text-sm'
            />
          </div>

          <div className='flex items-center gap-2'>
            <span className='font-medium'>Farben User:</span>
            <div className='flex gap-1'>
              <div
                className='w-4 h-4 rounded-full border border-border'
                style={{ backgroundColor: primaryColor || '#000000' }}
                title={`Primär: ${primaryColor || '#000000'}`}
              />
              <div
                className='w-4 h-4 rounded-full border border-border'
                style={{ backgroundColor: secondaryColor || '#FFFFFF' }}
                title={`Sekundär: ${secondaryColor || '#FFFFFF'}`}
              />
              <div
                className='w-4 h-4 rounded-full border border-border'
                style={{ backgroundColor: tertiaryColor || '#808080' }}
                title={`Tertiär: ${tertiaryColor || '#808080'}`}
              />
            </div>
          </div>

          <div className='pt-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                updateValue('name', 'Your Name')
                updateValue('jerseyNumber', 10)
                updateValue('additionalText', 'This is additional text')
                updateValue('primaryColor', '#000000')
                updateValue('secondaryColor', '#FFFFFF')
                updateValue('tertiaryColor', '#808080')
              }}
              className='w-full text-xs'
            >
              Übernehmen & Speichern
            </Button>
          </div>
        </div>
      </div>

      <Button
        variant='outline'
        className='w-full gap-2'
        onClick={() => {
          console.log('open select user overlay')
        }}
      >
        <User size={16} />
        Anderen Beispiel User auswählen
      </Button>
    </div>
  )
}


