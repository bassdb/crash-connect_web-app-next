import * as fabric from 'fabric'

// Neue Funktion zum Aktualisieren der Layer-Reihenfolge
export const updateCanvasLayerOrder = (fabricCanvas: fabric.Canvas, files: File[]) => {
  const objects = fabricCanvas.getObjects()

  // // Sortiere Objekte basierend auf der Dateireihenfolge
  // files.forEach((file, index) => {
  //   const obj = objects.find((o) => o.name === file.name)
  //   if (obj) {
  //     fabricCanvas.moveObjectTo(obj, index)
  //   }
  // })

  // fabricCanvas.renderAll()
}

