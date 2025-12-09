// Types
export type { FabricObjectWithData, TeamLogoProps } from './types'

// Add layers
export { addTeamLogo } from './add-team-logo'
export { addTextLayerName } from './add-text-layer-name'
export { addImageToCanvas } from './add-image-to-canvas'
export { anyCanvasAction } from './any-canvas-action'

// Add dynamic layers
export { addDynamicColorLayer } from './add-dynamic-color-layer'
export {
  addDynamicTextLayer,
  addTeamNameLayer,
  addJerseyNumberLayer,
  addUserFirstNameLayer,
  addUserLastNameLayer,
} from './add-dynamic-text-layer'

// Find layers
export { findDynamicLayers } from './find-layers'

// Update dynamic layers
export { updateTeamLogo, updateTeamName, updateColorLayers, updateTextLayers } from './update-dynamic-layers'

// Apply team
export { applyTeamToCanvas } from './apply-team'

// Serialization
export { serializeCanvasWithData, loadCanvasFromSerializedJSON } from '../dynamic-values/serialization'

// Normalization
export { normalizeCanvasDynamicLayers } from '../dynamic-values/normalization'

// Layer order
export { updateCanvasLayerOrder } from './layer-order'

