'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Palette } from 'lucide-react'
import { updateTeamColors } from '../../_actions'
import { toast } from 'sonner'
import type { TeamColor } from '@/types/teams-types'

interface AdminTeamColorPickerProps {
  teamId: string
  initialColors: TeamColor[]
  onColorsUpdate?: (colors: TeamColor[]) => void
}

const DEFAULT_COLORS: TeamColor[] = [
  { name: 'primary', value: '#3B82F6', label: 'Primär' },
  { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
]

const PRESET_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
  '#000000',
  '#FFFFFF',
  '#6B7280',
  '#9CA3AF',
  '#D1D5DB',
]

export function AdminTeamColorPicker({
  teamId,
  initialColors,
  onColorsUpdate,
}: AdminTeamColorPickerProps) {
  const [colors, setColors] = useState<TeamColor[]>(
    initialColors.length > 0 ? initialColors : DEFAULT_COLORS
  )
  const [isLoading, setIsLoading] = useState(false)

  const addColor = () => {
    const newColor: TeamColor = {
      name: `color-${colors.length + 1}`,
      value: '#3B82F6',
      label: `Farbe ${colors.length + 1}`,
    }
    setColors([...colors, newColor])
  }

  const removeColor = (index: number) => {
    if (colors.length <= 1) {
      toast.error('Mindestens eine Farbe muss vorhanden sein.')
      return
    }
    setColors(colors.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, field: keyof TeamColor, value: string) => {
    const updatedColors = [...colors]
    updatedColors[index] = { ...updatedColors[index], [field]: value }
    setColors(updatedColors)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateTeamColors({ team_id: teamId, colors })

      if (!result.success) {
        toast.error(result.error || 'Fehler beim Speichern der Farben')
      } else {
        toast.success('Team-Farben wurden erfolgreich aktualisiert.')
        onColorsUpdate?.(colors)
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    setColors(DEFAULT_COLORS)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Palette className='w-5 h-5' />
          Team-Farben
        </CardTitle>
        <CardDescription>
          Verwenden Sie den Color Picker über jeder Farbe, um sie zu ändern. Klicken Sie auf das
          Plus-Symbol, um eine neue Farbe hinzuzufügen.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Farben-Vorschau mit Plus-Button */}
        <div className='space-y-4'>
          <Label className='text-sm font-medium'>Team-Farben</Label>
          <div className='flex flex-wrap gap-4'>
            {/* Bestehende Farben */}
            {colors.map((color, index) => (
              <div key={index} className='relative group'>
                {/* System Color Picker über dem Color Swatch */}
                <div className='mb-2'>
                  <input
                    type='color'
                    value={color.value}
                    onChange={(e) => updateColor(index, 'value', e.target.value)}
                    className='w-20 h-8 cursor-pointer border border-border rounded'
                    title={`${color.label} (${color.value}) - Klicken zum Ändern`}
                  />
                </div>

                {/* Color Swatch */}
                <div
                  className='w-20 h-20 rounded-lg border-2 border-border'
                  style={{ backgroundColor: color.value }}
                  title={`${color.label} (${color.value})`}
                />

                {/* Entfernen-Button */}
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  className='absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => removeColor(index)}
                  disabled={colors.length <= 1}
                >
                  <Trash2 className='w-3 h-3' />
                </Button>

                {/* Farbbezeichnung */}
                <p className='text-xs text-center mt-2 font-medium'>{color.label}</p>
                <p className='text-xs text-center text-muted-foreground font-mono'>{color.value}</p>
              </div>
            ))}

            {/* Plus-Button für neue Farbe */}
            <div className='flex flex-col items-center'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-20 h-20 p-0 border-dashed hover:border-primary hover:bg-primary/5 transition-colors'
                onClick={addColor}
                title='Neue Farbe hinzufügen'
              >
                <Plus className='w-8 h-8 text-muted-foreground' />
              </Button>
              <p className='text-xs text-center mt-2 text-muted-foreground'>Neue Farbe</p>
            </div>
          </div>
        </div>

        {/* Vordefinierte Farben */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Vordefinierte Farben</Label>
          <div className='flex flex-wrap gap-2'>
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className='w-8 h-8 rounded-full border-2 border-border hover:border-primary transition-colors'
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  // Füge eine neue Farbe mit der vordefinierten Farbe hinzu
                  const newColor: TeamColor = {
                    name: `color-${colors.length + 1}`,
                    value: presetColor,
                    label: `Farbe ${colors.length + 1}`,
                  }
                  setColors([...colors, newColor])
                }}
                title={presetColor}
              />
            ))}
          </div>
          <p className='text-xs text-muted-foreground'>
            Klicken Sie auf eine vordefinierte Farbe, um sie als neue Farbe hinzuzufügen
          </p>
        </div>

        {/* Aktions-Buttons */}
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' onClick={resetToDefaults}>
            Standard-Farben
          </Button>
        </div>

        {/* Speichern-Button */}
        <div className='flex justify-start'>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Wird gespeichert...
              </>
            ) : (
              <>
                <Palette className='w-4 h-4 mr-2' />
                Farben speichern
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
