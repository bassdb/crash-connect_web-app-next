import * as fabric from 'fabric'

export const addDynamicTextLayer = (
  fabricCanvas: fabric.Canvas,
  textProperty:
    | 'name'
    | 'jersey_number'
    | 'additional_text'
    | 'team_name'
    | 'user_first_name'
    | 'user_last_name',
  text: string,
  position: { left: number; top: number }
) => {
  const friendlyTextNames: Record<string, string> = {
    name: 'Name',
    jersey_number: 'Jersey Number',
    additional_text: 'Additional Text',
    team_name: 'Team Name',
    user_first_name: 'First Name',
    user_last_name: 'Last Name',
  }

  // Semantischer dynamicLayerType nach Modell B
  const semanticType = (
    (textProperty === 'team_name' && 'team_name') ||
    (textProperty === 'jersey_number' && 'jersey_number') ||
    (textProperty === 'additional_text' && 'additional_text') ||
    (textProperty === 'user_first_name' && 'user_first_name') ||
    (textProperty === 'user_last_name' && 'user_last_name') ||
    'text'
  ) as
    | 'team_name'
    | 'jersey_number'
    | 'additional_text'
    | 'user_first_name'
    | 'user_last_name'
    | 'text'

  const textLayer = new fabric.FabricText(text, {
    left: position.left,
    top: position.top,
    fontFamily: 'Roboto',
    fontSize: 40,
    // Custom Properties (automatically serialized)
    dynamicLayerType: semanticType,
    name: friendlyTextNames[textProperty] || textProperty,
    textProperty: textProperty,
  } as any)

  fabricCanvas.add(textLayer)
  fabricCanvas.renderAll()

  return textLayer
}

export const addTeamNameLayer = (
  fabricCanvas: fabric.Canvas,
  text: string,
  position: { left: number; top: number }
) => {
  return addDynamicTextLayer(fabricCanvas, 'team_name', text, position)
}

export const addJerseyNumberLayer = (
  fabricCanvas: fabric.Canvas,
  text: string,
  position: { left: number; top: number }
) => {
  return addDynamicTextLayer(fabricCanvas, 'jersey_number', text, position)
}

export const addUserFirstNameLayer = (
  fabricCanvas: fabric.Canvas,
  text: string,
  position: { left: number; top: number }
) => {
  return addDynamicTextLayer(fabricCanvas, 'user_first_name', text, position)
}

export const addUserLastNameLayer = (
  fabricCanvas: fabric.Canvas,
  text: string,
  position: { left: number; top: number }
) => {
  return addDynamicTextLayer(fabricCanvas, 'user_last_name', text, position)
}

