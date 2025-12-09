'use client'
import { useEffect, useState } from 'react'
// UI imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
// logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'

export default function StatusBar() {
  const { fabricCanvas } = useCanvasStore()
  const { storeDesignTemplateId, designTemplateData } = useDesignTemplateStore()
  const { toast } = useToast()

  return (
    <div className='w-full absolute top-0 left-0 p-4'>
      <div className='flex flex-row items-center justify-between gap-4 px-56 md:px-72 lg:px-80 pr-96 xl:px-[28rem]'>
        {/* Left: Template Info */}
        <div className='flex flex-row items-center gap-2'>
          {storeDesignTemplateId ? (
            <div className='flex flex-row gap-2 items-center px-3 py-1.5 rounded-md border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
              <span className='text-xs text-muted-foreground'>Template:</span>
              <span className='text-xs font-mono'>{storeDesignTemplateId.slice(0, 8)}...</span>
              <span className='text-xs text-muted-foreground ml-3'>Name:</span>
              <span className='text-xs'>{designTemplateData?.name || 'Unbenannt'}</span>
            </div>
          ) : (
            <Badge variant='outline' className='py-2 px-4 gap-2 select-none border-violet-500'>
              <Eye size={16} className='text-violet-500' />
              <span className='text-violet-500'>Template wird geladen...</span>
            </Badge>
          )}
        </div>

        {/* Center: Status */}
        <div className='flex flex-row gap-4 justify-center items-center'>
          {storeDesignTemplateId && (
            <Badge variant='outline' className='py-2 px-4 gap-2 select-none border-green-500'>
              <CheckCircle size={16} className='text-green-500' />
              <span className='text-green-500'>Template bereit zur Verwendung</span>
            </Badge>
          )}
        </div>

        {/* Right: Mode indicator */}
        <div className='min-w-[140px] flex justify-end'>
          <Badge variant='outline' className='text-xs border-blue-500 text-blue-600'>
            Verwendungs-Modus
          </Badge>
        </div>
      </div>
    </div>
  )
}
