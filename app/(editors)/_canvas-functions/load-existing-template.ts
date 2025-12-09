import { listFiles, getPublicUrl } from './upload-assets'
import useDesignTemplateStore from '../_hooks/useDesignTemplateStore'
import { loadCanvasFromSerializedJSON } from './layer-management'
import * as fabric from 'fabric'

export const loadExistingTemplate = async (hypeTemplateId: string) => {
  if (!hypeTemplateId) return
  console.log('hypeTemplateId received', hypeTemplateId)

  try {
    // Lade vorhandene Dateien aus dem Storage
    const path = `${hypeTemplateId}/assets`
    const files = await listFiles(path)

    if (files && files.length > 0) {
      // Erstelle URLs für alle gefundenen Dateien
      const urls = files.map((file) => getPublicUrl(`${path}/${file.name}`))

      // Aktualisiere den Store mit den vorhandenen Dateien
      const { setExistingFiles } = useDesignTemplateStore.getState()
      setExistingFiles(urls)

      console.log('Existing files loaded:', urls)
      return urls
    } else {
      console.log('No existing files found for template:', hypeTemplateId)
      // Setze leeres Array, falls keine Dateien vorhanden sind
      const { setExistingFiles } = useDesignTemplateStore.getState()
      setExistingFiles([])
      return []
    }
  } catch (error) {
    console.error('Error loading existing template files:', error)
    // Setze leeres Array bei Fehlern
    const { setExistingFiles } = useDesignTemplateStore.getState()
    setExistingFiles([])
    return []
  }
}

// Optionaler Loader, falls das Canvas-JSON (aus DB) geladen werden soll
export const applyCanvasJsonToCanvas = async (
  fabricCanvas: fabric.Canvas,
  canvasJson: string | object
) => {
  await loadCanvasFromSerializedJSON(fabricCanvas as any, canvasJson)
}
