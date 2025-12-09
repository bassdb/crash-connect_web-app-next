'use client'

// react imports
import { useMemo } from 'react'

// ui imports
import { Separator } from '@/components/ui/separator'

// logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'

export default function JsonDebugViewer() {
  const { fabricCanvas, selectedObject } = useCanvasStore()

  const json = useMemo(() => {
    try {
      return fabricCanvas ? JSON.stringify(fabricCanvas.toJSON(), null, 2) : '{}'
    } catch {
      return '{}'
    }
  }, [fabricCanvas])

  const selectionJson = useMemo(() => {
    try {
      return selectedObject ? JSON.stringify(selectedObject.toObject?.(), null, 2) : '{}'
    } catch {
      return '{}'
    }
  }, [selectedObject])

  return (
    <div className='fixed right-4 top-20 w-[420px] max-h-[55vh] z-40'>
      <div className='bg-background/80 backdrop-blur border rounded-lg shadow-sm p-3'>
        <div className='text-sm font-medium mb-2'>Canvas JSON</div>
        <div className='rounded-md border bg-muted/30 p-2 max-h-[22vh] overflow-auto'>
          <pre className='text-[10px] leading-[1.1] whitespace-pre-wrap break-all'>{json}</pre>
        </div>
        <Separator className='my-2' />
        <div className='text-sm font-medium mb-2'>Selection JSON</div>
        <div className='rounded-md border bg-muted/30 p-2 max-h-[22vh] overflow-auto'>
          <pre className='text-[10px] leading-[1.1] whitespace-pre-wrap break-all'>{selectionJson}</pre>
        </div>
      </div>
    </div>
  )
}


