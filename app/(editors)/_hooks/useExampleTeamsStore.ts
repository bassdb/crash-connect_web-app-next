import { create } from 'zustand'
import { TeamColor } from '@/types/design-template'

export interface ExampleTeam {
  id: string
  name: string
  description: string | null
  slug: string
  avatar_url: string | null
  team_logo_url?: string | null // Add this field for compatibility
  is_default: boolean
  status: 'active' | 'inactive' | 'archived'
  other_creators_can_use_example_team: boolean
  colors: TeamColor[]
  created_at: string
  updated_at: string
}

interface ExampleTeamsState {
  // Team-Verwaltung
  availableTeams: ExampleTeam[]
  savedExampleTeamValues: ExampleTeam | null // Values saved in database
  previewedExampleTeamValues: ExampleTeam | null // Temporarily selected for preview
  isLoading: boolean

  // UI-State
  isOverlayOpen: boolean

  // Basic Actions
  setAvailableTeams: (teams: ExampleTeam[]) => void
  setIsLoading: (isLoading: boolean) => void
  selectTeamForPreview: (team: ExampleTeam) => void
  clearPreviewedTeam: () => void
  openOverlay: () => void
  closeOverlay: () => void

  // Database team management
  loadSavedTeam: (savedTeamId: string | null) => void
  updateSavedTeam: (team: ExampleTeam) => void
}

const useExampleTeamsStore = create<ExampleTeamsState>((set, get) => ({
  availableTeams: [],
  savedExampleTeamValues: null,
  previewedExampleTeamValues: null,
  isLoading: false,
  isOverlayOpen: false,

  setAvailableTeams: (teams: ExampleTeam[]) => set({ availableTeams: teams }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  selectTeamForPreview: (team: ExampleTeam) => {
    set({ previewedExampleTeamValues: team, isOverlayOpen: false })
  },

  clearPreviewedTeam: () => {
    set({ previewedExampleTeamValues: null })
  },

  openOverlay: () => {
    set({ isOverlayOpen: true })
  },

  closeOverlay: () => {
    set({ isOverlayOpen: false })
  },

  // Database team management
  loadSavedTeam: (savedTeamId: string | null) => {
    const { availableTeams } = get()

    if (!savedTeamId || !availableTeams.length) {
      // If no saved team ID or no teams available, select a random default team
      const defaults = availableTeams.filter((team) => team.is_default)
      if (defaults.length > 0) {
        const randomTeam = defaults[Math.floor(Math.random() * defaults.length)]
        set({ savedExampleTeamValues: randomTeam })
      }
      return
    }

    // Find and select the saved team
    const savedTeam = availableTeams.find((team) => team.id === savedTeamId)
    if (savedTeam) {
      set({ savedExampleTeamValues: savedTeam })
    } else {
      // Fallback to random default team if specified team not found
      const defaults = availableTeams.filter((team) => team.is_default)
      if (defaults.length > 0) {
        const randomTeam = defaults[Math.floor(Math.random() * defaults.length)]
        set({ savedExampleTeamValues: randomTeam })
      }
    }
  },

  updateSavedTeam: (team: ExampleTeam) => {
    set({ savedExampleTeamValues: team })
  },
}))

export default useExampleTeamsStore
