// Komponente zur Anzeige extrahierter dynamischer Layer-Werte
'use client'

// react imports
import { useState } from 'react'

// ui imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChevronDown,
  Palette,
  Type,
  Image,
  Layers,
  Eye,
  EyeOff,
  Info,
  Copy,
  Check,
} from 'lucide-react'

// logic imports
import useDynamicValues from '../../_hooks/useDynamicValues'
import type { DynamicLayerValue } from '../../_canvas-functions/dynamic-values/extract-dynamic-values'

interface DynamicValuesPanelProps {
  className?: string
}

export default function DynamicValuesPanel({ className }: DynamicValuesPanelProps) {
  const {
    extractedValues,
    dynamicValues,
    summary,
    colorLayers,
    textLayers,
    logoLayers,
    staticLayers,
    isLoaded,
    hasCanvas,
  } = useDynamicValues()

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatValue = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return 'Nicht gesetzt'
    if (typeof value === 'string' && value.length > 50) {
      return `${value.substring(0, 50)}...`
    }
    return String(value)
  }

  const LayerItem = ({
    layer,
    showDetails = false,
  }: {
    layer: DynamicLayerValue
    showDetails?: boolean
  }) => (
    <div className='space-y-2 p-3 border rounded-lg bg-card'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant={layer.type === 'dynamic' ? 'default' : 'secondary'}>{layer.type}</Badge>
          <span className='font-medium'>{layer.name}</span>
        </div>
        <div className='flex items-center gap-2'>
          {layer.visible ? (
            <Eye className='h-4 w-4 text-green-600' />
          ) : (
            <EyeOff className='h-4 w-4 text-gray-400' />
          )}
          <Button variant='ghost' size='sm' onClick={() => copyToClipboard(layer.id, layer.id)}>
            {copiedId === layer.id ? (
              <Check className='h-4 w-4 text-green-600' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {layer.currentValue !== undefined && (
        <div className='text-sm text-muted-foreground'>
          <strong>Aktueller Wert:</strong> {formatValue(layer.currentValue)}
        </div>
      )}

      {showDetails && (
        <div className='space-y-1 text-xs text-muted-foreground'>
          <div>
            <strong>ID:</strong> {layer.id}
          </div>
          <div>
            <strong>Z-Index:</strong> {layer.zIndex}
          </div>
          {layer.dynamicType && (
            <div>
              <strong>Dynamischer Typ:</strong> {layer.dynamicType}
            </div>
          )}
          {layer.properties?.colorProperty && (
            <div>
              <strong>Farb-Property:</strong> {layer.properties.colorProperty}
            </div>
          )}
          {layer.properties?.textProperty && (
            <div>
              <strong>Text-Property:</strong> {layer.properties.textProperty}
            </div>
          )}
          {layer.properties?.teamId && (
            <div>
              <strong>Team ID:</strong> {layer.properties.teamId}
            </div>
          )}
          {layer.position && (
            <div>
              <strong>Position:</strong> {Math.round(layer.position.left)},{' '}
              {Math.round(layer.position.top)}
              {layer.position.width && layer.position.height && (
                <span>
                  {' '}
                  | {Math.round(layer.position.width)}×{Math.round(layer.position.height)}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (!hasCanvas || !isLoaded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Layers className='h-5 w-5' />
            Dynamische Layer-Werte
          </CardTitle>
          <CardDescription>
            Kein Canvas geladen oder Template-Daten noch nicht verfügbar
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!extractedValues || !summary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Layers className='h-5 w-5' />
            Dynamische Layer-Werte
          </CardTitle>
          <CardDescription>Fehler beim Extrahieren der Layer-Daten</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Layers className='h-5 w-5' />
          Dynamische Layer-Werte
        </CardTitle>
        <CardDescription>
          Übersicht über alle identifizierbaren Layer und ihre dynamischen Werte
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Zusammenfassung */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center p-3 bg-muted rounded-lg'>
            <div className='text-2xl font-bold text-primary'>{summary.totalLayers}</div>
            <div className='text-sm text-muted-foreground'>Gesamt</div>
          </div>
          <div className='text-center p-3 bg-muted rounded-lg'>
            <div className='text-2xl font-bold text-green-600'>{summary.dynamicLayers}</div>
            <div className='text-sm text-muted-foreground'>Dynamisch</div>
          </div>
          <div className='text-center p-3 bg-muted rounded-lg'>
            <div className='text-2xl font-bold text-blue-600'>{summary.visibleLayers}</div>
            <div className='text-sm text-muted-foreground'>Sichtbar</div>
          </div>
          <div className='text-center p-3 bg-muted rounded-lg'>
            <div className='text-2xl font-bold text-orange-600'>{summary.replaceableLayers}</div>
            <div className='text-sm text-muted-foreground'>Ersetzbar</div>
          </div>
        </div>

        <Separator />

        {/* Tabs für verschiedene Layer-Typen */}
        <Tabs defaultValue='all' className='w-full'>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='all'>Alle ({summary.totalLayers})</TabsTrigger>
            <TabsTrigger value='colors'>
              <Palette className='h-4 w-4 mr-1' />
              Farben ({summary.colorLayers})
            </TabsTrigger>
            <TabsTrigger value='texts'>
              <Type className='h-4 w-4 mr-1' />
              Texte ({summary.textLayers})
            </TabsTrigger>
            <TabsTrigger value='logos'>
              <Image className='h-4 w-4 mr-1' />
              Logos ({summary.logoLayers})
            </TabsTrigger>
            <TabsTrigger value='static'>
              <Layers className='h-4 w-4 mr-1' />
              Statisch ({summary.staticLayers})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='all' className='space-y-2'>
            {extractedValues.allLayers.map((layer: DynamicLayerValue) => (
              <LayerItem key={layer.id} layer={layer} showDetails={true} />
            ))}
          </TabsContent>

          <TabsContent value='colors' className='space-y-4'>
            {/* Gruppierung nach Primary, Secondary, Tertiary, Custom */}
            {(() => {
              const getColorKey = (layer: DynamicLayerValue) =>
                layer.properties?.colorProperty || 'custom'

              // colorProperty wird ohne Suffix '_color' gespeichert ('primary', 'secondary', 'tertiary', 'custom')
              const isPrimary = (l: DynamicLayerValue) => getColorKey(l) === 'primary'
              const isSecondary = (l: DynamicLayerValue) => getColorKey(l) === 'secondary'
              const isTertiary = (l: DynamicLayerValue) => getColorKey(l) === 'tertiary'

              // Alles, was nicht primary/secondary/tertiary ist, als custom betrachten
              const isCustom = (l: DynamicLayerValue) =>
                !isPrimary(l) && !isSecondary(l) && !isTertiary(l)

              const primary = colorLayers.filter(isPrimary)
              const secondary = colorLayers.filter(isSecondary)
              const tertiary = colorLayers.filter(isTertiary)
              const custom = colorLayers.filter(isCustom)

              return (
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-semibold'>
                      <span className='w-3 h-3 rounded bg-black dark:bg-white border' />
                      Primary Color ({primary.length})
                    </div>
                    {primary.length > 0 ? (
                      <div className='space-y-2'>
                        {primary.map((layer) => (
                          <LayerItem key={layer.id} layer={layer} showDetails={true} />
                        ))}
                      </div>
                    ) : (
                      <div className='text-xs text-muted-foreground'>Keine Primary Color Layer</div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-semibold'>
                      <span className='w-3 h-3 rounded border bg-white' />
                      Secondary Color ({secondary.length})
                    </div>
                    {secondary.length > 0 ? (
                      <div className='space-y-2'>
                        {secondary.map((layer) => (
                          <LayerItem key={layer.id} layer={layer} showDetails={true} />
                        ))}
                      </div>
                    ) : (
                      <div className='text-xs text-muted-foreground'>Keine Secondary Color Layer</div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-semibold'>
                      <span className='w-3 h-3 rounded bg-neutral-500' />
                      Tertiary Color ({tertiary.length})
                    </div>
                    {tertiary.length > 0 ? (
                      <div className='space-y-2'>
                        {tertiary.map((layer) => (
                          <LayerItem key={layer.id} layer={layer} showDetails={true} />
                        ))}
                      </div>
                    ) : (
                      <div className='text-xs text-muted-foreground'>Keine Tertiary Color Layer</div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-semibold'>
                      <span className='w-3 h-3 rounded bg-transparent border border-dashed' />
                      Custom Colors ({custom.length})
                    </div>
                    {custom.length > 0 ? (
                      <div className='space-y-2'>
                        {custom.map((layer) => (
                          <LayerItem key={layer.id} layer={layer} showDetails={true} />
                        ))}
                      </div>
                    ) : (
                      <div className='text-xs text-muted-foreground'>Keine Custom Color Layer</div>
                    )}
                  </div>
                </div>
              )
            })()}
          </TabsContent>

          <TabsContent value='texts' className='space-y-2'>
            {textLayers.map((layer: DynamicLayerValue) => (
              <LayerItem key={layer.id} layer={layer} showDetails={true} />
            ))}
          </TabsContent>

          <TabsContent value='logos' className='space-y-2'>
            {logoLayers.map((layer: DynamicLayerValue) => (
              <LayerItem key={layer.id} layer={layer} showDetails={true} />
            ))}
          </TabsContent>

          <TabsContent value='static' className='space-y-2'>
            {staticLayers.map((layer: DynamicLayerValue) => (
              <LayerItem key={layer.id} layer={layer} showDetails={true} />
            ))}
          </TabsContent>
        </Tabs>

        {/* JSON Export */}
        <Collapsible>
          <CollapsibleTrigger className='flex w-full items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <Info className='h-4 w-4' />
              <span>JSON Export</span>
            </div>
            <ChevronDown className='h-4 w-4' />
          </CollapsibleTrigger>
          <CollapsibleContent className='py-2'>
            <div className='space-y-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => copyToClipboard(JSON.stringify(extractedValues, null, 2), 'json')}
              >
                {copiedId === 'json' ? (
                  <Check className='h-4 w-4 mr-2' />
                ) : (
                  <Copy className='h-4 w-4 mr-2' />
                )}
                Alle Werte kopieren
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => copyToClipboard(JSON.stringify(dynamicValues, null, 2), 'dynamic')}
              >
                {copiedId === 'dynamic' ? (
                  <Check className='h-4 w-4 mr-2' />
                ) : (
                  <Copy className='h-4 w-4 mr-2' />
                )}
                Nur dynamische Werte
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
