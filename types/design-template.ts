// Zentrale TypeScript Types für Design Templates
import { z } from 'zod'

// ===== HAUPTINTERFACES =====

export interface DesignTemplate {
  id: string
  preview_image_url: string | null
  name: string
  category: string
  type?: string | null
  published: boolean
  created_at: string
  description?: string | null
  tags?: string | null
  canvas_data?: string | null
  creator?: string | null
  user_likes?: number | null
  user_rating?: number | null
  usage_counter?: number | null
  updated_at?: string | null
  user_id?: string | null
  status?:
    | 'draft'
    | 'approved'
    | 'published'
    | 'waiting_for_approval'
    | 'rejected'
    | 'archived'
    | null
  default_team_values?: string | null
  // Farb-Defaults und optionale Layer-Bindings, direkt aus der design_templates-Zeile
  color_defaults?: TemplateColorDefaults
  color_bindings?: TemplateColorBindings
}

// ===== SPEZIALISIERTE INTERFACES =====

// Für Listen-Ansichten (bessere Performance)
export interface DesignTemplateListItem {
  id: string
  preview_image_url: string | null
  name: string
  category: string
  published: boolean
  created_at: string
}

// Für Admin-Tabellen mit Status
export interface DesignTemplateRow extends DesignTemplate {
  // status wird von DesignTemplate geerbt, keine Überschreibung nötig
}

// Für Store/State Management
export interface DesignTemplateStoreData {
  id?: string
  name?: string
  description?: string
  category?: string
  tags?: string
  publish?: boolean
  preview_image_url?: string
  canvas_data?: string | null
  team_colors?: TeamColor[]
  selected_team_id?: string
  default_team_values?: string | null
  color_defaults?: TemplateColorDefaults
  color_bindings?: TemplateColorBindings
}

// Für Team-Farben
export interface TeamColor {
  name: string
  value: string
  label: string
}

// ===== TEMPLATE COLOR TYPES =====

export interface TemplateColorDefaults {
  primary: string
  secondary: string
  tertiary: string
}

export interface TemplateColorBindings {
  // Mappt Canvas-Layer-Tags auf Farb-Rollen
  // Beispiel: { "primary_color": "user.primary" }
  [layerTag: string]: string
}

// ===== ZOD SCHEMAS UND FORM TYPES =====

// Zod Schema für Template-Validierung
export const templateSchema = z.object({
  category: z.string().min(1, 'Kategorie ist erforderlich'),
  type: z.string().optional(),
  tags: z.string().optional(),
  description: z.string().min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein'),
})

// Type aus Schema ableiten (Single Source of Truth)
export type TemplateFormData = z.infer<typeof templateSchema>

// Für erweiterte Form-Daten (falls benötigt)
export interface DesignTemplateFormData {
  name: string
  description?: string
  category: string
  tags?: string
  published: boolean
  preview_image_url?: string
}

// ===== API RESPONSE TYPES =====

export interface DesignTemplateResponse {
  template: DesignTemplate
  success: boolean
  error?: string
}

export interface DesignTemplatesResponse {
  templates: DesignTemplate[]
  success: boolean
  error?: string
}
