import * as fabric from 'fabric'

export const addTextLayerName = ({
  fabricCanvas,
  text,
}: {
  fabricCanvas: fabric.Canvas
  text: string
}) => {
  if (!fabricCanvas) return

  // Load Roboto font
  const loadFont = new Promise<void>((resolve) => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Wait for font to load
    document.fonts.ready.then(() => resolve())
  })

  loadFont.then(() => {
    const textLayer = new fabric.FabricText(text || 'Hello World', {
      left: 100,
      top: 100,
      fontFamily: 'Roboto',
      fontSize: 40,
      // Moderne flache Custom Properties (werden automatisch serialisiert)
      dynamicLayerType: 'text',
      textProperty: 'name',
      name: 'Name',
    })
    fabricCanvas.add(textLayer)
    fabricCanvas.renderAll()
  })
}

