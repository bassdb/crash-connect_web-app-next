'use client'
import CanvasInfos from './canvas-infos'
import ExampleTeamDebug from './example-team-debug'
import JsonDebugViewer from './json-debug-viewer'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'
import { extractOnlyDynamicValues } from '../../_canvas-functions/dynamic-values/extract-dynamic-values'
import { serializeCanvasWithData } from '../../_canvas-functions/layer-management'

export default function DebugPanel() {
  const { fabricCanvas } = useCanvasStore()
  const { designTemplateData } = useDesignTemplateStore()

  const serializedCanvasData = fabricCanvas ? serializeCanvasWithData(fabricCanvas) : '{}'

  // Format canvas data for better readability
  const formatCanvasData = (canvas: any) => {
    if (!canvas) return null

    const serializedData = serializeCanvasWithData(canvas)

    return {
      canvasInfo: {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        backgroundColor: canvas.backgroundColor,
        totalObjects: canvas.getObjects().length,
      },
      objects: canvas.getObjects().map((obj: any, index: number) => ({
        index,
        type: obj.type,
        name: obj.name || 'unnamed',
        left: Math.round(obj.left || 0),
        top: Math.round(obj.top || 0),
        width: Math.round(obj.width || 0),
        height: Math.round(obj.height || 0),
        angle: Math.round(obj.angle || 0),
        scaleX: Math.round((obj.scaleX || 1) * 100) / 100,
        scaleY: Math.round((obj.scaleY || 1) * 100) / 100,
        visible: obj.visible !== false,
        dynamicLayerType: obj.dynamicLayerType || 'static',
        hasText: obj.type === 'text' || obj.type === 'textbox',
        textContent: obj.type === 'text' || obj.type === 'textbox' ? obj.text : undefined,
      })),
      serializedData: serializedData,
    }
  }

  return (
    <div className='flex flex-col items-end gap-1 w-[28rem]'>
      <div className='w-full flex justify-end'>
        <CanvasInfos />
      </div>
      <div className='mt-1 w-full flex justify-end'>
        <ExampleTeamDebug />
      </div>
      <div className='mt-1 w-full flex flex-col items-end'>
        <div className='mt-2 w-full pointer-events-auto flex justify-end'>
          <JsonDebugViewer
            className='w-full'
            title='Debug: designTemplateData'
            data={designTemplateData}
            defaultOpen={false}
            fillParentHeight
          />
        </div>
        <div className='mt-2 w-full pointer-events-auto flex justify-end'>
          <JsonDebugViewer
            className='w-full'
            title='Debug: fabricCanvas JSON snapshot'
            data={fabricCanvas ? fabricCanvas.toJSON() : null}
            defaultOpen={false}
            fillParentHeight
          />
        </div>
        <div className='mt-2 w-full pointer-events-auto flex justify-end'>
          <JsonDebugViewer
            className='w-full'
            title='Debug: Dynamic Layers'
            data={
              fabricCanvas
                ? fabricCanvas.getObjects()
                    .filter((obj: any) => obj.dynamicLayerType)
                    .map((obj: any, index: number) => ({
                      index,
                      type: obj.type,
                      name: obj.name,
                      dynamicLayerType: obj.dynamicLayerType,
                    
                    }))
                : null
            }
            defaultOpen={false}
            fillParentHeight
          />
        </div>

        {/* <div className='mt-2 w-full pointer-events-auto flex justify-end'>
          <JsonDebugViewer
            className='w-full'
            title='Canvas Data (Formatted)'
            data={formatCanvasData(fabricCanvas)}
            defaultOpen={false}
            fillParentHeight
          />
        </div> */}
      </div>
    </div>
  )
}
