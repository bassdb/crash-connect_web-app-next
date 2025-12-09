import { FabricObject } from 'fabric'

/**
 * Initialisiert Fabric.js Custom Properties für automatische Serialisierung
 * 
 * Diese Funktion MUSS einmalig VOR der ersten Canvas-Verwendung aufgerufen werden.
 * Sie registriert die Custom Properties global für alle FabricObject-Instanzen.
 * 
 * Gemäß Fabric.js Dokumentation werden diese Properties dann automatisch
 * bei toJSON() und toObject() mit serialisiert.
 * 
 * @see https://fabricjs.com/docs/
 */
export const initializeFabricCustomProperties = () => {
  // Registriere Custom Properties für automatische Serialisierung
  // Diese Properties werden dann bei jedem toJSON()/toObject() Aufruf inkludiert
  FabricObject.customProperties = ['dynamicLayerType', 'name', 'textProperty']

  console.log('✅ Fabric.js custom properties initialized:', FabricObject.customProperties)
}

