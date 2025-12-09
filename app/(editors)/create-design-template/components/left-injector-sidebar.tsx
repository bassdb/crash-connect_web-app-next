'use client'

// react imports

// ui imports

import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, ChevronDown, Edit } from 'lucide-react'
// logic   imports

// FilePond Imports
import useEditorStore from '@/app/(editors)/_hooks/useEditorStore'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import { useToast } from '@/hooks/use-toast'
import TabCanvasSettings from './tab-canvas'
import TabLayers from './tab-layers'
import TabElements from './tab-elements'
// Register FilePond plugins

interface LeftSidebarProps {
  designTemplateId?: string
}

export default function LeftSidebar({ designTemplateId }: LeftSidebarProps) {
  const { leftSidebarState, setLeftSidebarState } = useEditorStore()
  const { fabricCanvas } = useCanvasStore()

  // console.log(fabricCanvas)
  const { toast } = useToast()

  return (
    <Sidebar side='left' className='w-80 xl:w-96'>
      <SidebarContent>
        <div className='p-4'>
          <Button variant='ghost' className='mb-6 -ml-2 gap-2' asChild>
            <a
              href={
                designTemplateId
                  ? `/admin-dashboard/design-templates/manage-design-templates/${designTemplateId}`
                  : '/admin-dashboard/design-templates/manage-design-templates'
              }
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Template Details
            </a>
          </Button>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Edit size={18} />
            Architecture
          </h2>
          <Tabs
            defaultValue='layers'
            value={leftSidebarState}
            onValueChange={(value) =>
              setLeftSidebarState(value as 'upload' | 'layers' | 'settings' | 'values')
            }
            className='space-y-4'
          >
            <TabsList className='w-full '>
              <TabsTrigger value='canvasSettings' className='grow'>
                Canvas
              </TabsTrigger>
              <TabsTrigger value='upload' className='grow'>
                Elements
              </TabsTrigger>
              <TabsTrigger value='layers' className='grow'>
                Layers
              </TabsTrigger>
            </TabsList>
            <Separator />

            <div className='space-y-4'>
              <TabsContent value='upload'>
                <TabElements />
              </TabsContent>

              <TabsContent value='layers'>
                <Separator />
                <TabLayers />
              </TabsContent>

              <TabsContent value='canvasSettings'>
                <TabCanvasSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
