import * as fabric from 'fabric'

export const addImageToCanvas = async ({
  fabricCanvas,
  url,
}: {
  fabricCanvas: fabric.Canvas
  url: string
}): Promise<fabric.Image | { error?: string }> => {
  if (!fabricCanvas || !url) return { error: 'Error placing image on canvas' }

  try {
    // Load image using a Promise
    const loadImage = () => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const imageElement = document.createElement('img')
        imageElement.onload = () => resolve(imageElement)
        imageElement.onerror = (err) => reject(err)
        imageElement.crossOrigin = 'anonymous'
        imageElement.src = url
      })
    }

    const imageElement = await loadImage()
    const fabricImage = new fabric.FabricImage(imageElement, {
      scaleX: 1,
      scaleY: 1,
    })

    fabricCanvas.add(fabricImage)
    fabricCanvas.setActiveObject(fabricImage)
    fabricCanvas.renderAll()

    return fabricImage
  } catch (error) {
    console.error('Error adding image to canvas:', error)
    return { error: 'Error adding image to canvas' }
  }
}

