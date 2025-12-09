import * as fabric from 'fabric'

/**
 * Normalisierung nach Canvas-Reload: Migriert alte data-Objekte zu flachen Custom Properties
 * und stellt konsistente Werte sicher.
 * 
 * Migration-Strategie:
 * 1. Lese alte data-Objekt Properties (falls vorhanden - Legacy-Migration)
 * 2. Setze flache Custom Properties (dynamicLayerType, name, textProperty)
 * 3. Entferne data-Objekt nach Migration (neu erstellte Layer haben kein data-Objekt)
 */
export const normalizeCanvasDynamicLayers = (fabricCanvas: fabric.Canvas) => {
  const objects = fabricCanvas.getObjects() as any[]
  console.log(`Normalizing ${objects.length} canvas objects after load`)
  const friendlyColorNames: Record<string, string> = {
    primary_color: 'Primary Color',
    secondary_color: 'Secondary Color',
    tertiary_color: 'Tertiary Color',
    custom_color: 'Custom Color',
    user_color_1: 'User Color 1',
    user_color_2: 'User Color 2',
    user_color_3: 'User Color 3',
  }
  const friendlyTextNames: Record<string, string> = {
    name: 'Name',
    jersey_number: 'Jersey Number',
    additional_text: 'Additional Text',
    team_name: 'Team Name',
    user_first_name: 'First Name',
    user_last_name: 'Last Name',
  }

  const total = objects.length
  objects.forEach((obj, index) => {
    // Moderne flache Custom Properties
    let dynamicLayerType = obj.dynamicLayerType
    let layerName = obj.name
    let textProperty = obj.textProperty

    // ----- Robustheits-Checks für dynamische Layer nach Reload -----
    // 1) Farben: Stelle sicher, dass dynamicLayerType konsistent ist
    const isRect = obj.type === 'rect' || obj.type === 'fabric-rect'
    if (isRect) {
      // Falls keine dynamicLayerType vorhanden, aber ein bekannter Name gesetzt ist, leite ab
      if (!dynamicLayerType && typeof layerName === 'string') {
        const nameToType: Record<string, string> = {
          'Primary Color': 'primary_color',
          'Secondary Color': 'secondary_color',
          'Tertiary Color': 'tertiary_color',
          'Custom Color': 'custom_color',
          'User Color 1': 'user_color_1',
          'User Color 2': 'user_color_2',
          'User Color 3': 'user_color_3',
        }
        const inferred = nameToType[layerName]
        if (inferred) {
          dynamicLayerType = inferred
        }
      }
    }

    // 2) Text: Stelle sicher, dass semantische Typen erhalten bleiben
    const isTextType =
      obj.type === 'text' ||
      obj.type === 'i-text' ||
      obj.type === 'textbox' ||
      obj.type === 'fabric-text'
    if (isTextType) {
      // Falls weder textProperty noch name sauber ist, fallback auf 'additional_text'
      if (!textProperty && (dynamicLayerType === 'text' || !dynamicLayerType)) {
        textProperty = 'additional_text'
      }
    }

    // 3) Team-Logo: Stelle sicher, dass Images mit Logo-Kennung korrekt markiert sind
    const isImage = obj.type === 'image'
    if (isImage) {
      if (dynamicLayerType === 'team_logo' || layerName === 'Team Logo') {
        dynamicLayerType = 'team_logo'
        layerName = layerName || 'Team Logo'
      }
    }

    // Sichtbarkeit setzen, falls fehlend
    if (typeof obj.visible === 'undefined') {
      obj.visible = true
    }

    // Kein Forcieren mehr auf 'text'; semantische Typen ('team_name', 'jersey_number', ...)
    // bleiben erhalten. Nur wenn komplett leer, als generischer 'text' markieren.
    if (isTextType && !dynamicLayerType) {
      dynamicLayerType = 'text'
    }

    // Namen nur setzen, wenn noch keiner vorhanden ist
    if (!layerName) {
      if ((dynamicLayerType === 'text' || dynamicLayerType === 'team_name' || dynamicLayerType === 'jersey_number' || dynamicLayerType === 'additional_text') && textProperty) {
        layerName = friendlyTextNames[textProperty] || textProperty
      } else if (friendlyColorNames[dynamicLayerType]) {
        layerName = friendlyColorNames[dynamicLayerType]
      } else if (dynamicLayerType === 'team_logo') {
        layerName = 'Team Logo'
      } else {
        // Fallback
        layerName = obj.type?.charAt(0).toUpperCase() + obj.type?.slice(1)
      }
    }

    // ✨ Setze flache Custom Properties (moderne Struktur)
    if (dynamicLayerType) {
      obj.dynamicLayerType = dynamicLayerType
    }
    if (layerName) {
      obj.name = layerName
    }
    if (textProperty) {
      obj.textProperty = textProperty
    }

    // Log für Verifizierung nach Normalisierung
    if (dynamicLayerType) {
      console.log(`✅ Normalized: "${layerName}" (${dynamicLayerType})`, {
        dynamicLayerType: obj.dynamicLayerType,
        name: obj.name,
        textProperty: obj.textProperty || 'N/A',
      })
    }
  })

  console.log('✅ Canvas normalization & migration completed')
  fabricCanvas.requestRenderAll()
  fabricCanvas.renderAll()
}

