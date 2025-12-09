import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import LeftSidebar from './components/left-injector-sidebar'
import RightSidebar from './components/right-injector-sidebar'
import EditorContainer from './components/editor-container'
import StatusBar from './components/status-bar'
import Toolbar from './components/toolbar'

import { createClient } from '@/server/supabase/server'

// type Props = {
//   searchParams: { [key: string]: string | string[] | undefined }
// }

export default async function DesignTemplateInjector({
  searchParams,
}: {
  searchParams: Promise<{ designTemplateId: string }>
}) {
  const { designTemplateId } = await searchParams
  let designTemplateData = null

  if (designTemplateId) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('design_templates')
      .select(`
        *,
        example_team:teams!default_team_values (*)
      `)
      .eq('id', designTemplateId)
      .single()

    if (error) {
      console.error(error)
    }

    if (data) {
      // console.log('received template data from server:', data)
      designTemplateData = data
    }
  }

  return (
    <SidebarProvider>
      <LeftSidebar designTemplateId={designTemplateId} />
      <RightSidebar designTemplateId={designTemplateId} />

      <div className='absolute inset-0 bg-background -z-4 bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)]'></div>

      <main className=' w-full h-full absolute'>
        <EditorContainer
          designTemplateId={designTemplateId}
          designTemplateData={designTemplateData}
        />
      </main>

      <StatusBar />

      <Toolbar />
    </SidebarProvider>
  )
}
