'use client'

// react imports

// ui imports

import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, ChevronDown, Eye } from 'lucide-react'
// logic   imports

// FilePond Imports
import useEditorStore from '@/app/(editors)/_hooks/useEditorStore'
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import { useToast } from '@/hooks/use-toast'
import  TabLayers  from './tab-layers'
import  TabElements  from './tab-elements'
// Register FilePond plugins

interface LeftSidebarProps {
  templateId?: string
}

export default function LeftUseTemplateSidebar({ templateId }: LeftSidebarProps) {
  const { leftSidebarState, setLeftSidebarState } = useEditorStore()
  const { fabricCanvas } = useCanvasStore()

  // console.log(fabricCanvas)
  const { toast } = useToast()

  return (
    <Sidebar side='left' className='w-80 xl:w-96'>
      <SidebarContent>
        <div className='p-4'>
          <Button variant='ghost' className='mb-6 -ml-2 gap-2' asChild>
            <a href='/dashboard'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Zurück zum Dashboard
            </a>
          </Button>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Eye size={18} />
            Template verwenden
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
              <TabsTrigger value='elements' className='grow'>
                Elemente
              </TabsTrigger>
              <TabsTrigger value='layers' className='grow'>
                Ebenen
              </TabsTrigger>
            </TabsList>
            <Separator />

            <div className='space-y-4'>
              <TabsContent value='elements'>
                <TabElements />
              </TabsContent>

              <TabsContent value='layers'>
                <Separator />
                <TabLayers />
              </TabsContent>

              <TabsContent value='canvasSettings'>
               
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
