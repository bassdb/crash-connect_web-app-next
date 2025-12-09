'use client'

import useCanvasStore from '@/app/(editors)/create-design-template/hooks/useCanvasStore'

interface EditorWrapperProps {
  children: React.ReactNode
}

export default function EditorWrapper({ children }: EditorWrapperProps) {
  const handleContainerClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the container, not its children
    if (e.target === e.currentTarget) {
      const { fabricCanvas, setSelectedObject } = useCanvasStore.getState()
      if (fabricCanvas) {
        fabricCanvas.discardActiveObject()
        fabricCanvas.requestRenderAll()
        setSelectedObject(null)
      }
    }
  }

  return (
    <div className='flex w-full' onClick={handleContainerClick}>
      <main
        className='flex flex-col items-center justify-center w-full'
        onClick={handleContainerClick}
      >
        {children}
      </main>
    </div>
  )
}
