'use client'

import { useState, useEffect } from 'react'

import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useEditorStore from '@/app/(editors)/_hooks/useEditorStore'
import { DesignTemplateData } from '@/app/(editors)/_hooks/useDesignTemplateStore'
import EditorDesignTemplateInject from './editor-design-template-injector'
import useExampleTeamsStore from '../../_hooks/useExampleTeamsStore'
interface EditorContainerProps {
  designTemplateId: string | undefined
  designTemplateData: DesignTemplateData
}

export default function EditorContainer({
  designTemplateId,
  designTemplateData,
}: EditorContainerProps) {
  const { scale, canPan, setCanPan, setScale } = useEditorStore()
  const { fabricCanvas, setSelectedObject, canvasWidth, canvasHeight } = useCanvasStore()

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPan, setStartPan] = useState(false)
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 })

  // Teams werden on-demand im Overlay geladen

  useEffect(() => {
    console.log('canPan', canPan)
    if (canPan) {
      document.body.style.cursor = 'grab'
    } else {
      document.body.style.cursor = 'default'
    }
  }, [canPan])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or contenteditable elements
      const target = e.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      const isTypingContext =
        tagName === 'input' ||
        tagName === 'textarea' ||
        (target && (target as any).isContentEditable)

      if (!isTypingContext && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (fabricCanvas) {
          const activeObjects = fabricCanvas.getActiveObjects()
          if (activeObjects && activeObjects.length > 0) {
            activeObjects.forEach((obj) => fabricCanvas.remove(obj))
            fabricCanvas.discardActiveObject()
            fabricCanvas.requestRenderAll()
            setSelectedObject(null)
          }
        }
        // Prevent default browser navigation on Backspace when not typing
        e.preventDefault()
        return
      }
      if (e.code === 'Space') {
        setCanPan(true)
        console.log('canPan true triggerd by space')
        document.body.style.cursor = 'grab'
      }
      if (e.code === 'Escape') {
        setCanPan(false)
        if (fabricCanvas) {
          console.log('deselect active object')
          fabricCanvas.discardActiveObject()
          fabricCanvas.renderAll()
        }
        console.log('canPan to false triggerd by escape')
        document.body.style.cursor = 'default'
      }
      if (e.code === '+') {
        setScale(scale + 0.1)
        console.log('scale to', scale)
      }
      if (e.code === '-') {
        setScale(scale - 0.1)
        console.log('scale to', scale)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setCanPan(false)
        console.log('canPan to false triggerd by space')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setCanPan, fabricCanvas, setSelectedObject, scale, setScale])

  const handleDeselect = () => {
    if (fabricCanvas) {
      fabricCanvas.discardActiveObject()
      fabricCanvas.renderAll()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (canPan) {
      setStartPan(true)
      setStartPanPosition({
        x: e.clientX,
        y: e.clientY,
      })
      console.log('Panning started')
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startPan) {
      setPosition({
        x: e.clientX - startPanPosition.x,
        y: e.clientY - startPanPosition.y,
      })
      console.log('Panning to:', position.x, position.y)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (canPan) {
      setStartPan(false)
      console.log('canPan to false triggerd by mouse up')
    }
  }

  return (
    <div
      className='flex-1 flex flex-col items-center justify-center overflow-hidden relative w-full h-full'
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleDeselect}
    >
      <div
        className='relative flex items-center justify-center'
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: startPan ? 'none' : 'transform 0.2s ease-out',
          transformOrigin: 'center center',
        }}
      >
        <div
          className='rounded-3xl border-4 border-gray-200 shadow-lg overflow-hidden'
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <EditorDesignTemplateInject
            designTemplateId={designTemplateId}
            canvasData={designTemplateData ? designTemplateData.canvas_data : null}
            designTemplateDataFromServer={designTemplateData}
          />
        </div>
      </div>
    </div>
  )
}
