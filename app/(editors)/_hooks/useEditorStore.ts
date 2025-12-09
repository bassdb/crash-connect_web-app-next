import { create } from 'zustand'

interface EditorState {
  isRightSidebarOpen: boolean
  setIsRightSidebarOpen: (isOpen: boolean) => void
  isLeftSidebarOpen: boolean
  setIsLeftSidebarOpen: (isOpen: boolean) => void
  leftSidebarState: 'upload' | 'layers' | 'settings' | 'values' // Current active tab/state in left sidebar
  setLeftSidebarState: (state: 'upload' | 'layers' | 'settings' | 'values') => void
  scale: number // Zoom level of the editor canvas container
  setScale: (scale: number) => void
  isCanvasVisible: boolean // If the main canvas area is visible (might be redundant)
  setCanvasVisible: (isVisible: boolean) => void
  canPan: boolean // Whether panning mode is active
  setCanPan: (canPan: boolean) => void
}

const useEditorStore = create<EditorState>((set) => ({
  isRightSidebarOpen: true, // Default state based on your UI
  setIsRightSidebarOpen: (isOpen: boolean) => set({ isRightSidebarOpen: isOpen }),
  isLeftSidebarOpen: true, // Default state based on your UI
  setIsLeftSidebarOpen: (isOpen: boolean) => set({ isLeftSidebarOpen: isOpen }),
  leftSidebarState: 'upload', // Default tab
  setLeftSidebarState: (state: 'upload' | 'layers' | 'settings' | 'values') =>
    set({ leftSidebarState: state }),
  scale: 0.5, // Default zoom level
  setScale: (scale: number) => set({ scale }),
  isCanvasVisible: true,
  setCanvasVisible: (isVisible: boolean) => set({ isCanvasVisible: isVisible }),
  canPan: false,
  setCanPan: (canPan: boolean) => set({ canPan }),
}))

export default useEditorStore
