import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'

// component imports
import TypeDialog from './type-dialog'

// packages imports
// server logic imports

import { createTypeAction, updateTypeAction, deleteTypeAction } from '../_server-actions'
import { createClient } from '@/server/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ManageDesignTemplateTypesPage() {
  const supabase = await createClient()
  let types: any[] = []
  try {
    const { data, error } = await supabase
      .from('design_template_types')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching all types:', error)
    }
    types = data ?? []
  } catch (error) {
    console.error('Error in getAllTypes:', error)
    types = []
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='space-y-2 mb-6'>
        <h1 className='text-2xl font-bold'>Design Template Types verwalten</h1>
        <p className='text-sm text-muted-foreground'>
          Die Tabelle <span className='font-medium'>design_template_types</span> katalogisiert Design-Templates nach Sportarten/Typen.
          Verwenden Sie Typen, um Vorlagen nach sportlichem Kontext (z. B. Fußball, Basketball, Handball) zu organisieren.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {/* Add tile */}
        <div className='group relative rounded-lg border border-dashed hover:border-primary transition-colors p-6 flex items-center justify-center'>
          <TypeDialog mode='create' action={createTypeAction}>
            <button className='flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary'>
              <Plus className='h-6 w-6 mb-2' />
              <span className='text-sm font-medium'>Neuen Typ hinzufügen</span>
            </button>
          </TypeDialog>
        </div>

        {/* Existing types */}
        {types.map((t: any) => (
          <div key={t.id} className='rounded-lg border p-4 flex flex-col gap-3'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <div className='text-base font-semibold'>{t.name}</div>
                <div className='text-xs text-muted-foreground'>/{t.slug}</div>
              </div>
              <div className='flex items-center gap-2'>
                <TypeDialog
                  mode='edit'
                  action={updateTypeAction}
                  initialValues={{ id: t.id, name: t.name, description: t.description ?? '', is_active: t.is_active }}
                >
                  <button className='inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border hover:bg-muted'>
                    <Pencil className='h-3.5 w-3.5' />
                    Bearbeiten
                  </button>
                </TypeDialog>

                <form action={deleteTypeAction}>
                  <input type='hidden' name='id' value={t.id} />
                  <button className='inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border text-red-600 hover:bg-red-50'>
                    <Trash2 className='h-3.5 w-3.5' />
                    Löschen
                  </button>
                </form>
              </div>
            </div>

            <div className='text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]'>
              {t.description || 'Keine Beschreibung'}
            </div>

            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Kategorie: {t.design_template_categories?.name ?? '—'}</span>
              <span>{t.is_active ? 'Aktiv' : 'Inaktiv'}</span>
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


