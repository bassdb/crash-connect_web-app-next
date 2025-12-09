import * as fabric from 'fabric'

// Erweitere Fabric.js mit Custom Properties gemäß offizieller Dokumentation
declare module 'fabric' {
  // Properties auf der Instanz und im Konstruktor erkennbar machen
  interface FabricObject {
    dynamicLayerType?:
      | 'team_logo'
      | 'primary_color'
      | 'secondary_color'
      | 'tertiary_color'
      | 'custom_color'
      | 'user_color_1'
      | 'user_color_2'
      | 'user_color_3'
      | 'text'
      | 'jersey_number'
      | 'additional_text'
      | 'team_name'
      | 'user_first_name'
      | 'user_last_name'
    name?: string
  }

  // Properties im serialisierten Objekt typisieren
  interface SerializedObjectProps {
    dynamicLayerType?: string
    name?: string
  }
}

// Legacy-Interface für Rückwärtskompatibilität mit bestehendem Code
// TODO: Mittelfristig auf fabric.FabricObject umstellen
export interface FabricObjectWithData extends fabric.Object {
  data?: {
    id?: string
    zIndex?: number
    name?: string
    type?: 'static' | 'dynamic'
    dynamicType?:
      | 'team_logo'
      | 'primary_color'
      | 'secondary_color'
      | 'tertiary_color'
      | 'custom_color'
      | 'user_color_1'
      | 'user_color_2'
      | 'user_color_3'
      | 'text'
      | 'jersey_number'
      | 'additional_text'
      | 'team_name'
      | 'user_first_name'
      | 'user_last_name'
    replaceable?: boolean
    teamId?: string
    colorProperty?: string
    textProperty?: string
  }
}

export type TeamLogoProps = {
  fabricCanvas: fabric.Canvas
  teamLogo?: string
}

