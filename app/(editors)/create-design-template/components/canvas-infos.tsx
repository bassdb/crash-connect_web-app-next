'use client'

import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'

export default function CanvasInfos() {
  const { canvasWidth, canvasHeight } = useCanvasStore()
  return (
    <div className='text-sm text-muted-foreground bg-background/80 border rounded-full px-4 py-2 shadow-sm'>
      Canvas: {canvasWidth} × {canvasHeight}px
    </div>
  )
}
