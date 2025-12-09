
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import LeftSidebar from './components/left-use-template-sidebar'
import RightSidebar from './components/right-use-template-sidebar'
import EditorContainer from './components/editor-container'
import StatusBar from './components/status-bar'
import Toolbar from './components/toolbar' 
import DebugPanel from './components/debug-panel'
import JsonDebugViewer from './components/json-debug-viewer'

import { createClient } from '@/server/supabase/server'

export default async function UseDesignTemplate({
  searchParams,
}: {
  searchParams: Promise<{ templateId: string; debug?: string }>
}) {
  const { templateId, debug } = await searchParams
  console.log('templateId', templateId)
  let designTemplateData = null

  if (templateId) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('design_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) {
      console.error('Error loading template:', error)
    }

    if (data) {
      console.log('Loaded template data for use:', data)
      designTemplateData = data
    }
  }

  return (
    <SidebarProvider>
      <LeftSidebar templateId={templateId} />
      <RightSidebar
        designTemplateDataFromServer={designTemplateData}
        templateId={templateId}
      />

      <div className='absolute inset-0 bg-background -z-4 bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)]'></div>

      <main className='w-full h-full absolute'>
        <EditorContainer
          templateId={templateId}
          designTemplateData={designTemplateData}
        />
      </main>

      <StatusBar />

      <Toolbar />

      {debug === '1' && (
        <>
          {/* Optional Debug UI */}
          <JsonDebugViewer />
          <DebugPanel />
        </>
      )}
    </SidebarProvider>
  )
}
