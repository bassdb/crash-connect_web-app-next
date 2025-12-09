import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const canvasSchema = z.object({
  width: z.number().min(100).max(4000),
  height: z.number().min(100).max(4000),
})

type CanvasFormValues = z.infer<typeof canvasSchema>

const PRESET_SIZES = [
  { name: 'Instagram Post', width: 1080, height: 1080, gradient: 'from-pink-500 to-purple-500' },
  { name: 'Instagram Story', width: 1080, height: 1920, gradient: 'from-purple-500 to-blue-500' },
  { name: 'Facebook Post', width: 1200, height: 630, gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Twitter Post', width: 1200, height: 675, gradient: 'from-cyan-500 to-teal-500' },
  { name: 'LinkedIn Post', width: 1200, height: 627, gradient: 'from-teal-500 to-green-500' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, gradient: 'from-red-500 to-orange-500' },
]

export default function TabCanvasSettings() {
  const {
    canvasWidth,
    canvasHeight,
    backgroundColor,
  } = useCanvasStore()

  const form = useForm<CanvasFormValues>({
    resolver: zodResolver(canvasSchema),
    defaultValues: {
      width: canvasWidth,
      height: canvasHeight,
    },
  })

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <Collapsible defaultOpen>
          <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
            <Label className='ml-2'>Canvas Größe (Nur Ansicht)</Label>
            <ChevronDown className='h-4 w-4' />
          </CollapsibleTrigger>

          <CollapsibleContent className='space-y-4 py-2'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='width' className='text-sm font-medium'>
                  Breite
                </Label>
                <Input
                  id='width'
                  type='number'
                  value={canvasWidth}
                  disabled
                  className='bg-muted'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='height' className='text-sm font-medium'>
                  Höhe
                </Label>
                <Input
                  id='height'
                  type='number'
                  value={canvasHeight}
                  disabled
                  className='bg-muted'
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        <Collapsible defaultOpen>
          <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
            <Label className='ml-2'>Hintergrundfarbe</Label>
            <ChevronDown className='h-4 w-4' />
          </CollapsibleTrigger>

          <CollapsibleContent className='space-y-4 py-2'>
            <div className='flex items-center gap-3'>
              <div
                className='w-8 h-8 rounded-md border-2 border-border'
                style={{ backgroundColor: backgroundColor }}
              />
              <span className='text-sm text-muted-foreground'>{backgroundColor}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        <Collapsible defaultOpen>
          <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
            <Label className='ml-2'>Format-Referenzen</Label>
            <ChevronDown className='h-4 w-4' />
          </CollapsibleTrigger>

          <CollapsibleContent className='space-y-3 py-2'>
            <div className='grid gap-2'>
              {PRESET_SIZES.map((size, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all cursor-default ${
                    canvasWidth === size.width && canvasHeight === size.height
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='font-medium text-sm'>{size.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {size.width} × {size.height}
                      </div>
                    </div>
                    <div
                      className={`w-8 h-6 rounded bg-gradient-to-r ${size.gradient} opacity-80`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
