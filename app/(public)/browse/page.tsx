import { createClient } from '@/server/supabase/server'
import { BrowseContent } from '@/app/(public)/browse/browse-content'
import { getBrowseCategories, getBrowseTypes } from '@/app/(public)/browse/_server-actions/browse-actions'

export default async function FindDesignTemplates() {
  const supabase = await createClient()

  // Load only published templates
  const { data: templates, error: templatesError } = await supabase
    .from('design_templates')
    .select('*')
    .eq('status', 'published')

  if (templatesError) {
    console.error('Templates error:', templatesError)
  }

  // Load categories and types
  const [categoriesResult, typesResult] = await Promise.all([
    getBrowseCategories(),
    getBrowseTypes()
  ])

  const categories = categoriesResult.success ? categoriesResult.categories : []
  const types = typesResult.success ? typesResult.types : []

  // console.log('Templates:', templates)
  // console.log('Categories:', categories)
  // console.log('Types:', types)

  return (
    <div className='flex-1 w-full'>
      <div className='container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold'>Design Templates</h1>
            <p className='text-muted-foreground'>
              Entdecke und durchsuche unsere umfangreiche Sammlung von Design Templates
            </p>
          </div>
          
          <BrowseContent 
            templates={templates || []} 
            categories={categories}
            types={types}
          />
        </div>
      </div>
    </div>
  )
}
