'use client'
import { useEffect, useState } from 'react'
// UI imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Save, Palette, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
// logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'

import { actionSaveCanvas } from '../../_server/action-save-canvas'
import { actionClient } from '@/lib/safe-action'
import { useAction } from 'next-safe-action/hooks'
import { SidebarTrigger } from '@/components/ui/sidebar'
import CanvasInfos from './canvas-infos'
import ExampleTeamDebug from './example-team-debug'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import JsonDebugViewer from './json-debug-viewer'
import { extractOnlyDynamicValues } from '../../_canvas-functions/dynamic-values/extract-dynamic-values'
import DebugPanel from './debug-panel'

type ActionResponse = {
  success?: string | boolean
  message: string
  error?: string
}

export default function StatusBar() {
  const { fabricCanvas, canvasState, setCanvasState, isCanvasSaved, markCanvasAsSaved } =
    useCanvasStore()
  const { storeDesignTemplateId, designTemplateData } = useDesignTemplateStore()
  const { previewValues, savedValues, isDirty } = useDynamicValuesStore()
  const { toast } = useToast()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [imageKey, setImageKey] = useState<number>(Date.now())

  // Canvas state is now managed globally in useCanvasStore
  // No need for local canvas change listeners

  const { execute, result, isExecuting } = useAction(actionSaveCanvas, {
    onExecute: () => {},
    onSuccess: (result) => {
      if (result.data?.success) {
        // Update global canvas state
        markCanvasAsSaved()
        setLastSaved(new Date())
        
        // Update design template data in store with the returned data
        if (result.data?.data) {
          const updatedData = result.data.data
          useDesignTemplateStore.getState().setDesignTemplateData({
            ...designTemplateData,
            preview_image_url: updatedData.preview_image_url,
            canvas_data: updatedData.canvas_data,
          })
          // Force image reload by updating key
          setImageKey(Date.now())
        }
        
        toast({
          title: 'Success!',
          description: result.data?.message || 'Canvas saved successfully',
          className: 'border-green-500',
        })
      } else {
        toast({
          title: 'Save Failed',
          description: result.data?.message || 'Could not save canvas.',
          variant: 'destructive',
        })
      }
    },
    onError: (error) => {
      const errorMessage =
        error.error?.serverError ||
        JSON.stringify(error.error?.validationErrors) ||
        'Failed to save canvas'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    },
  })

  return (
    <div className='w-full absolute top-0 left-0 p-4 pointer-events-none'>
      <div className='grid grid-cols-3 items-start gap-4 px-56 md:px-72 lg:px-80 pr-96 xl:px-[28rem]'>
        {/* Left: Template Info */}
        <div className='flex flex-col items-start gap-2'>
          {storeDesignTemplateId ? (
            <div className='flex flex-row gap-2 items-center px-3 py-1.5 rounded-md border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
              <span className='text-xs text-muted-foreground'>ID:</span>
              <span className='text-xs font-mono'>{storeDesignTemplateId}</span>
              <span className='text-xs text-muted-foreground ml-3'>Name:</span>
              <span className='text-xs'>{designTemplateData?.name || 'Unbenannt'}</span>
            </div>
          ) : (
            <Badge variant='outline' className='py-2 px-4 gap-2 select-none border-violet-500'>
              <CheckCircle size={16} className='text-violet-500' />
              <span className='text-violet-500'>Initialize a template first</span>
            </Badge>
          )}

          {/* Collapsible: Current preview image */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className='text-[10px] text-muted-foreground underline-offset-2 hover:underline pointer-events-auto'>
              Preview image
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-1'>
              {designTemplateData?.preview_image_url ? (
                <div className='p-1 rounded-md border bg-background/60'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${designTemplateData.preview_image_url}?t=${imageKey}`}
                    alt={(designTemplateData?.name || 'Template') + ' preview'}
                    className='h-52 w-auto max-w-[20rem] rounded-l object-cover'
                    key={imageKey}
                  />
                </div>
              ) : (
                <span className='text-[10px] italic text-muted-foreground'>
                  No preview image saved
                </span>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Collapsible: Dynamic Values */}
          <Collapsible>
            <CollapsibleTrigger className='text-[10px] text-muted-foreground underline-offset-2 hover:underline pointer-events-auto flex items-center gap-1'>
              <Users size={10} />
              Dynamic Values {isDirty && <span className='text-yellow-500'>(Modified)</span>}
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-1'>
              <div className='p-2 rounded-md border bg-background/60 backdrop-blur space-y-2 text-[10px] max-w-[20rem]'>
                {/* User Values */}
                <div className='space-y-1'>
                  <div className='font-semibold text-muted-foreground'>User Values:</div>
                  <div className='space-y-0.5 pl-2'>
                    <div className='flex justify-between'>
                      <span>Name:</span>
                      <span className='font-mono'>{previewValues.name}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Jersey #:</span>
                      <span className='font-mono'>{previewValues.jerseyNumber}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Additional:</span>
                      <span className='font-mono truncate max-w-[8rem]'>
                        {previewValues.additionalText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Colors */}
                <div className='space-y-1'>
                  <div className='font-semibold text-muted-foreground flex items-center gap-1'>
                    <Palette size={10} />
                    User Colors:
                  </div>
                  <div className='flex gap-2 pl-2'>
                    <div className='flex items-center gap-1'>
                      <div
                        className='h-3 w-3 rounded-full border'
                        style={{ backgroundColor: previewValues.userPrimaryColor }}
                      />
                      <span className='font-mono text-[9px]'>{previewValues.userPrimaryColor}</span>
                    </div>
                  </div>
                </div>

                {/* Team Values */}
                <div className='space-y-1'>
                  <div className='font-semibold text-muted-foreground flex items-center gap-1'>
                    <Users size={10} />
                    Team Values:
                  </div>
                  <div className='space-y-0.5 pl-2'>
                    <div className='flex justify-between'>
                      <span>Team:</span>
                      <span className='font-mono truncate max-w-[8rem]'>
                        {previewValues.teamName}
                      </span>
                    </div>
                    {previewValues.selectedTeamId && (
                      <div className='flex justify-between'>
                        <span>Team ID:</span>
                        <span className='font-mono text-[8px] truncate max-w-[8rem]'>
                          {previewValues.selectedTeamId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Colors */}
                <div className='space-y-1'>
                  <div className='font-semibold text-muted-foreground flex items-center gap-1'>
                    <Palette size={10} />
                    Team Colors:
                  </div>
                  <div className='flex flex-wrap gap-1.5 pl-2'>
                    <div className='flex items-center gap-1'>
                      <div
                        className='h-3 w-3 rounded-full border'
                        style={{ backgroundColor: previewValues.teamPrimaryColor }}
                      />
                      <span className='font-mono text-[8px]'>P</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <div
                        className='h-3 w-3 rounded-full border'
                        style={{ backgroundColor: previewValues.teamSecondaryColor }}
                      />
                      <span className='font-mono text-[8px]'>S</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <div
                        className='h-3 w-3 rounded-full border'
                        style={{ backgroundColor: previewValues.teamTertiaryColor }}
                      />
                      <span className='font-mono text-[8px]'>T</span>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Center: Canvas Status Indicator */}
        <div className='flex flex-row gap-4 justify-center items-center'>
          {storeDesignTemplateId && (!isCanvasSaved || canvasState === 'draft') ? (
            <Badge
              variant='outline'
              className={`py-2 px-4 gap-2 select-none ${!isCanvasSaved ? 'border-yellow-500 text-yellow-500' : 'border-input'} ${isExecuting ? 'animate-pulse' : ''}`}
            >
              {isExecuting ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
              ) : (
                <Save size={16} />
              )}
              {isExecuting ? 'Saving...' : !isCanvasSaved ? 'Änderungen speichern' : 'Save Canvas'}
            </Badge>
          ) : storeDesignTemplateId ? (
            <Badge variant='outline' className='py-2 px-4 gap-2 select-none border-green-500'>
              <CheckCircle size={16} className='text-green-500' />
              <span className='text-green-500'>All changes saved</span>
            </Badge>
          ) : null}
        </div>

        {/* Right: Canvas Info and Last saved */}
        <div className='flex flex-col items-end gap-1'>
          <DebugPanel />

          {lastSaved && (
            <span className='text-xs text-muted-foreground'>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
