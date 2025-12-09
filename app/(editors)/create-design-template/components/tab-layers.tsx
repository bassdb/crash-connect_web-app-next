// ui imports
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ChevronDown, LoaderCircle } from 'lucide-react'
// logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import LayersEditor from './layers'

export default function TabLayers() {
  const { enableEffects, setEnableEffects, isTemplateCanvasDataLoaded } = useCanvasStore()

  if (!isTemplateCanvasDataLoaded) {
    return (
      <div className='flex items-center justify-center p-8 gap-4'>
        {/* <div className='animate-spin'>
          <LoaderCircle />
        </div> */}
        <span>No layers to show</span>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2'>Arrange layers</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>

        <CollapsibleContent className='py-2'>
          <LayersEditor />
        </CollapsibleContent>
      </Collapsible>
      <Separator />

      <div className='flex items-center justify-between'>
        <Label htmlFor='effects' className='ml-2'>
          Enable Effects
        </Label>
        <Switch id='effects' checked={enableEffects} onCheckedChange={setEnableEffects} />
      </div>
    </div>
  )
}
