'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { ChevronDown, Plus, Type, Square, Circle, Image } from 'lucide-react'

export default function TabElements() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-medium'>Verfügbare Elemente</h3>
        <Badge variant='outline' className='text-xs'>
          Nur Ansicht
        </Badge>
      </div>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2'>Text Elemente</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>

        <CollapsibleContent className='space-y-2 py-2'>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2 h-12 opacity-50 cursor-not-allowed'
              disabled
            >
              <Type className='h-4 w-4' />
              <span className='text-xs'>Text hinzufügen</span>
            </Button>
          </div>
          <p className='text-xs text-muted-foreground mt-2'>
            Im Template-Verwendungs-Modus können nur bestehende Elemente bearbeitet werden.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2'>Formen</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>

        <CollapsibleContent className='space-y-2 py-2'>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2 h-12 opacity-50 cursor-not-allowed'
              disabled
            >
              <Square className='h-4 w-4' />
              <span className='text-xs'>Rechteck</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2 h-12 opacity-50 cursor-not-allowed'
              disabled
            >
              <Circle className='h-4 w-4' />
              <span className='text-xs'>Kreis</span>
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2'>Medien</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>

        <CollapsibleContent className='space-y-2 py-2'>
          <Button
            variant='outline'
            size='sm'
            className='w-full flex items-center gap-2 h-12 opacity-50 cursor-not-allowed'
            disabled
          >
            <Image className='h-4 w-4' />
            <span className='text-xs'>Bild hochladen</span>
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <div className='mt-6 p-3 bg-muted/50 rounded-lg'>
        <p className='text-xs text-muted-foreground text-center'>
          <strong>Hinweis:</strong> Im Template-Verwendungs-Modus können Sie bestehende Elemente bearbeiten, aber keine neuen hinzufügen.
        </p>
      </div>
    </div>
  )
}
