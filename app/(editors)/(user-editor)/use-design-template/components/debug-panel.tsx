'use client'

// UI imports
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// react imports
import { useMemo } from 'react'

// logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'

export default function DebugPanel() {
  const { fabricCanvas, selectedObject } = useCanvasStore()
  const { designTemplateData } = useDesignTemplateStore()

  const canvasInfo = useMemo(() => {
    if (!fabricCanvas) return { objects: 0, width: 0, height: 0 }
    return {
      objects: fabricCanvas.getObjects().length,
      width: (fabricCanvas as any).width || 0,
      height: (fabricCanvas as any).height || 0,
    }
  }, [fabricCanvas])

  return (
    <div className='fixed right-4 bottom-28 w-[360px] z-40'>
      <div className='bg-background/80 backdrop-blur border rounded-lg shadow-sm p-3'>
        <div className='flex items-center justify-between'>
          <div className='text-sm font-medium'>Debug</div>
          <Badge variant='outline' className='text-[10px]'>Use-Editor</Badge>
        </div>
        <Separator className='my-2' />
        <div className='space-y-2 text-xs'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='p-2 rounded-md border'>
              <div className='text-muted-foreground'>Template</div>
              <div className='font-mono break-all'>
                {designTemplateData?.id?.slice(0, 8) || '—'}
              </div>
            </div>
            <div className='p-2 rounded-md border'>
              <div className='text-muted-foreground'>Objekte</div>
              <div>{canvasInfo.objects}</div>
            </div>
            <div className='p-2 rounded-md border'>
              <div className='text-muted-foreground'>Canvas</div>
              <div>
                {canvasInfo.width} × {canvasInfo.height}
              </div>
            </div>
            <div className='p-2 rounded-md border'>
              <div className='text-muted-foreground'>Auswahl</div>
              <div>{selectedObject ? (selectedObject as any).type : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


