'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Palette } from 'lucide-react'
import { updateTeamColors } from '../_actions/team-crud'
import { useToast } from '@/hooks/use-toast'
import type { TeamColor } from '@/types/teams-types'

interface TeamColorPickerProps {
  teamId: string
  initialColors: TeamColor[]
  onColorsUpdate?: (colors: TeamColor[]) => void
}

const DEFAULT_COLORS: TeamColor[] = [
  { name: 'primary', value: '#3B82F6', label: 'Primär' },
  { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
  { name: 'accent', value: '#10B981', label: 'Akzent' },
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
]

export function TeamColorPicker({ teamId, initialColors, onColorsUpdate }: TeamColorPickerProps) {
  const [colors, setColors] = useState<TeamColor[]>(
    initialColors.length > 0 ? initialColors : DEFAULT_COLORS
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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
      toast({
        title: 'Fehler',
        description: 'Mindestens eine Farbe muss vorhanden sein.',
        variant: 'destructive',
      })
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

      if (result.error) {
        toast({
          title: 'Fehler',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erfolg',
          description: 'Team-Farben wurden erfolgreich aktualisiert.',
        })
        onColorsUpdate?.(colors)
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive',
      })
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
          Definieren Sie die Hauptfarben Ihres Teams für ein einheitliches Design.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          {colors.map((color, index) => (
            <div key={index} className='flex items-center gap-4 p-4 border rounded-lg'>
              <div className='flex items-center gap-3 flex-1'>
                <div
                  className='w-12 h-12 rounded-lg border-2 border-border cursor-pointer'
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'color'
                    input.value = color.value
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement
                      updateColor(index, 'value', target.value)
                    }
                    input.click()
                  }}
                />
                <div className='flex-1 space-y-2'>
                  <div>
                    <Label htmlFor={`color-name-${index}`} className='text-sm font-medium'>
                      Farbname
                    </Label>
                    <Input
                      id={`color-name-${index}`}
                      value={color.name}
                      onChange={(e) => updateColor(index, 'name', e.target.value)}
                      placeholder='z.B. primary'
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <Label htmlFor={`color-label-${index}`} className='text-sm font-medium'>
                      Bezeichnung
                    </Label>
                    <Input
                      id={`color-label-${index}`}
                      value={color.label}
                      onChange={(e) => updateColor(index, 'label', e.target.value)}
                      placeholder='z.B. Primärfarbe'
                      className='mt-1'
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`color-value-${index}`} className='text-sm font-medium'>
                    Hex-Code
                  </Label>
                  <Input
                    id={`color-value-${index}`}
                    value={color.value}
                    onChange={(e) => updateColor(index, 'value', e.target.value)}
                    placeholder='#3B82F6'
                    className='mt-1 font-mono'
                  />
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => removeColor(index)}
                disabled={colors.length <= 1}
                className='text-destructive hover:text-destructive'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          ))}
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Button variant='outline' onClick={addColor} className='gap-2'>
              <Plus className='w-4 h-4' />
              Farbe hinzufügen
            </Button>
            <Button variant='ghost' onClick={resetToDefaults} className='gap-2'>
              Standard-Farben
            </Button>
          </div>

          <div>
            <Label className='text-sm font-medium mb-2 block'>Vordefinierte Farben</Label>
            <div className='flex flex-wrap gap-2'>
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  className='w-8 h-8 rounded-full border-2 border-border hover:border-primary transition-colors'
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
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
          </div>

          <div className='flex items-center gap-4 pt-4'>
            <Button onClick={handleSave} disabled={isLoading} className='gap-2'>
              {isLoading ? 'Speichern...' : 'Farben speichern'}
            </Button>
            {isLoading && <Badge variant='secondary'>Wird gespeichert...</Badge>}
          </div>
        </div>

        {/* Farbvorschau */}
        <div className='pt-6 border-t'>
          <Label className='text-sm font-medium mb-3 block'>Farbvorschau</Label>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {colors.map((color, index) => (
              <div key={index} className='text-center'>
                <div
                  className='w-full h-16 rounded-lg mb-2 border'
                  style={{ backgroundColor: color.value }}
                />
                <p className='text-xs font-medium'>{color.label}</p>
                <p className='text-xs text-muted-foreground font-mono'>{color.value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
