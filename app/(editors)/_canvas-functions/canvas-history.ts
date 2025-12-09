import * as fabric from 'fabric'

declare module 'fabric' {
  interface Canvas {
    historyUndo: () => void
    historyRedo: () => void
  }
}

export function initCanvasHistory(canvas: fabric.Canvas) {
  const history: string[] = []
  let historyIndex = -1
  let isRedoing = false

  function saveState() {
    if (isRedoing) return

    // Remove any states after current index
    history.splice(historyIndex + 1)

    // Save current state
    history.push(JSON.stringify(canvas.toJSON(['data'])))
    historyIndex++
  }

  // Save initial state
  saveState()

  // Add history methods to canvas
  canvas.historyUndo = function () {
    if (historyIndex > 0) {
      historyIndex--
      isRedoing = true
      canvas.loadFromJSON(history[historyIndex], () => {
        canvas.renderAll()
        isRedoing = false
      })
    }
  }

  canvas.historyRedo = function () {
    if (historyIndex < history.length - 1) {
      historyIndex++
      isRedoing = true
      canvas.loadFromJSON(history[historyIndex], () => {
        canvas.renderAll()
        isRedoing = false
      })
    }
  }

  // Listen for object modifications
  canvas.on('object:modified', saveState)
  canvas.on('object:added', saveState)
  canvas.on('object:removed', saveState)

  return canvas
}
