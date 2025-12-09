'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'

interface MasonryGridProps {
  items: {
    id: string
    title: string
    imageUrl: string
  }[]
}

export default function MasonryGrid({ items }: MasonryGridProps) {
  const [columns, setColumns] = useState(4)

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(2)
      else if (window.innerWidth < 768) setColumns(3)
      else if (window.innerWidth < 1024) setColumns(4)
      else setColumns(5)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const getColumnItems = (columnIndex: number) => {
    return items.filter((_, index) => index % columns === columnIndex)
  }

  return (
    <div className='w-full p-4 flex gap-4'>
      {Array.from({ length: columns }, (_, columnIndex) => (
        <div key={columnIndex} className='flex-1 flex flex-col gap-4'>
          {getColumnItems(columnIndex).map((item) => (
            <Card
              key={item.id}
              className='overflow-hidden transition-transform hover:scale-[1.02] cursor-zoom-in rounded-xl'
            >
              <div className='relative w-full pb-[177.78%]'>
                {' '}
                {/* 16:9 aspect ratio */}
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className='object-cover rounded-xl'
                />
                <div className='absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl'>
                  <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                    <h3 className='text-lg font-semibold truncate'>{item.title}</h3>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
