'use client'

import { useCallback, useMemo, useState } from 'react'
// UI imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Copy, RefreshCw } from 'lucide-react'

interface JsonDebugViewerProps {
  title: string
  data: unknown
  className?: string
  defaultOpen?: boolean
  maxHeightClassName?: string
  fillParentHeight?: boolean
  externalRefreshSignal?: number
}

export default function JsonDebugViewer({
  title,
  data,
  className,
  defaultOpen = false,
  maxHeightClassName = 'max-h-72',
  fillParentHeight = false,
  externalRefreshSignal,
}: JsonDebugViewerProps) {
  const [refreshCounter, setRefreshCounter] = useState(0)

  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return '"<unserializable>"'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, refreshCounter, externalRefreshSignal])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
    } catch {
      // noop
    }
  }, [jsonString])

  const handleRefresh = useCallback(() => {
    setRefreshCounter((prev) => prev + 1)
  }, [])

  return (
    <div className={className}>
      <Card className={`p-2 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${fillParentHeight ? 'h-full flex flex-col' : ''}`}>
        <div className='flex items-center justify-between gap-2 mb-1'>
          <span className='text-xs font-medium'>{title}</span>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={handleRefresh}>
              <RefreshCw className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={handleCopy}>
              <Copy className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <Collapsible defaultOpen={defaultOpen}>
          <CollapsibleTrigger className='text-[10px] text-muted-foreground underline-offset-2 hover:underline'>
            Toggle JSON
          </CollapsibleTrigger>
          <CollapsibleContent className={`${fillParentHeight ? 'flex-1 min-h-0' : ''}`}>
            <pre
              className={`mt-2 text-xs font-mono whitespace-pre overflow-auto rounded border p-2 bg-muted/40 ${fillParentHeight ? 'h-full' : maxHeightClassName}`}
            >
            {jsonString}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}


