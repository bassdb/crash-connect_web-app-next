import { create } from 'zustand'
import { DesignTemplateStoreData } from '@/types/design-template'

// Alias für bessere Lesbarkeit
export type DesignTemplateData = DesignTemplateStoreData

interface DesignTemplateState {
  // Template-Metadaten (Core Responsibility)
  storeDesignTemplateId: string | null
  setStoreDesignTemplateId: (id: string | null) => void
  designTemplateData: DesignTemplateData | null // Full template data fetched from server
  setDesignTemplateData: (data: DesignTemplateData | null) => void
  existingFiles: string[] // URLs of files associated with this template in storage
  setExistingFiles: (files: string[]) => void
  previewImageUrl: string | null
  setPreviewImageUrl: (previewImageUrl: string | null) => void
  isPublished: boolean // Derived/controlled from designTemplateData.publish
  setIsPublished: (isPublished: boolean) => void
  designStatus: 'draft' | 'approved' | 'published' // Overall state of the template
  setDesignStatus: (designStatus: 'draft' | 'approved' | 'published') => void
}

const useDesignTemplateStore = create<DesignTemplateState>((set, get) => ({
  // Template-Metadaten
  storeDesignTemplateId: null,
  setStoreDesignTemplateId: (id) => set({ storeDesignTemplateId: id }),
  designTemplateData: null,
  setDesignTemplateData: (data) => {
    set({ designTemplateData: data })
    // Sync derived states from designTemplateData
    if (data) {
      set({
        isPublished: data.publish || false,
        previewImageUrl: data.preview_image_url || null,
      })
    }
  },
  existingFiles: [],
  setExistingFiles: (files) => set({ existingFiles: files }),
  previewImageUrl: null,
  setPreviewImageUrl: (previewImageUrl: string | null) => set({ previewImageUrl }),
  isPublished: false,
  setIsPublished: (isPublished: boolean) => set({ isPublished }),
  designStatus: 'draft',
  setDesignStatus: (designStatus: 'draft' | 'approved' | 'published') => set({ designStatus }),
}))

export default useDesignTemplateStore
