'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Smartphone, 
  Globe, 
  Briefcase, 
  Code
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  count?: number
}

interface Type {
  id: string
  name: string
  slug: string
  description?: string
  category_id?: string
  count?: number
}

// Icon mapping for dynamic icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'palette': Palette,
  'smartphone': Smartphone,
  'globe': Globe,
  'briefcase': Briefcase,
  'code': Code,
  'default': Palette
}

// Color mapping for dynamic colors
const colorMap: Record<string, string> = {
  'blue': 'border-blue-500 text-blue-500',
  'green': 'border-green-500 text-green-500',
  'purple': 'border-purple-500 text-purple-500',
  'orange': 'border-orange-500 text-orange-500',
  'red': 'border-red-500 text-red-500',
  'pink': 'border-pink-500 text-pink-500',
  'yellow': 'border-yellow-500 text-yellow-500',
  'indigo': 'border-indigo-500 text-indigo-500',
  'teal': 'border-teal-500 text-teal-500',
  'cyan': 'border-cyan-500 text-cyan-500',
  'default': 'border-gray-500 text-gray-500'
}

interface CategoryBrowserProps {
  categories: Category[]
  types: Type[]
  onCategorySelect?: (categoryId: string) => void
  onTypeSelect?: (typeId: string) => void
  selectedCategory?: string
  selectedType?: string
}

export function CategoryBrowser({ 
  categories,
  types,
  onCategorySelect, 
  onTypeSelect, 
  selectedCategory, 
  selectedType 
}: CategoryBrowserProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'types'>('categories')

  return (
    <div className='space-y-6'>
      {/* Tab Navigation */}
      <div className='flex space-x-1 bg-muted p-1 rounded-lg w-fit'>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Kategorien
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'types'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Template-Typen
        </button>
      </div>

      {/* Categories Grid */}
      {activeTab === 'categories' && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {categories.map((category) => {
            const Icon = iconMap[category.icon || 'default']
            const colorClass = colorMap[category.color || 'default']
            const isSelected = selectedCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect?.(category.id)}
                className='group block'
              >
                <Card className={`p-4 text-center hover:shadow-md transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}>
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg border-2 bg-background flex items-center justify-center ${colorClass}`}>
                    <Icon className='h-6 w-6' />
                  </div>
                  <h3 className='font-medium text-sm mb-1 group-hover:text-primary transition-colors'>
                    {category.name}
                  </h3>
                  <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>
                    {category.description}
                  </p>
                  {category.count && (
                    <Badge variant='secondary' className='text-xs'>
                      {category.count}
                    </Badge>
                  )}
                </Card>
              </button>
            )
          })}
        </div>
      )}

      {/* Types Grid */}
      {activeTab === 'types' && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {types.map((type) => {
            const Icon = iconMap[type.icon || 'code']
            const colorClass = colorMap[type.color || 'default']
            const isSelected = selectedType === type.id
            
            return (
              <button
                key={type.id}
                onClick={() => onTypeSelect?.(type.id)}
                className='group block'
              >
                <Card className={`p-4 text-center hover:shadow-md transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}>
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg border-2 bg-background flex items-center justify-center ${colorClass}`}>
                    <Icon className='h-6 w-6' />
                  </div>
                  <h3 className='font-medium text-sm mb-1 group-hover:text-primary transition-colors'>
                    {type.name}
                  </h3>
                  <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>
                    {type.description}
                  </p>
                  {type.count && (
                    <Badge variant='secondary' className='text-xs'>
                      {type.count}
                    </Badge>
                  )}
                </Card>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
