import * as fabric from 'fabric'
import { updateTeamName, updateColorLayers } from './update-dynamic-layers'

export const applyTeamToCanvas = (
  fabricCanvas: fabric.Canvas,
  teamName: string,
  teamColors: Array<{ name: string; value: string }>
) => {
  // Update team name layers
  // Use consistent helper for team name updates
  // Note: we call synchronously; updateTeamName does its own batching/render
  // and mirrors the logo update approach
  void updateTeamName(fabricCanvas, teamName)

  // Update color layers
  teamColors.forEach((color) => {
    if (color.name === 'primary') {
      updateColorLayers(fabricCanvas, 'primary_color', color.value)
    } else if (color.name === 'secondary') {
      updateColorLayers(fabricCanvas, 'secondary_color', color.value)
    } else if (color.name === 'accent') {
      updateColorLayers(fabricCanvas, 'tertiary_color', color.value)
    }
  })

  fabricCanvas.renderAll()
}

