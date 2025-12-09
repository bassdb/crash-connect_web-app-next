import * as fabric from 'fabric'
import { normalizeCanvasDynamicLayers } from './normalization'

// Serialisierung: Custom Properties werden automatisch inkludiert (via FabricObject.customProperties)
export const serializeCanvasWithData = (fabricCanvas: fabric.Canvas): string => {
  if (!fabricCanvas) {
    console.warn('serializeCanvasWithData: No canvas provided')
    return '{}'
  }

  try {
    // Die customProperties (dynamicLayerType, name, textProperty) werden automatisch inkludiert
    // durch die globale Registrierung in canvas-setup.ts
    // Nur zusätzliche Properties müssen hier explizit angegeben werden
    const additionalProperties = [
      'selectable',
      'evented',
      'visible',
      'lockMovementX',
      'lockMovementY',
      'lockRotation',
      'lockScalingX',
      'lockScalingY',
    ]

    const canvasObject = (fabricCanvas as any).toJSON(additionalProperties)
    const jsonString = JSON.stringify(canvasObject, null, 0)

    console.log('Canvas successfully serialized', {
      objectCount: canvasObject?.objects?.length || 0,
      stringLength: jsonString.length,
    })

    return jsonString
  } catch (error) {
    console.error('Error serializing canvas with data:', error)

    // Fallback: Minimale Serialisierung (nur Custom Properties)
    try {
      const minimalCanvas = (fabricCanvas as any).toJSON()
      const fallbackString = JSON.stringify(minimalCanvas)

      console.warn('Using fallback serialization', {
        objectCount: minimalCanvas?.objects?.length || 0,
      })

      return fallbackString
    } catch (fallbackError) {
      console.error('Fallback serialization also failed:', fallbackError)
      return '{}'
    }
  }
}

// Laden: JSON anwenden und danach dynamische Layer normalisieren
export const loadCanvasFromSerializedJSON = async (
  fabricCanvas: fabric.Canvas,
  json: string | object
): Promise<void> => {
  if (!fabricCanvas || !json) return
  const jsonObj =
    typeof json === 'string'
      ? (() => {
          try {
            return JSON.parse(json)
          } catch (e) {
            console.error('Invalid canvas JSON provided:', e)
            return null
          }
        })()
      : json

  if (!jsonObj) return

  await new Promise<void>((resolve, reject) => {
    try {
      fabricCanvas.loadFromJSON(jsonObj as any, () => {
        try {
          normalizeCanvasDynamicLayers(fabricCanvas)
        } catch (normErr) {
          console.error('Error normalizing canvas after load:', normErr)
        }
        fabricCanvas.requestRenderAll()
        fabricCanvas.renderAll()
        resolve()
      })
    } catch (err) {
      console.error('Error loading canvas from JSON:', err)
      reject(err)
    }
  })
}

