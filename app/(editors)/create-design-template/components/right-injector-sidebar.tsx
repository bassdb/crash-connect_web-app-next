'use client'

// UI imports

import { Settings } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs'
import { Tabs } from '@/components/ui/tabs'
// removed old save button icons

// react imports
import { useState, useEffect } from 'react'

// components imports
import TemplatePreviewImageMetadataBottom from './metadata-preview-box'
import LayerProperties from './layer-properties'
import TabValues from './tab-values'
import SaveDesignTemplateButton from './save-design-template-button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import useDesignTemplateStore from '@/app/(editors)/_hooks/useDesignTemplateStore'

// server logic imports
// removed old save canvas flow

// client logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'

export default function DesignTemplateRightSidebar({
  designTemplateId,
}: {
  designTemplateId: string | undefined
}) {
  const {
    fabricCanvas,
    initializeCanvasChangeTracking,
    isTemplateCanvasDataLoaded,
    selectedObject,
  } = useCanvasStore()
  const { designTemplateData } = useDesignTemplateStore()

  // Dynamischer Tab-State basierend auf selectedObject
  const [activeTab, setActiveTab] = useState(() => (selectedObject ? 'logs' : 'preset'))

  // Initialisierung ist in EditorDesignTemplateInject zentralisiert

  // Canvas-Änderungen überwachen mit zentralisierter Logik
  // Warte bis Template vollständig geladen ist
  useEffect(() => {
    if (fabricCanvas && isTemplateCanvasDataLoaded) {
      // Kleine Verzögerung um sicherzustellen, dass das Template vollständig gerendert ist
      const timeoutId = setTimeout(() => {
        initializeCanvasChangeTracking()
      }, 200)

      return () => clearTimeout(timeoutId)
    }
  }, [fabricCanvas, isTemplateCanvasDataLoaded, initializeCanvasChangeTracking])

  // Für neue Templates ohne Server-Daten: Initialstatus wird durch Initializer gesetzt

  // Tab-Wechsel basierend auf selectedObject
  useEffect(() => {
    if (selectedObject) {
      setActiveTab('logs') // Layer Properties Tab
    } else {
      setActiveTab('preset') // Preset Tab
    }
  }, [selectedObject])

  // removed old submit flow for preview+canvas save

  return (
    <Sidebar side='right' className='w-80 xl:w-96'>
      <SidebarContent className='flex flex-col h-full'>
        <div className='p-4'>
          <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 mt-4'>
            <Settings size={18} />
            Template Settings
          </h2>
        </div>

        <div className='flex-1 flex flex-col overflow-hidden'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='flex flex-col h-full mx-2'
          >
            <div className='flex-shrink-0'>
              <TabsList className='w-full grid grid-cols-2'>
                <TabsTrigger value='logs' className='flex-1'>
                  Layer Properties
                </TabsTrigger>
                <TabsTrigger value='preset' className='flex-1'>
                  Preset Values
                </TabsTrigger>
              </TabsList>
              <Separator />
            </div>

            <div className='flex-1 overflow-y-auto'>
              <TabsContent value='logs' className='px-4 pb-4'>
                <LayerProperties />
              </TabsContent>

              <TabsContent value='preset' className='px-4 pb-4'>
                <TabValues designTemplateId={designTemplateId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Save Template Button (metadata only) */}
        <div className='flex-shrink-0 p-4 border-t bg-background'>
          <SaveDesignTemplateButton designTemplateId={designTemplateId} />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
