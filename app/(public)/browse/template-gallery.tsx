'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {  
  Clock, 
  TrendingUp, 
  Download, 
  Star,
  Filter,
  X
} from 'lucide-react'

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
}

interface Type {
  id: string
  name: string
  slug: string
  description?: string
  category_id?: string
}

interface TemplateGalleryProps {
  templates: Template[]
  categories: Category[]
  types: Type[]
  selectedCategory?: string
  selectedType?: string
  onCategoryChange?: (category: string) => void
  onTypeChange?: (type: string) => void
}

export function TemplateGallery({ 
  templates, 
  categories,
  types,
  selectedCategory, 
  selectedType, 
  onCategoryChange, 
  onTypeChange 
}: TemplateGalleryProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'most-used' | 'rating'>('newest')
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory || 'all')
  const [typeFilter, setTypeFilter] = useState(selectedType || 'all')
  const [showFilters, setShowFilters] = useState(false)

  // Update filters when props change
  React.useEffect(() => {
    if (selectedCategory !== undefined) {
      setCategoryFilter(selectedCategory)
    }
  }, [selectedCategory])

  React.useEffect(() => {
    if (selectedType !== undefined) {
      setTypeFilter(selectedType)
    }
  }, [selectedType])

  // Add mock data for demonstration using deterministic values to avoid hydration mismatches
  const templatesWithMockData = useMemo(() => {
    const hashString = (value: string) => {
      let hash = 5381
      for (let i = 0; i < value.length; i++) {
        hash = (hash * 33) ^ value.charCodeAt(i)
      }
      return hash >>> 0
    }

    return templates.map((template) => {
      const baseKey = template.id || template.name || 'template'
      const h3 = hashString(baseKey + 'downloads')
      const h4 = hashString(baseKey + 'rating')
      const h5 = hashString(baseKey + 'trending')

      const downloads = 50 + (h3 % 951) // 50..1000
      const rating = 3 + (h4 % 201) / 100 // 3.00..5.01 ≈ up to 5.01
      const trending_score = h5 % 100 // 0..99

      return {
        ...template,
        downloads,
        rating,
        trending_score,
      }
    })
  }, [templates])

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...templatesWithMockData]

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => {
        // Check both category_id (new) and category (legacy) fields
        return (template as any).category_id === categoryFilter || template.category === categoryFilter
      })
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(template => {
        // Check both type_id (new) and type (legacy) fields
        return (template as any).type_id === typeFilter || template.type === typeFilter
      })
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        case 'trending':
          return (b.trending_score || 0) - (a.trending_score || 0)
        case 'most-used':
          return (b.downloads || 0) - (a.downloads || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [templatesWithMockData, sortBy, categoryFilter, typeFilter])

  const clearFilters = () => {
    setCategoryFilter('all')
    setTypeFilter('all')
    onCategoryChange?.('all')
    onTypeChange?.('all')
  }

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category)
    onCategoryChange?.(category)
  }

  const handleTypeChange = (type: string) => {
    setTypeFilter(type)
    onTypeChange?.(type)
  }

  const hasActiveFilters = categoryFilter !== 'all' || typeFilter !== 'all'

  return (
    <div className='space-y-6'>
      {/* Filter Bar */}
      <Card className='p-4'>
        <div className='space-y-4'>
          {/* Sort Options */}
          <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
            <div className='flex-1'>
              <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='newest' className='flex items-center space-x-1'>
                    <Clock className='h-3 w-3' />
                    <span className='hidden sm:inline'>Neueste</span>
                  </TabsTrigger>
                  <TabsTrigger value='trending' className='flex items-center space-x-1'>
                    <TrendingUp className='h-3 w-3' />
                    <span className='hidden sm:inline'>Trending</span>
                  </TabsTrigger>
                  <TabsTrigger value='most-used' className='flex items-center space-x-1'>
                    <Download className='h-3 w-3' />
                    <span className='hidden sm:inline'>Beliebt</span>
                  </TabsTrigger>
                  <TabsTrigger value='rating' className='flex items-center space-x-1'>
                    <Star className='h-3 w-3' />
                    <span className='hidden sm:inline'>Top</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center space-x-1'
              >
                <Filter className='h-4 w-4' />
                <span>Filter</span>
                {hasActiveFilters && (
                  <Badge variant='secondary' className='ml-1 h-5 w-5 p-0 text-xs'>
                    {(categoryFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearFilters}
                  className='flex items-center space-x-1 text-muted-foreground'
                >
                  <X className='h-3 w-3' />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className='pt-4 border-t'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>Kategorie</label>
                  <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Alle Kategorien</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className='text-sm font-medium mb-2 block'>Template-Typ</label>
                  <Select value={typeFilter} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Alle Typen</SelectItem>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className='flex items-center justify-between pt-2 border-t text-sm text-muted-foreground'>
            <span>
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'Template' : 'Templates'} gefunden
            </span>
          </div>
        </div>
      </Card>

      {/* Template Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {filteredTemplates.map((template) => (
          <Link
            key={template.id}
            href={`/browse/${template.id}`}
            className='group block'
          >
            <Card className='overflow-hidden hover:shadow-lg transition-all duration-300'>
              <div className='relative'>
                {template.preview_image_url ? (
                  <img
                    src={template.preview_image_url}
                    alt={template.name || 'Design Template'}
                    className='w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                ) : (
                  <div className='w-full aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950'>
                    <div className='text-center text-muted-foreground'>
                      <div className='text-2xl mb-2'>🎨</div>
                      <p className='text-sm'>Template Vorschau</p>
                    </div>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className='absolute top-2 left-2'>
                  <Badge variant='secondary' className='text-xs capitalize'>
                    {template.category}
                  </Badge>
                </div>
              </div>
              
              <div className='p-4'>
                <h3 className='font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors'>
                  {template.name}
                </h3>
                
                <div className='flex items-center justify-between mt-3 text-sm text-muted-foreground'>
                  <div className='flex items-center space-x-1'>
                    <Download className='h-3 w-3' />
                    <span>{template.downloads}</span>
                  </div>
                  <Badge variant='outline' className='text-xs capitalize'>
                    {template.type}
                  </Badge>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-muted-foreground space-y-4'>
            <div className='text-4xl'>🔍</div>
            <h3 className='text-lg font-semibold'>Keine Templates gefunden</h3>
            <p className='text-sm'>Versuche andere Filter oder entferne einige Filterkriterien.</p>
            <Button variant='outline' onClick={clearFilters}>
              Filter zurücksetzen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
