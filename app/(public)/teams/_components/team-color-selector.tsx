'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette } from 'lucide-react'
import type { TeamColor } from '@/types/teams-types'

interface TeamColorSelectorProps {
  onColorsChange: (colors: TeamColor[]) => void
  initialColors?: TeamColor[]
}

const PRESET_COLOR_SCHEMES = [
  {
    name: 'Blau',
    colors: [
      { name: 'primary', value: '#3B82F6', label: 'Primär' },
      { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
      { name: 'accent', value: '#10B981', label: 'Akzent' },
    ],
  },
  {
    name: 'Rot',
    colors: [
      { name: 'primary', value: '#EF4444', label: 'Primär' },
      { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
      { name: 'accent', value: '#F59E0B', label: 'Akzent' },
    ],
  },
  {
    name: 'Grün',
    colors: [
      { name: 'primary', value: '#10B981', label: 'Primär' },
      { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
      { name: 'accent', value: '#3B82F6', label: 'Akzent' },
    ],
  },
  {
    name: 'Lila',
    colors: [
      { name: 'primary', value: '#8B5CF6', label: 'Primär' },
      { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
      { name: 'accent', value: '#EC4899', label: 'Akzent' },
    ],
  },
  {
    name: 'Orange',
    colors: [
      { name: 'primary', value: '#F97316', label: 'Primär' },
      { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
      { name: 'accent', value: '#84CC16', label: 'Akzent' },
    ],
  },
  {
    name: 'Pink',
    colors: [
      { name: 'primary', value: '#EC4899', label: 'Primär' },
      { name: 'secondary', value: '#6B7280', label: 'Sekundär' },
      { name: 'accent', value: '#8B5CF6', label: 'Akzent' },
    ],
  },
]

export function TeamColorSelector({ onColorsChange, initialColors }: TeamColorSelectorProps) {
  const [selectedScheme, setSelectedScheme] = useState<number>(0)

  const handleSchemeSelect = (index: number) => {
    setSelectedScheme(index)
    onColorsChange(PRESET_COLOR_SCHEMES[index].colors)
  }

  // Initialize with first scheme if no initial colors
  useState(() => {
    if (!initialColors || initialColors.length === 0) {
      onColorsChange(PRESET_COLOR_SCHEMES[0].colors)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Palette className='w-5 h-5' />
          Team-Farben
        </CardTitle>
        <CardDescription>
          Wählen Sie ein Farbschema für Ihr Team aus. Sie können die Farben später anpassen.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {PRESET_COLOR_SCHEMES.map((scheme, index) => (
            <button
              key={index}
              onClick={() => handleSchemeSelect(index)}
              className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                selectedScheme === index
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className='space-y-3'>
                <div className='flex gap-2'>
                  {scheme.colors.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className='w-8 h-6 rounded border border-border'
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
                <Label className='text-sm font-medium text-center block'>{scheme.name}</Label>
              </div>
            </button>
          ))}
        </div>

        {/* Preview of selected colors */}
        <div className='pt-4 border-t'>
          <Label className='text-sm font-medium mb-3 block'>Vorschau der ausgewählten Farben</Label>
          <div className='grid grid-cols-3 gap-4'>
            {PRESET_COLOR_SCHEMES[selectedScheme].colors.map((color, index) => (
              <div key={index} className='text-center'>
                <div
                  className='w-full h-12 rounded-lg mb-2 border'
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
