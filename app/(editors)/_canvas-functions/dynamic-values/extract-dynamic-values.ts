// Funktionen zum Extrahieren identifizierbarer Layer-Werte aus Canvas-Daten
import * as fabric from 'fabric'

// Interface für dynamische Layer-Werte
export interface DynamicLayerValue {
  id: string
  name: string
  type: 'static' | 'dynamic'
  dynamicType?: string
  currentValue?: string | number
  properties?: Record<string, any> // Deprecated, wird nicht mehr verwendet
  position?: {
    left: number
    top: number
    width?: number
    height?: number
  }
  visible: boolean
  zIndex: number
}

// Interface für gruppierte dynamische Werte
export interface ExtractedDynamicValues {
  colorLayers: DynamicLayerValue[]
  textLayers: DynamicLayerValue[]
  logoLayers: DynamicLayerValue[]
  staticLayers: DynamicLayerValue[]
  allLayers: DynamicLayerValue[]
}

// TypeGuard für Text-ähnliche Objekte (Text, IText, Textbox)
const isTextLike = (
  obj: fabric.Object
): obj is fabric.Text | fabric.IText | fabric.Textbox => {
  const t = (obj as any).type
  return t === 'text' || t === 'i-text' || t === 'textbox'
}

/**
 * Extrahiert alle identifizierbaren Layer-Werte aus Canvas-Daten
 * @param fabricCanvas - Das Fabric Canvas Objekt
 * @returns Gruppierte dynamische Layer-Werte
 */
export const extractDynamicValuesFromCanvas = (
  fabricCanvas: fabric.Canvas
): ExtractedDynamicValues => {
  const objects = fabricCanvas.getObjects()
  const extractedValues: ExtractedDynamicValues = {
    colorLayers: [],
    textLayers: [],
    logoLayers: [],
    staticLayers: [],
    allLayers: [],
  }

  objects.forEach((object: fabric.Object, index: number) => {
    const dynamicLayerType = (object as any).dynamicLayerType
    const isDynamic = !!dynamicLayerType
    const isVisible = object.visible !== false
    const objectName = (object as any).name
    const zIndex = index

    // Aktueller Wert basierend auf Objekttyp extrahieren
    let currentValue: string | number | undefined

    if (isTextLike(object)) {
      currentValue = object.text || ''
    } else if ((object.type === 'rect' || object instanceof fabric.Rect) && dynamicLayerType?.includes('color')) {
      currentValue = (object as fabric.Rect).fill as string
    } else if ((object.type === 'image' || object instanceof fabric.Image) && dynamicLayerType === 'team_logo') {
      const img: any = object
      const src = typeof img.getSrc === 'function' ? img.getSrc() : img.src
      currentValue = src
    }

    const layerValue: DynamicLayerValue = {
      id: `${object.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: objectName || `${object.type.charAt(0).toUpperCase()}${object.type.slice(1)}`,
      type: isDynamic ? 'dynamic' : 'static',
      dynamicType: dynamicLayerType,
      currentValue,
      properties: {},
      position: {
        left: object.left || 0,
        top: object.top || 0,
        width: (object as any).width,
        height: (object as any).height,
      },
      visible: isVisible,
      zIndex,
    }

    // Layer in entsprechende Kategorie einordnen
    if (isDynamic) {
      if (dynamicLayerType?.includes('color')) {
        extractedValues.colorLayers.push(layerValue)
      } else if (
        dynamicLayerType === 'text' ||
        dynamicLayerType === 'team_name' ||
        dynamicLayerType === 'jersey_number' ||
        dynamicLayerType === 'user_first_name' ||
        dynamicLayerType === 'user_last_name'
      ) {
        extractedValues.textLayers.push(layerValue)
      } else if (dynamicLayerType === 'team_logo') {
        extractedValues.logoLayers.push(layerValue)
      }
    } else {
      extractedValues.staticLayers.push(layerValue)
    }

    extractedValues.allLayers.push(layerValue)
  })

  // Nach zIndex sortieren (höchste zuerst)
  const sortByZIndex = (a: DynamicLayerValue, b: DynamicLayerValue) => b.zIndex - a.zIndex
  extractedValues.colorLayers.sort(sortByZIndex)
  extractedValues.textLayers.sort(sortByZIndex)
  extractedValues.logoLayers.sort(sortByZIndex)
  extractedValues.staticLayers.sort(sortByZIndex)
  extractedValues.allLayers.sort(sortByZIndex)

  return extractedValues
}

/**
 * Extrahiert nur die dynamischen Layer-Werte (ohne statische)
 * @param fabricCanvas - Das Fabric Canvas Objekt
 * @returns Array von dynamischen Layer-Werten
 */
export const extractOnlyDynamicValues = (fabricCanvas: fabric.Canvas): DynamicLayerValue[] => {
  const allValues = extractDynamicValuesFromCanvas(fabricCanvas)
  return allValues.allLayers.filter((layer) => layer.type === 'dynamic')
}

/**
 * Extrahiert Layer-Werte basierend auf einem bestimmten dynamischen Typ
 * @param fabricCanvas - Das Fabric Canvas Objekt
 * @param dynamicType - Der spezifische dynamische Typ
 * @returns Array von Layer-Werten des angegebenen Typs
 */
export const extractValuesByDynamicType = (
  fabricCanvas: fabric.Canvas,
  dynamicType: string
): DynamicLayerValue[] => {
  const allValues = extractDynamicValuesFromCanvas(fabricCanvas)
  return allValues.allLayers.filter((layer) => layer.dynamicType === dynamicType)
}

/**
 * Extrahiert Layer-Werte basierend auf einer Text-Property
 * @param fabricCanvas - Das Fabric Canvas Objekt
 * @param textProperty - Die spezifische Text-Property
 * @returns Array von Layer-Werten mit der angegebenen Text-Property
 * @deprecated Properties werden nicht mehr verwendet, nutze extractValuesByDynamicType stattdessen
 */
export const extractValuesByTextProperty = (
  fabricCanvas: fabric.Canvas,
  textProperty: string
): DynamicLayerValue[] => {
  return []
}

/**
 * Extrahiert Layer-Werte basierend auf einer Farb-Property
 * @param fabricCanvas - Das Fabric Canvas Objekt
 * @param colorProperty - Die spezifische Farb-Property
 * @returns Array von Layer-Werten mit der angegebenen Farb-Property
 * @deprecated Properties werden nicht mehr verwendet, nutze extractValuesByDynamicType stattdessen
 */
export const extractValuesByColorProperty = (
  fabricCanvas: fabric.Canvas,
  colorProperty: string
): DynamicLayerValue[] => {
  return []
}

/**
 * Erstellt eine Zusammenfassung der extrahierten dynamischen Werte
 * @param fabricCanvas - Das Fabric Canvas Objekt
 * @returns Zusammenfassung der dynamischen Werte
 */
export const getDynamicValuesSummary = (fabricCanvas: fabric.Canvas) => {
  const values = extractDynamicValuesFromCanvas(fabricCanvas)

  return {
    totalLayers: values.allLayers.length,
    dynamicLayers: values.allLayers.filter((l) => l.type === 'dynamic').length,
    staticLayers: values.staticLayers.length,
    colorLayers: values.colorLayers.length,
    textLayers: values.textLayers.length,
    logoLayers: values.logoLayers.length,
    visibleLayers: values.allLayers.filter((l) => l.visible).length,
    hiddenLayers: values.allLayers.filter((l) => !l.visible).length,
    summary: {
      colors: values.colorLayers.map((l) => ({
        name: l.name,
        dynamicType: l.dynamicType,
        value: l.currentValue,
      })),
      texts: values.textLayers.map((l) => ({
        name: l.name,
        dynamicType: l.dynamicType,
        value: l.currentValue,
      })),
      logos: values.logoLayers.map((l) => ({
        name: l.name,
        dynamicType: l.dynamicType,
        value: l.currentValue,
      })),
    },
  }
}
