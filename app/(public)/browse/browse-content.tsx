'use client'

import { useState } from 'react'
import { TemplateGallery } from '@/app/(public)/browse/template-gallery'
import { CategoryBrowser } from '@/app/(public)/browse/category-browser'

interface Template {
  id: string
  name: string
  preview_image_url?: string
  created_at?: string
  category?: string
  type?: string
}

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

interface BrowseContentProps {
  templates: Template[]
  categories: Category[]
  types: Type[]
}

export function BrowseContent({ templates, categories, types }: BrowseContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
  }

  return (
    <div className='space-y-6'>
      {/* Category Browser Section */}
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>Nach Kategorien durchsuchen</h2>
          <p className='text-sm text-muted-foreground'>
            Wähle eine Kategorie oder einen Template-Typ aus, um deine Suche zu verfeinern
          </p>
        </div>
        <CategoryBrowser 
          categories={categories}
          types={types}
          onCategorySelect={handleCategorySelect}
          onTypeSelect={handleTypeSelect}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
        />
      </div>
      
      <TemplateGallery 
        templates={templates}
        categories={categories}
        types={types}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        onCategoryChange={handleCategoryChange}
        onTypeChange={handleTypeChange}
      />
    </div>
  )
}
