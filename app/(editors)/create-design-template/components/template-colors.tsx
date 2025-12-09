import { Label } from '@/components/ui/label'
import { Palette, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useDesignTemplateStore from '../../_hooks/useDesignTemplateStore'
import { useAction } from 'next-safe-action/hooks'
import { updateTemplateColorDefaults } from '@/server/actions/design-templates'
import { useToast } from '@/hooks/use-toast'
import useCanvasStore from '../../_hooks/useCanvasStore'
import useDynamicValuesStore from '../../_hooks/useDynamicValuesStore'
import { updateColorLayers } from '../../_canvas-functions/layer-management'

export default function TemplateColors() {
  const { fabricCanvas } = useCanvasStore()
  const { storeDesignTemplateId } = useDesignTemplateStore()
  const { toast } = useToast()
  const {
    previewValues,
    savedValues,
    setPreviewUserPrimaryColor,
    setPreviewUserSecondaryColor,
    setPreviewUserTertiaryColor,
    applyColorsToPreview,
    _applyPreviewValues,
  } = useDynamicValuesStore()

  const { execute: saveColors, status: saveStatus } = useAction(updateTemplateColorDefaults, {
    onSuccess: (res) => {
      if ((res as any)?.error) {
        toast({ title: 'Fehler', description: (res as any).error, variant: 'destructive' })
        return
      }
      _applyPreviewValues()
      toast({ title: 'Gespeichert', description: 'Farben wurden gespeichert.' })
    },
    onError: (err) => {
      toast({ title: 'Fehler', description: String(err), variant: 'destructive' })
    },
  })

  const applyColors = (c: { primary: string; secondary: string; tertiary: string }) => {
    applyColorsToPreview(c)
    if (!fabricCanvas) return
    updateColorLayers(fabricCanvas, 'primary_color', c.primary)
    updateColorLayers(fabricCanvas, 'secondary_color', c.secondary)
    updateColorLayers(fabricCanvas, 'tertiary_color', c.tertiary)
  }

  return (
    <div className='space-y-6'>
      {/* Sektion 1: Aktuelle Ansicht (Vorschau) */}
      <div className='space-y-2'>
        <Label className='font-semibold flex items-center gap-2'>
          <Palette size={16} />
          Aktuelle Ansicht (Vorschau)
        </Label>
        <div className='flex flex-wrap gap-4 items-start'>
        {/* Primär */}
        <div className='flex flex-col items-center gap-2'>
          <div
            className='relative h-16 w-16 rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow'
            style={{ backgroundColor: previewValues.userPrimaryColor || '#000000' }}
            title={`Primär: ${previewValues.userPrimaryColor || '#000000'}`}
            onClick={() => {
              const colorInput = document.getElementById('primary-color-picker') as HTMLInputElement
              colorInput?.click()
            }}
          >
            <input
              id='primary-color-picker'
              type='color'
              aria-label='Primärfarbe wählen'
              className='absolute inset-0 opacity-0 cursor-pointer'
              value={previewValues.userPrimaryColor || '#000000'}
              onChange={(e) => {
                const value = e.target.value
                setPreviewUserPrimaryColor(value)
                if (fabricCanvas) {
                  updateColorLayers(fabricCanvas, 'primary_color', value)
                }
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
            title={`Sekundär: ${previewValues.userSecondaryColor || '#FFFFFF'}`}
            onClick={() => {
              const colorInput = document.getElementById('secondary-color-picker') as HTMLInputElement
              colorInput?.click()
            }}
          >
            <input
              id='secondary-color-picker'
              type='color'
              aria-label='Sekundärfarbe wählen'
              className='absolute inset-0 opacity-0 cursor-pointer'
              value={previewValues.userSecondaryColor || '#FFFFFF'}
              onChange={(e) => {
                const value = e.target.value
                setPreviewUserSecondaryColor(value)
                if (fabricCanvas) {
                  updateColorLayers(fabricCanvas, 'secondary_color', value)
                }
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
            title={`Tertiär: ${previewValues.userTertiaryColor || '#808080'}`}
            onClick={() => {
              const colorInput = document.getElementById('tertiary-color-picker') as HTMLInputElement
              colorInput?.click()
            }}
          >
            <input
              id='tertiary-color-picker'
              type='color'
              aria-label='Tertiärfarbe wählen'
              className='absolute inset-0 opacity-0 cursor-pointer'
              value={previewValues.userTertiaryColor || '#808080'}
              onChange={(e) => {
                const value = e.target.value
                setPreviewUserTertiaryColor(value)
                if (fabricCanvas) {
                  updateColorLayers(fabricCanvas, 'tertiary_color', value)
                }
              }}
            />
          </div>
          <span className='text-xs text-muted-foreground'>Tertiär</span>
        </div>
          {/* Save Button */}
          <div className='flex-1 min-w-[160px]'>
            <Button
              type='button'
              disabled={!storeDesignTemplateId || saveStatus === 'executing'}
              onClick={() => {
                if (!storeDesignTemplateId) return
                saveColors({
                  designTemplateId: storeDesignTemplateId,
                  colorDefaults: {
                    primary: previewValues.userPrimaryColor || '#000000',
                    secondary: previewValues.userSecondaryColor || '#FFFFFF',
                    tertiary: previewValues.userTertiaryColor || '#808080',
                  },
                })
              }}
              className='h-16'
            >
              {saveStatus === 'executing' ? 'Speichern…' : 'Vorschau-Farben speichern'}
            </Button>
          </div>
        </div>
      </div>

      {/* Sektion 2: Zuletzt gespeichert */}
      <div className='space-y-2'>
        <Label className='font-semibold text-sm flex items-center gap-2'>
          <Check size={16} />
          Zuletzt gespeichert
        </Label>
        <div className='flex flex-wrap gap-2'>
          {['primary','secondary','tertiary'].map((k) => {
            const map: any = {
              primary: savedValues.userPrimaryColor || '#000000',
              secondary: savedValues.userSecondaryColor || '#FFFFFF',
              tertiary: savedValues.userTertiaryColor || '#808080',
            }
            const color = map[k]
            const label = k === 'primary' ? 'Primär' : k === 'secondary' ? 'Sekundär' : 'Tertiär'
            return (
              <button
                key={k}
                type='button'
                className='relative h-8 w-8 rounded-md border border-border shadow-sm hover:shadow-md transition-shadow'
                style={{ backgroundColor: color }}
                title={`${label}: ${color}`}
                aria-label={`Gespeicherte ${label}farbe anwenden`}
                onClick={() => applyColors({
                  primary: savedValues.userPrimaryColor || '#000000',
                  secondary: savedValues.userSecondaryColor || '#FFFFFF',
                  tertiary: savedValues.userTertiaryColor || '#808080',
                })}
              />
            )
          })}
        </div>
      </div>

      {/* Sektion 3: Benutzerpräferenzen (optional) */}
      <div className='space-y-2'>
        <Label className='font-semibold flex items-center gap-2'>
          <Palette size={16} />
          Benutzerpräferenzen
        </Label>
        <p className='text-xs text-muted-foreground'>Keine Benutzerpräferenzen gefunden.</p>
      </div>

      {/* Sektion 4: Teamfarben (aktuell vorgesehene Team-Vorschau) */}
      {previewValues.selectedTeamId && (
        <div className='space-y-2'>
          <Label className='font-semibold text-sm flex items-center gap-2'>
            <Palette size={16} />
            Teamfarben (Vorschau-Team)
          </Label>
          <div className='flex flex-wrap gap-2'>
            {[
              { key: 'primary', color: previewValues.teamPrimaryColor, fallback: '#000000', label: 'Primär' },
              { key: 'secondary', color: previewValues.teamSecondaryColor, fallback: '#FFFFFF', label: 'Sekundär' },
              { key: 'tertiary', color: previewValues.teamTertiaryColor, fallback: '#808080', label: 'Tertiär' },
            ].map(({ key, color, fallback, label }) => (
              <button
                key={key}
                type='button'
                className='relative h-8 w-8 rounded-md border border-border shadow-sm hover:shadow-md transition-shadow'
                style={{ backgroundColor: color || fallback }}
                title={`${label}: ${color || fallback}`}
                aria-label={`Team ${label}farbe anwenden`}
                onClick={() => applyColors({
                  primary: previewValues.teamPrimaryColor || '#000000',
                  secondary: previewValues.teamSecondaryColor || '#FFFFFF',
                  tertiary: previewValues.teamTertiaryColor || '#808080',
                })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


