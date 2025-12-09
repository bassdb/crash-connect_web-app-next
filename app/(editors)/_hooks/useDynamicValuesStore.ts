import { create } from 'zustand'
import { TeamColor } from '@/types/design-template'

// ===== TYPES =====

export interface DynamicValues {
  // User values
  name: string
  jerseyNumber: number
  additionalText: string

  // User colors (separate from team colors)
  userPrimaryColor: string
  userSecondaryColor: string
  userTertiaryColor: string

  // Team values
  teamName: string
  selectedTeamId: string | null
  teamLogoUrl: string | null

  // Team colors (separate from user colors)
  teamPrimaryColor: string
  teamSecondaryColor: string
  teamTertiaryColor: string
}

interface DynamicValuesStoreState {
  // Saved values (from server/database)
  savedValues: DynamicValues

  // Preview values (temporary, not yet applied)
  previewValues: DynamicValues

  // Flags
  isDirty: boolean // true when previewValues !== savedValues
  isLoading: boolean
  isSaving: boolean // true when saving to database

  // Individual Preview Setters (12 functions)
  setPreviewName: (value: string) => void
  setPreviewJerseyNumber: (value: number) => void
  setPreviewAdditionalText: (value: string) => void
  setPreviewUserPrimaryColor: (value: string) => void
  setPreviewUserSecondaryColor: (value: string) => void
  setPreviewUserTertiaryColor: (value: string) => void
  setPreviewTeamName: (value: string) => void
  setPreviewSelectedTeamId: (value: string | null) => void
  setPreviewTeamLogoUrl: (value: string | null) => void
  setPreviewTeamPrimaryColor: (value: string) => void
  setPreviewTeamSecondaryColor: (value: string) => void
  setPreviewTeamTertiaryColor: (value: string) => void

  // Internal Global Actions (used by action files)
  _applyPreviewValues: () => void
  _discardPreviewValues: () => void
  _loadSavedValues: (values: Partial<DynamicValues>) => void
  // Template-Farben in saved & preview laden (aus design_templates.color_defaults)
  loadTemplateColorDefaults: (defaults: { primary: string; secondary: string; tertiary: string }) => void
  // Hilfsfunktionen zum Anwenden von Farbgruppen
  applySavedColorsToPreview: () => void
  applyColorsToPreview: (colors: { primary: string; secondary: string; tertiary: string }) => void
  _loadFromExampleTeam: (
    teamId: string,
    teamName: string,
    teamLogoUrl: string | null,
    colors: TeamColor[]
  ) => void
  _resetToDefaults: () => void
  _setIsLoading: (isLoading: boolean) => void
  _setIsSaving: (isSaving: boolean) => void
}

// ===== DEFAULTS =====

export const DEFAULT_VALUES: DynamicValues = {
  // User values
  name: 'Your Name',
  jerseyNumber: 10,
  additionalText: 'Additional Text',

  // User colors
  userPrimaryColor: '#000000',
  userSecondaryColor: '#FFFFFF',
  userTertiaryColor: '#808080',

  // Team values
  teamName: 'Team Name',
  selectedTeamId: null,
  teamLogoUrl: null,

  // Team colors
  teamPrimaryColor: '#FF0000',
  teamSecondaryColor: '#0000FF',
  teamTertiaryColor: '#FFFF00',
}

// ===== HELPER FUNCTIONS =====

export function isEqual(a: DynamicValues, b: DynamicValues): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ===== STORE =====

const useDynamicValuesStore = create<DynamicValuesStoreState>((set, get) => ({
  // Initial state
  savedValues: { ...DEFAULT_VALUES },
  previewValues: { ...DEFAULT_VALUES },
  isDirty: false,
  isLoading: false,
  isSaving: false,

  // Individual Preview Setters
  setPreviewName: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, name: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewJerseyNumber: (value: number) => {
    set((state) => {
      const newPreview = { ...state.previewValues, jerseyNumber: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewAdditionalText: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, additionalText: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewUserPrimaryColor: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, userPrimaryColor: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewUserSecondaryColor: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, userSecondaryColor: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewUserTertiaryColor: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, userTertiaryColor: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewTeamName: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, teamName: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewSelectedTeamId: (value: string | null) => {
    set((state) => {
      const newPreview = { ...state.previewValues, selectedTeamId: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewTeamLogoUrl: (value: string | null) => {
    set((state) => {
      const newPreview = { ...state.previewValues, teamLogoUrl: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewTeamPrimaryColor: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, teamPrimaryColor: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewTeamSecondaryColor: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, teamSecondaryColor: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  setPreviewTeamTertiaryColor: (value: string) => {
    set((state) => {
      const newPreview = { ...state.previewValues, teamTertiaryColor: value }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  // Internal Global Actions (called by action files in _canvas-functions/dynamic-values)
  _applyPreviewValues: () => {
    set((state) => ({
      savedValues: { ...state.previewValues },
      isDirty: false,
    }))
  },

  _discardPreviewValues: () => {
    set((state) => ({
      previewValues: { ...state.savedValues },
      isDirty: false,
    }))
  },

  _loadSavedValues: (values: Partial<DynamicValues>) => {
    set(() => {
      const mergedValues = { ...DEFAULT_VALUES, ...values }
      return {
        savedValues: mergedValues,
        previewValues: mergedValues,
        isDirty: false,
      }
    })
  },

  // Template-Defaults in saved & preview übernehmen
  loadTemplateColorDefaults: (defaults: { primary: string; secondary: string; tertiary: string }) => {
    set((state) => {
      const mergedSaved = {
        ...state.savedValues,
        userPrimaryColor: defaults.primary,
        userSecondaryColor: defaults.secondary,
        userTertiaryColor: defaults.tertiary,
      }
      return {
        savedValues: mergedSaved,
        previewValues: { ...mergedSaved },
        isDirty: false,
      }
    })
  },

  // Gespeicherte Farben in die Vorschau anwenden
  applySavedColorsToPreview: () => {
    set((state) => {
      const newPreview = {
        ...state.previewValues,
        userPrimaryColor: state.savedValues.userPrimaryColor,
        userSecondaryColor: state.savedValues.userSecondaryColor,
        userTertiaryColor: state.savedValues.userTertiaryColor,
      }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  // Beliebige Farbgruppe anwenden (z. B. User-Prefs, Teamfarben)
  applyColorsToPreview: (colors: { primary: string; secondary: string; tertiary: string }) => {
    set((state) => {
      const newPreview = {
        ...state.previewValues,
        userPrimaryColor: colors.primary,
        userSecondaryColor: colors.secondary,
        userTertiaryColor: colors.tertiary,
      }
      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  _loadFromExampleTeam: (
    teamId: string,
    teamName: string,
    teamLogoUrl: string | null,
    colors: TeamColor[]
  ) => {
    set((state) => {
      // Start with current preview values
      const newPreview = { ...state.previewValues }

      // Update team values
      newPreview.selectedTeamId = teamId
      newPreview.teamName = teamName
      newPreview.teamLogoUrl = teamLogoUrl

      // Color mapping from TeamColor array
      const colorMap: Record<string, keyof DynamicValues> = {
        primary: 'teamPrimaryColor',
        secondary: 'teamSecondaryColor',
        accent: 'teamTertiaryColor',
        tertiary: 'teamTertiaryColor',
      }

      // Map colors to preview values
      colors.forEach((color) => {
        const key = colorMap[color.name]
        if (key && key in newPreview) {
          ;(newPreview as any)[key] = color.value
        }
      })

      return {
        previewValues: newPreview,
        isDirty: !isEqual(newPreview, state.savedValues),
      }
    })
  },

  _resetToDefaults: () => {
    set((state) => ({
      previewValues: { ...DEFAULT_VALUES },
      isDirty: !isEqual(DEFAULT_VALUES, state.savedValues),
    }))
  },

  _setIsLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  _setIsSaving: (isSaving: boolean) => {
    set({ isSaving })
  },
}))

export default useDynamicValuesStore

