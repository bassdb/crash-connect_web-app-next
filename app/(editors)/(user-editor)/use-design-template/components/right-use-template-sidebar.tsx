'use client'

// UI imports
import { Button } from '@/components/ui/button'
import { Eye, Download } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs'
import { Tabs } from '@/components/ui/tabs'
import { LoaderCircle, CheckCircle } from 'lucide-react'

// react imports
import { useRouter } from 'next/navigation'
import { useState, useEffect, useTransition, useRef } from 'react'

// components imports
import TabTemplateInfo from './tab-template-info'
import LayerProperties from './layer-properties'
import TabValues from './tab-values'

// server logic imports
import { createClient } from '@/server/supabase/client'
import { useToast } from '@/hooks/use-toast'

// client logic imports
import useCanvasStore from '@/app/(editors)/_hooks/useCanvasStore'
import useDesignTemplateStore, {
  DesignTemplateData,
} from '@/app/(editors)/_hooks/useDesignTemplateStore'

export default function RightUseTemplateSidebar({
  designTemplateDataFromServer,
  templateId,
}: {
  designTemplateDataFromServer: DesignTemplateData | null
  templateId: string | undefined
}) {
  const {
    fabricCanvas,
    canvasWidth,
    canvasHeight,
    renderFrameRef,
    selectedObject,
  } = useCanvasStore()

  const {
    designTemplateData,
    setDesignTemplateData,
    storeDesignTemplateId,
    setStoreDesignTemplateId,
  } = useDesignTemplateStore()

  const [isPending, startTransition] = useTransition()

  // Dynamischer Tab-State basierend auf selectedObject
  const [activeTab, setActiveTab] = useState(() => (selectedObject ? 'logs' : 'values'))

  // Konsolidierter useEffect für alle Initialisierungen
  useEffect(() => {
    // storeDesignTemplateId setzen - Priorität: templateId prop, dann designTemplateDataFromServer.id
    if (!storeDesignTemplateId) {
      const currentTemplateId = templateId || designTemplateDataFromServer?.id
      if (currentTemplateId) {
        console.log('Setting storeDesignTemplateId for use-template:', currentTemplateId)
        setStoreDesignTemplateId(currentTemplateId)
      }
    }

    if (designTemplateDataFromServer) {
      // Dann die anderen States setzen
      if (!designTemplateData || designTemplateData.id !== designTemplateDataFromServer.id) {
        setDesignTemplateData(designTemplateDataFromServer)
      }
    }
  }, [
    templateId,
    designTemplateDataFromServer,
    setDesignTemplateData,
    setStoreDesignTemplateId,
    designTemplateData,
    storeDesignTemplateId,
  ])

  // Tab-Wechsel basierend auf selectedObject
  useEffect(() => {
    if (selectedObject) {
      setActiveTab('logs') // Layer Properties Tab
    } else {
      setActiveTab('values') // Values Tab
    }
  }, [selectedObject])

  const router = useRouter()
  const { toast } = useToast()

  const handleSaveForUser = async () => {
    if (!fabricCanvas) {
      toast({
        title: 'Fehler',
        description: 'Canvas nicht initialisiert',
        variant: 'destructive',
      })
      return
    }

    try {
      const json = fabricCanvas.toJSON()
      const png = fabricCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 })
      // Placeholder: user-spezifisches Speichern (nur Konsole)
      console.log('[USER-DESIGN-SAVE]', {
        templateId,
        json,
        pngPreview: typeof png === 'string' ? png.slice(0, 128) + '...' : undefined,
      })
      toast({ title: 'Gespeichert (Demo)', description: 'Design lokal protokolliert.' })
    } catch (error) {
      console.error('User save error:', error)
      toast({
        title: 'Fehler',
        description: 'Speichern fehlgeschlagen',
        variant: 'destructive',
      })
    }
  }

  const handleExportCanvas = async () => {
    if (!fabricCanvas) {
      toast({
        title: 'Fehler',
        description: 'Canvas nicht initialisiert',
        variant: 'destructive',
        className: 'border-red-500',
      })
      return
    }

    try {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      })

      const link = document.createElement('a')
      link.download = `${designTemplateData?.name || 'design-template'}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Erfolg',
        description: 'Design erfolgreich exportiert',
        className: 'border-green-500',
      })
    } catch (error) {
      console.error('Error exporting canvas:', error)
      toast({
        title: 'Fehler',
        description: 'Export fehlgeschlagen',
        variant: 'destructive',
      })
    }
  }

  return (
    <Sidebar side='right' className='w-80 xl:w-96'>
      <SidebarContent className='flex flex-col h-full'>
        <div className='p-4'>
          <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 mt-4'>
            <Eye size={18} />
            Template Ansicht
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
                  Eigenschaften
                </TabsTrigger>
                <TabsTrigger value='values' className='flex-1'>
                  Werte anpassen
                </TabsTrigger>
              </TabsList>
              <Separator />
            </div>

            <div className='flex-1 overflow-y-auto'>
              <TabsContent value='logs' className='px-4 pb-4'>
                <LayerProperties />
              </TabsContent>

              <TabsContent value='values' className='px-4 pb-4'>
                <TabValues
                  templateId={templateId}
                  defaultTeamValues={(designTemplateDataFromServer as any)?.default_team_values}
                />
              </TabsContent>
            </div>
          </Tabs>

          {/* Template Info Section - moved from tab to permanent position */}
          <div className='flex-shrink-0 px-6 pb-4 border-t bg-background/50'>
            <h3 className='text-sm font-medium mb-3 mt-4 text-muted-foreground'>Template Informationen</h3>
            <TabTemplateInfo
              designTemplateDataFromServer={designTemplateDataFromServer}
              templateId={templateId}
            />
          </div>
        </div>

        {/* Save & Export Buttons - permanent am unteren Rand */}
        <div className='flex-shrink-0 p-4 border-t bg-background space-y-2'>
          <Button
            onClick={handleSaveForUser}
            className='w-full gap-2 transition-all duration-200 h-11 text-sm font-medium'
            disabled={!fabricCanvas}
            variant='outline'
          >
            Mein Design speichern
          </Button>
          <Button
            onClick={handleExportCanvas}
            className='w-full gap-2 transition-all duration-200 h-12 text-base font-medium'
            disabled={isPending || !fabricCanvas}
          >
            {isPending ? (
              <span className='animate-spin'>
                <LoaderCircle />
              </span>
            ) : (
              <Download size={16} />
            )}
            Design exportieren
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
