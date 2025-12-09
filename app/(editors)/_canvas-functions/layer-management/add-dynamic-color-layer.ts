import * as fabric from 'fabric'

export const addDynamicColorLayer = (
  fabricCanvas: fabric.Canvas,
  colorType:
    | 'primary_color'
    | 'secondary_color'
    | 'tertiary_color'
    | 'custom_color'
    | 'user_color_1'
    | 'user_color_2'
    | 'user_color_3',
  color: string,
  position: { left: number; top: number; width: number; height: number }
) => {
  const friendlyColorNames: Record<string, string> = {
    primary_color: 'Primary Color',
    secondary_color: 'Secondary Color',
    tertiary_color: 'Tertiary Color',
    user_color_1: 'User Color 1',
    user_color_2: 'User Color 2',
    user_color_3: 'User Color 3',
  }

  const colorLayer = new fabric.Rect({
    left: position.left,
    top: position.top,
    width: position.width,
    height: position.height,
    fill: color,
    // Custom Properties (automatically serialized)
    dynamicLayerType: colorType,
    name: friendlyColorNames[colorType] || colorType,
  } as any)

  fabricCanvas.add(colorLayer)
  fabricCanvas.renderAll()

  return colorLayer
}

