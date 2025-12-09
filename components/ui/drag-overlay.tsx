'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Position {
  x: number
  y: number
}

interface DragOverlayProps {
  children: React.ReactNode
  initialPosition: Position
  className?: string
}

export function DragOverlay({ children, initialPosition, className }: DragOverlayProps) {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef<Position>({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      setIsDragging(true)
      const rect = dragRef.current.getBoundingClientRect()
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - offsetRef.current.x,
          y: e.clientY - offsetRef.current.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={dragRef}
      className={cn(
        'fixed cursor-move bg-background border rounded-lg shadow-lg',
        isDragging && 'opacity-90',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}
