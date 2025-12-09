// Hook zum Extrahieren und Verwalten dynamischer Layer-Werte mit Live-Editing
import { useMemo, useState, useCallback } from 'react'
import { create } from 'zustand'
import useCanvasStore from './useCanvasStore'
import {
  extractDynamicValuesFromCanvas,
  extractOnlyDynamicValues,
  extractValuesByDynamicType,
  extractValuesByTextProperty,
  extractValuesByColorProperty,
  getDynamicValuesSummary,
  type DynamicLayerValue,
  type ExtractedDynamicValues,
} from '../_canvas-functions/dynamic-values/extract-dynamic-values'

// Live-Editing Store für dynamische Werte
interface DynamicValuesState {
  // Live-Editing-Werte
  currentValues: {
    name?: string
    jerseyNumber?: number
    teamName?: string
    additionalText?: string
    primaryColor?: string
    secondaryColor?: string
    tertiaryColor?: string
  }
  
  // Actions
  updateValue: (property: string, value: any) => void
  updateMultipleValues: (values: Partial<DynamicValuesState['currentValues']>) => void
  resetValues: () => void
  applyValuesToCanvas: () => void
}

export const useDynamicValuesStore = create<DynamicValuesState>((set, get) => ({

  currentValues: {
    name: 'Your Name',
    jerseyNumber: 10,
    teamName: 'Team Name',
    additionalText: 'This is additional text',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    tertiaryColor: '#808080',
  },
  
  updateValue: (property: string, value: any) => {
    set((state) => ({
      currentValues: {
        ...state.currentValues,
        [property]: value,
      },
    }))
  },

  updateMultipleValues: (values: Partial<DynamicValuesState['currentValues']>) => {
    set((state) => ({
      currentValues: {
        ...state.currentValues,
        ...values,
      },
    }))
  },
  
  resetValues: () => {
    set({
      currentValues: {
        name: 'Your Name',
        jerseyNumber: 10,
        teamName: 'Team Name',
        additionalText: 'This is additional text',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        tertiaryColor: '#808080',
      },
    })
  },
  
  applyValuesToCanvas: () => {
    const { currentValues } = get()
    console.log('Applying values to canvas:', currentValues)
    // This will be implemented with actual canvas functions
  },
}))

/**
 * Hook zum Extrahieren dynamischer Layer-Werte aus dem Canvas mit Live-Editing
 * @returns Objekt mit extrahierten dynamischen Werten und Live-Editing-Funktionalität
 */
export const useDynamicValues = () => {
  const { fabricCanvas, isTemplateCanvasDataLoaded } = useCanvasStore()
  const { currentValues, updateValue, resetValues, applyValuesToCanvas } = useDynamicValuesStore()

  // Alle dynamischen Werte extrahieren
  const extractedValues = useMemo((): ExtractedDynamicValues | null => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) {
      return null
    }
    return extractDynamicValuesFromCanvas(fabricCanvas)
  }, [fabricCanvas, isTemplateCanvasDataLoaded])

  // Nur dynamische Layer-Werte
  const dynamicValues = useMemo((): DynamicLayerValue[] => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) {
      return []
    }
    return extractOnlyDynamicValues(fabricCanvas)
  }, [fabricCanvas, isTemplateCanvasDataLoaded])

  // Zusammenfassung der dynamischen Werte
  const summary = useMemo(() => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) {
      return null
    }
    return getDynamicValuesSummary(fabricCanvas)
  }, [fabricCanvas, isTemplateCanvasDataLoaded])

  // Hilfsfunktionen
  const getValuesByDynamicType = (dynamicType: string): DynamicLayerValue[] => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) {
      return []
    }
    return extractValuesByDynamicType(fabricCanvas, dynamicType)
  }

  const getValuesByTextProperty = (textProperty: string): DynamicLayerValue[] => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) {
      return []
    }
    return extractValuesByTextProperty(fabricCanvas, textProperty)
  }

  const getValuesByColorProperty = (colorProperty: string): DynamicLayerValue[] => {
    if (!fabricCanvas || !isTemplateCanvasDataLoaded) {
      return []
    }
    return extractValuesByColorProperty(fabricCanvas, colorProperty)
  }

  // Canvas-Update-Funktionen
  const updateCanvasValue = useCallback((property: string, value: any) => {
    updateValue(property, value)
    // Hier würde die echte Canvas-Update-Logik implementiert werden
    if (fabricCanvas && isTemplateCanvasDataLoaded) {
      console.log(`Updating ${property} to ${value} in canvas`)
      // Implementierung der Canvas-Updates basierend auf property type
    }
  }, [fabricCanvas, isTemplateCanvasDataLoaded, updateValue])

  // Spezifische Layer-Typen
  const colorLayers = extractedValues?.colorLayers || []
  const textLayers = extractedValues?.textLayers || []
  const logoLayers = extractedValues?.logoLayers || []
  const staticLayers = extractedValues?.staticLayers || []

  // Abgeleitete Farbliste für Swatches (inkl. Custom Values)
  const usedColorSwatches = useMemo(() => {
    const swatches: { key: string; label: string; value: string }[] = []

    // Standardfarben aus dem Live-State
    if (currentValues.primaryColor) {
      swatches.push({ key: 'primary_color', label: 'Primär', value: currentValues.primaryColor })
    }
    if (currentValues.secondaryColor) {
      swatches.push({ key: 'secondary_color', label: 'Sekundär', value: currentValues.secondaryColor })
    }
    if (currentValues.tertiaryColor) {
      swatches.push({ key: 'tertiary_color', label: 'Tertiär', value: currentValues.tertiaryColor })
    }

    // Zusätzliche dynamische Farb-Layer aus dem Canvas (Custom Values)
    if (colorLayers && colorLayers.length > 0) {
      colorLayers.forEach((layer) => {
        const prop = layer.properties?.colorProperty || layer.dynamicType || layer.name
        const isStandard = prop === 'primary_color' || prop === 'secondary_color' || prop === 'tertiary_color'
        const value = typeof layer.currentValue === 'string' ? layer.currentValue : undefined
        if (!isStandard && value) {
          const label = layer.name || String(prop)
          swatches.push({ key: String(prop), label, value })
        }
      })
    }

    // Duplikate entfernen (gleiche key+value Kombination)
    const unique = new Map<string, { key: string; label: string; value: string }>()
    swatches.forEach((s) => {
      unique.set(`${s.key}|${s.value}`, s)
    })

    return Array.from(unique.values())
  }, [currentValues.primaryColor, currentValues.secondaryColor, currentValues.tertiaryColor, colorLayers])

  // Nur Custom-Farben (ohne Primär/Sekundär/Tertiär)
  const customColors = useMemo(() => {
    return usedColorSwatches.filter(
      (s) => s.key !== 'primary_color' && s.key !== 'secondary_color' && s.key !== 'tertiary_color'
    )
  }, [usedColorSwatches])

  return {
    // Canvas-Extraktion (bestehend)
    extractedValues,
    dynamicValues,
    summary,

    // Gruppierte Layer
    colorLayers,
    textLayers,
    logoLayers,
    staticLayers,

    // Live-Editing-Werte
    currentValues,
    updateValue: updateCanvasValue,
    resetValues,
    applyValuesToCanvas,

    // Hilfsfunktionen
    getValuesByDynamicType,
    getValuesByTextProperty,
    getValuesByColorProperty,

    // Farbübersichten
    usedColorSwatches,
    customColors,

    // Status
    isLoaded: isTemplateCanvasDataLoaded,
    hasCanvas: !!fabricCanvas,
  }
}

export default useDynamicValues
