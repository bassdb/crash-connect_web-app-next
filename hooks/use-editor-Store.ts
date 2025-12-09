import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface EditorStore {
  canvasWidth: number
  canvasHeight: number
  template: string
  enableEffects: boolean
  jerseyNumber: number
  name?: string
  firstName?: string
  lastName?: string
  primaryColor?: string | undefined
  secondaryColor?: string | undefined
  tertiaryColor?: string | undefined
  isCanvasVisible: boolean

  setJerseyNumber: (jerseyNumber: number) => void
  setName: (name: string) => void
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setPrimaryColor: (primaryColor: string) => void
  setSecondaryColor: (secondaryColor: string) => void
  setTertiaryColor: (tertiaryColor: string) => void
  setCanvasWidth: (width: number) => void
  setCanvasHeight: (height: number) => void
  setTemplate: (template: string) => void
  setEnableEffects: (enableEffects: boolean) => void
  setCanvasVisible: (isVisible: boolean) => void
}

type EditorStorePersist = EditorStore & {
  _hasHydrated: boolean
}

const useEditorStore = create<EditorStorePersist>()(
  persist(
    (set) => ({
      canvasWidth: 1000,
      canvasHeight: 1000,
      template: 'basic',
      jerseyNumber: 0,
      name: 'Your Name',
      firstName: '',
      lastName: '',
      primaryColor: '',
      secondaryColor: '',
      tertiaryColor: '',
      isCanvasVisible: true,
      _hasHydrated: false,
      setTemplate: (template: string) => set({ template }),
      enableEffects: false,
      setEnableEffects: (enableEffects: boolean) => set({ enableEffects }),
      setCanvasWidth: (width: number) => set({ canvasWidth: width }),
      setCanvasHeight: (height: number) => set({ canvasHeight: height }),
      setJerseyNumber: (jerseyNumber: number) => set({ jerseyNumber }),
      setName: (name: string) => set({ name }),
      setFirstName: (firstName: string) => set({ firstName }),
      setLastName: (lastName: string) => set({ lastName }),
      setPrimaryColor: (primaryColor: string) => set({ primaryColor }),
      setSecondaryColor: (secondaryColor: string) => set({ secondaryColor }),
      setTertiaryColor: (tertiaryColor: string) => set({ tertiaryColor }),
      setCanvasVisible: (isVisible: boolean) => set({ isCanvasVisible: isVisible }),
    }),
    {
      name: 'hype-editor-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
        }
      },
    } as PersistOptions<EditorStorePersist, EditorStorePersist>
  )
)

export default useEditorStore
