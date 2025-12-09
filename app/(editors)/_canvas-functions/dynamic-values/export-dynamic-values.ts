// Utility-Funktionen zum Exportieren dynamischer Layer-Werte
import type { DynamicLayerValue, ExtractedDynamicValues } from './extract-dynamic-values'

/**
 * Exportiert dynamische Werte als CSV-Format
 * @param values - Die extrahierten dynamischen Werte
 * @returns CSV-String
 */
export const exportToCSV = (values: ExtractedDynamicValues): string => {
  const headers = [
    'ID',
    'Name',
    'Type',
    'Dynamic Type',
    'Current Value',
    'Color Property',
    'Text Property',
    'Team ID',
    'Replaceable',
    'Visible',
    'Z-Index',
    'Position X',
    'Position Y',
    'Width',
    'Height',
  ]

  const rows = values.allLayers.map((layer) => [
    layer.id,
    layer.name,
    layer.type,
    layer.dynamicType || '',
    layer.currentValue || '',
    layer.properties?.colorProperty || '',
    layer.properties?.textProperty || '',
    layer.properties?.teamId || '',
    layer.properties?.replaceable ? 'Ja' : 'Nein',
    layer.visible ? 'Ja' : 'Nein',
    layer.zIndex,
    layer.position?.left || 0,
    layer.position?.top || 0,
    layer.position?.width || '',
    layer.position?.height || '',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return csvContent
}

/**
 * Exportiert dynamische Werte als Markdown-Tabelle
 * @param values - Die extrahierten dynamischen Werte
 * @returns Markdown-String
 */
export const exportToMarkdown = (values: ExtractedDynamicValues): string => {
  let markdown = '# Dynamische Layer-Werte\n\n'

  // Zusammenfassung
  markdown += '## Zusammenfassung\n\n'
  markdown += `- **Gesamt Layer:** ${values.allLayers.length}\n`
  markdown += `- **Dynamische Layer:** ${values.allLayers.filter((l) => l.type === 'dynamic').length}\n`
  markdown += `- **Statische Layer:** ${values.staticLayers.length}\n`
  markdown += `- **Farb-Layer:** ${values.colorLayers.length}\n`
  markdown += `- **Text-Layer:** ${values.textLayers.length}\n`
  markdown += `- **Logo-Layer:** ${values.logoLayers.length}\n\n`

  // Farb-Layer
  if (values.colorLayers.length > 0) {
    markdown += '## Farb-Layer\n\n'
    markdown += '| Name | Property | Aktueller Wert | Sichtbar |\n'
    markdown += '|------|----------|----------------|----------|\n'
    values.colorLayers.forEach((layer) => {
      markdown += `| ${layer.name} | ${layer.properties?.colorProperty || ''} | ${layer.currentValue || ''} | ${layer.visible ? 'Ja' : 'Nein'} |\n`
    })
    markdown += '\n'
  }

  // Text-Layer
  if (values.textLayers.length > 0) {
    markdown += '## Text-Layer\n\n'
    markdown += '| Name | Property | Aktueller Wert | Sichtbar |\n'
    markdown += '|------|----------|----------------|----------|\n'
    values.textLayers.forEach((layer) => {
      markdown += `| ${layer.name} | ${layer.properties?.textProperty || ''} | ${layer.currentValue || ''} | ${layer.visible ? 'Ja' : 'Nein'} |\n`
    })
    markdown += '\n'
  }

  // Logo-Layer
  if (values.logoLayers.length > 0) {
    markdown += '## Logo-Layer\n\n'
    markdown += '| Name | Aktueller Wert | Sichtbar |\n'
    markdown += '|------|----------------|----------|\n'
    values.logoLayers.forEach((layer) => {
      markdown += `| ${layer.name} | ${layer.currentValue || ''} | ${layer.visible ? 'Ja' : 'Nein'} |\n`
    })
    markdown += '\n'
  }

  return markdown
}

/**
 * Exportiert dynamische Werte als einfache Textliste
 * @param values - Die extrahierten dynamischen Werte
 * @returns Text-String
 */
export const exportToText = (values: ExtractedDynamicValues): string => {
  let text = 'DYNAMISCHE LAYER-WERTE\n'
  text += '='.repeat(50) + '\n\n'

  // Zusammenfassung
  text += 'ZUSAMMENFASSUNG:\n'
  text += `- Gesamt Layer: ${values.allLayers.length}\n`
  text += `- Dynamische Layer: ${values.allLayers.filter((l) => l.type === 'dynamic').length}\n`
  text += `- Statische Layer: ${values.staticLayers.length}\n`
  text += `- Farb-Layer: ${values.colorLayers.length}\n`
  text += `- Text-Layer: ${values.textLayers.length}\n`
  text += `- Logo-Layer: ${values.logoLayers.length}\n\n`

  // Alle Layer
  text += 'ALLE LAYER:\n'
  text += '-'.repeat(30) + '\n'
  values.allLayers.forEach((layer, index) => {
    text += `${index + 1}. ${layer.name} (${layer.type})\n`
    text += `   ID: ${layer.id}\n`
    if (layer.dynamicType) {
      text += `   Dynamischer Typ: ${layer.dynamicType}\n`
    }
    if (layer.currentValue !== undefined) {
      text += `   Aktueller Wert: ${layer.currentValue}\n`
    }
    if (layer.properties?.colorProperty) {
      text += `   Farb-Property: ${layer.properties.colorProperty}\n`
    }
    if (layer.properties?.textProperty) {
      text += `   Text-Property: ${layer.properties.textProperty}\n`
    }
    text += `   Sichtbar: ${layer.visible ? 'Ja' : 'Nein'}\n`
    text += `   Z-Index: ${layer.zIndex}\n`
    if (layer.position) {
      text += `   Position: ${layer.position.left}, ${layer.position.top}\n`
    }
    text += '\n'
  })

  return text
}

/**
 * Exportiert nur die aktuellen Werte als einfaches Objekt
 * @param values - Die extrahierten dynamischen Werte
 * @returns Objekt mit aktuellen Werten
 */
export const exportCurrentValues = (values: ExtractedDynamicValues): Record<string, any> => {
  const result: Record<string, any> = {}

  // Farb-Werte
  values.colorLayers.forEach((layer) => {
    if (layer.properties?.colorProperty && layer.currentValue !== undefined) {
      result[layer.properties.colorProperty] = layer.currentValue
    }
  })

  // Text-Werte
  values.textLayers.forEach((layer) => {
    if (layer.properties?.textProperty && layer.currentValue !== undefined) {
      result[layer.properties.textProperty] = layer.currentValue
    }
  })

  // Logo-Werte
  values.logoLayers.forEach((layer) => {
    if (layer.currentValue !== undefined) {
      result.teamLogo = layer.currentValue
    }
  })

  return result
}

/**
 * Erstellt einen Download-Link für die exportierten Daten
 * @param data - Die zu exportierenden Daten
 * @param filename - Der Dateiname
 * @param mimeType - Der MIME-Typ
 * @returns Download-URL
 */
export const createDownloadLink = (
  data: string,
  filename: string,
  mimeType: string = 'text/plain'
): string => {
  const blob = new Blob([data], { type: mimeType })
  return URL.createObjectURL(blob)
}

/**
 * Lädt eine Datei herunter
 * @param data - Die zu exportierenden Daten
 * @param filename - Der Dateiname
 * @param mimeType - Der MIME-Typ
 */
export const downloadFile = (
  data: string,
  filename: string,
  mimeType: string = 'text/plain'
): void => {
  const url = createDownloadLink(data, filename, mimeType)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
