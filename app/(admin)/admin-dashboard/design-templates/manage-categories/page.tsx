import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'

// component imports
import CategoryDialog from './category-dialog'

// server logic imports
import { createClient } from '@/server/supabase/server'
import { createCategoryActionForm as createCategoryAction, updateCategoryActionForm as updateCategoryAction, deleteCategoryActionForm as deleteCategoryAction } from '../_server-actions/actions-types-categories'

export const dynamic = 'force-dynamic'

export default async function ManageDesignTemplateCategoriesPage() {
  const supabase = await createClient()
  let categories: any[] = []
  try {
    const { data, error } = await supabase
      .from('design_template_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching all categories:', error)
    }
    categories = data ?? []
  } catch (error) {
    console.error('Error in getAllCategories:', error)
    categories = []
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='space-y-2 mb-6'>
        <h1 className='text-2xl font-bold'>Design Template Kategorien verwalten</h1>
        <p className='text-sm text-muted-foreground'>
          Die Tabelle <span className='font-medium'>design_template_categories</span> gruppiert Typen und Templates nach übergeordneten Themen.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {/* Add tile */}
        <div className='group relative rounded-lg border border-dashed hover:border-primary transition-colors p-6 flex items-center justify-center'>
          <CategoryDialog mode='create' action={createCategoryAction}>
            <button className='flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary'>
              <Plus className='h-6 w-6 mb-2' />
              <span className='text-sm font-medium'>Neue Kategorie hinzufügen</span>
            </button>
          </CategoryDialog>
        </div>

        {/* Existing categories */}
        {categories.map((c: any) => (
          <div key={c.id} className='rounded-lg border p-4 flex flex-col gap-3'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <div className='text-base font-semibold'>{c.name}</div>
                <div className='text-xs text-muted-foreground'>/{c.slug}</div>
              </div>
              <div className='flex items-center gap-2'>
                <CategoryDialog
                  mode='edit'
                  action={updateCategoryAction}
                  initialValues={{ id: c.id, name: c.name, description: c.description ?? '', color: c.color ?? '', icon: c.icon ?? '', is_active: c.is_active }}
                >
                  <button className='inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border hover:bg-muted'>
                    <Pencil className='h-3.5 w-3.5' />
                    Bearbeiten
                  </button>
                </CategoryDialog>

                <form action={deleteCategoryAction}>
                  <input type='hidden' name='id' value={c.id} />
                  <button className='inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border text-red-600 hover:bg-red-50'>
                    <Trash2 className='h-3.5 w-3.5' />
                    Löschen
                  </button>
                </form>
              </div>
            </div>

            <div className='text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]'>
              {c.description || 'Keine Beschreibung'}
            </div>

            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Farbe: {c.color ?? '—'}</span>
              <span>{c.is_active ? 'Aktiv' : 'Inaktiv'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8'>
        <Link href='/admin-dashboard/design-templates' className='text-sm text-primary hover:underline'>
          ← Zurück zur Templates-Übersicht
        </Link>
      </div>
    </div>
  )
}


