import * as fabric from 'fabric'
import { findDynamicLayers } from './find-layers'

/**
 * Updates ALL team logo layers on the canvas with a new logo image
 * @param fabricCanvas - The Fabric.js canvas instance
 * @param newLogoUrl - URL of the new team logo image
 *
 * This function finds all objects with dynamicLayerType === 'team_logo' and updates them
 * with the new logo while preserving their position, scale, and rotation. It updates
 * ALL matching team logo layers, not just a single instance.
 *
 * The dynamicLayerType custom property ensures these layers can be identified after canvas save/load cycles.
 */
export const updateTeamLogo = async (fabricCanvas: fabric.Canvas, newLogoUrl: string) => {
  // Guard against concurrent executions that could duplicate images
  const canvasAny = fabricCanvas as unknown as { __isUpdatingTeamLogo?: boolean }
  if (canvasAny.__isUpdatingTeamLogo) {
    console.warn('updateTeamLogo skipped: update already in progress')
    return
  }

  canvasAny.__isUpdatingTeamLogo = true
  try {
    const logoLayers = findDynamicLayers(fabricCanvas, 'team_logo')
    console.log(`Found ${logoLayers.length} team logo layers to update`)

    for (const layer of logoLayers) {
    try {
      // Load new image
      const loadImage = () => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const imageElement = document.createElement('img')
          imageElement.onload = () => resolve(imageElement)
          imageElement.onerror = (err) => reject(err)
          imageElement.src = newLogoUrl
          imageElement.crossOrigin = 'anonymous'
        })
      }

      const imageElement = await loadImage()

      // Store the position and properties of the existing layer
      const existingProperties = {
        left: layer.left,
        top: layer.top,
        scaleX: layer.scaleX,
        scaleY: layer.scaleY,
        angle: layer.angle,
        width: layer.width,
        height: layer.height,
      }

      // Remove the old layer
      fabricCanvas.remove(layer)

      // Calculate the scale needed to maintain the same visual size
      const targetWidth = existingProperties.width * existingProperties.scaleX
      const targetHeight = existingProperties.height * existingProperties.scaleY

      const newScaleX = targetWidth / imageElement.width
      const newScaleY = targetHeight / imageElement.height

      // Create new image with the same visual size and position
      const newTeamLogoImage = new fabric.FabricImage(imageElement, {
        left: existingProperties.left,
        top: existingProperties.top,
        scaleX: newScaleX,
        scaleY: newScaleY,
        angle: existingProperties.angle,
        dynamicLayerType: 'team_logo',
        name: 'Team Logo',
      })

      // Add the new layer
      fabricCanvas.add(newTeamLogoImage)

      // Log properties for verification
      console.log('Team logo updated:', {
        dynamicLayerType: newTeamLogoImage.dynamicLayerType,
        name: newTeamLogoImage.name
      })

      fabricCanvas.renderAll()
    } catch (error) {
      console.error('Error updating team logo:', error)
    }
  }
  } finally {
    canvasAny.__isUpdatingTeamLogo = false
  }
}

/**
 * Updates ALL team name text layers on the canvas with a new team name
 * Mirrors the structure of updateTeamLogo for consistency.
 */
export const updateTeamName = async (
  fabricCanvas: fabric.Canvas,
  newTeamName: string
) => {
  const canvasAny = fabricCanvas as unknown as { __isUpdatingTeamName?: boolean }
  if (canvasAny.__isUpdatingTeamName) {
    console.warn('updateTeamName skipped: update already in progress')
    return
  }

  canvasAny.__isUpdatingTeamName = true
  try {
    // Semantische Identifikation: direkt über dynamicLayerType 'team_name'
    const teamNameLayers = findDynamicLayers(fabricCanvas, 'team_name') as any[]

    console.log(`Found ${teamNameLayers.length} team_name text layers to update`)

    teamNameLayers.forEach((layer: any) => {
      if (typeof layer.set === 'function') {
        layer.set('text', newTeamName)
      }
    })

    fabricCanvas.renderAll()
  } catch (error) {
    console.error('Error updating team name:', error)
  } finally {
    canvasAny.__isUpdatingTeamName = false
  }
}

/**
 * Updates ALL color layers of a specific type with a new color
 * @param fabricCanvas - The Fabric.js canvas instance
 * @param colorType - The type of color layer to update (e.g., 'primary_color', 'secondary_color')
 * @param newColor - The new color value (hex, rgb, etc.)
 *
 * This function finds all objects with matching dynamicLayerType and updates their fill color.
 * It updates ALL matching color layers of the specified type, not just a single instance.
 *
 * The dynamicLayerType custom property ensures these layers can be identified after canvas save/load cycles.
 */
export const updateColorLayers = (
  fabricCanvas: fabric.Canvas,
  colorType: string,
  newColor: string
) => {
  const colorLayers = findDynamicLayers(fabricCanvas, colorType)
  console.log(`Found ${colorLayers.length} ${colorType} layers to update with color: ${newColor}`)

  colorLayers.forEach((layer) => {
    if (layer.set) {
      layer.set('fill', newColor)
    }
  })

  fabricCanvas.renderAll()
}

/**
 * Updates ALL text layers with a specific text property with new text content
 * @param fabricCanvas - The Fabric.js canvas instance
 * @param textProperty - The text property to match (e.g., 'name', 'jersey_number', 'team_name')
 * @param newText - The new text content to set
 *
 * This function finds all text objects with dynamicLayerType === 'text' and matching
 * textProperty custom property, then updates their text content. It updates ALL matching text layers
 * of the specified property, not just a single instance.
 *
 * The dynamicLayerType and textProperty custom properties ensure these layers can be identified after canvas save/load cycles.
 */
export const updateTextLayers = (
  fabricCanvas: fabric.Canvas,
  textProperty: string,
  newText: string
) => {
  // Semantisch: Wenn textProperty ein bekannter Typ ist, direkt über den Typ finden
  const knownSemantic: Record<string, string> = {
    team_name: 'team_name',
    jersey_number: 'jersey_number',
    additional_text: 'additional_text',
    user_first_name: 'user_first_name',
    user_last_name: 'user_last_name',
    name: 'text',
  }

  const targetType = knownSemantic[textProperty] || 'text'
  const textLayers = findDynamicLayers(fabricCanvas, targetType)
  console.log(`Found ${textLayers.length} ${targetType} layers for property: ${textProperty}`)

  textLayers.forEach((layer: any) => {
    // Check if this layer has the matching textProperty
    const isTargetProperty = layer.textProperty === textProperty
    const canSetText = typeof layer.set === 'function'
    
    if (!isTargetProperty || !canSetText) return

    console.log(
      `Updating text layer with property ${textProperty} from "${layer.text}" to "${newText}"`
    )
    layer.set('text', newText)
  })

  fabricCanvas.renderAll()
}


