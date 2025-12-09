import * as fabric from 'fabric'
import type { FabricObjectWithData } from './types'

/**
 * Finds all dynamic layers of a specific type on the canvas
 * @param fabricCanvas - The Fabric.js canvas instance
 * @param dynamicType - The type of dynamic layer to find (e.g., 'team_logo', 'text', 'primary_color')
 * @returns Array of Fabric objects that match the specified dynamic type
 *
 * This function searches through all canvas objects and returns those with matching
 * dynamicLayerType property. The dynamicLayerType custom property is automatically
 * serialized and persists through canvas save/load cycles.
 */
export const findDynamicLayers = (
  fabricCanvas: fabric.Canvas,
  dynamicType: string
): FabricObjectWithData[] => {
  return fabricCanvas
    .getObjects()
    .filter((obj: any) => obj.dynamicLayerType === dynamicType) as FabricObjectWithData[]
}

