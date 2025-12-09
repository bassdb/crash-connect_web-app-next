export const dynamic = 'force-dynamic'
import { createClient } from '@/server/supabase/server'
import { notFound } from 'next/navigation'
import TemplateDetailComponent from './components/template-detail-component'
import { DesignTemplate } from '@/types/design-template'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DesignTemplateDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('design_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !template) {
    console.error('Error fetching template:', error)
    notFound()
  }

  return (
    <div className='container mx-auto py-10'>
      <TemplateDetailComponent template={template as DesignTemplate} />
    </div>
  )
}
