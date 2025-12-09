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
    setCanvasWidth,
    setCanvasHeight,
    backgroundColor,
    setBackgroundColor,
  } = useCanvasStore()

  const form = useForm<CanvasFormValues>({
    resolver: zodResolver(canvasSchema),
    defaultValues: {
      width: canvasWidth,
      height: canvasHeight,
    },
    values: { width: canvasWidth, height: canvasHeight },
  })

  const onSubmit = (values: CanvasFormValues) => {
    setCanvasWidth(values.width)
    setCanvasHeight(values.height)
  }

  const handlePresetClick = (width: number, height: number) => {
    form.setValue('width', width)
    form.setValue('height', height)
    onSubmit({ width, height })
  }

  return (
    <div className='space-y-6'>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2 font-semibold'>Canvas Size Presets</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent className='py-2'>
          <div className='grid grid-cols-2 gap-3'>
            {PRESET_SIZES.map((preset) => {
              const scale = 80 / Math.max(preset.width, preset.height)
              return (
                <Button
                  key={preset.name}
                  variant='outline'
                  className='h-auto p-3 flex flex-col items-center gap-2 hover:bg-accent/50'
                  onClick={() => handlePresetClick(preset.width, preset.height)}
                >
                  <div className={`w-20 h-20 relative flex items-center justify-center rounded-lg`}>
                    <div
                      className={`absolute bg-gradient-to-br ${preset.gradient} opacity-20 rounded-md`}
                      style={{
                        width: `${preset.width * scale}px`,
                        height: `${preset.height * scale}px`,
                      }}
                    />
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-sm'>{preset.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {preset.width} × {preset.height}
                    </div>
                  </div>
                </Button>
              )
            })}

            <div className='col-span-2 pt-3'>
              <div className='rounded-md border border-input bg-transparent hover:bg-accent/50 transition-colors p-3'>
                <div className='font-medium text-sm mb-2'>Custom Size (W × H)</div>
                <Form {...form}>
                  <form onChange={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <div className='flex flex-row items-center gap-2'>
                      <FormField
                        control={form.control}
                        name='width'
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormLabel className='sr-only'>Width</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                className='bg-background'
                              />
                            </FormControl>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />
                      <span className='text-muted-foreground'>×</span>
                      <FormField
                        control={form.control}
                        name='height'
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormLabel className='sr-only'>Height</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                className='bg-background'
                              />
                            </FormControl>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
                <div className='text-xs text-muted-foreground mt-2'>
                  Enter custom dimensions (max 4000px)
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
          <Label className='ml-2 font-semibold'>Canvas Background</Label>
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent className='py-2'>
          <div className='rounded-md border border-input bg-transparent p-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm'>Background Color</Label>
              <div
                className='w-8 h-8 rounded-md border border-input'
                style={{ backgroundColor: backgroundColor }}
              />
            </div>
            <Input
              type='color'
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className='w-full h-10 cursor-pointer p-0 border-none'
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
