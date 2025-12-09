// TypeScript types for design template categories and types

export interface DesignTemplateCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string // Hex color code
  icon?: string // Icon name/identifier
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DesignTemplateType {
  id: string
  name: string
  slug: string
  description?: string
  category_id?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DesignTemplateCategoryWithTypes extends DesignTemplateCategory {
  types?: DesignTemplateType[]
}

export interface CategoryTypeView {
  category_id: string
  category_name: string
  category_slug: string
  category_description?: string
  category_color?: string
  category_icon?: string
  category_active: boolean
  category_sort_order: number
  type_id?: string
  type_name?: string
  type_slug?: string
  type_description?: string
  type_active?: boolean
  type_sort_order?: number
}

// Form data types for creating/updating
export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  is_active?: boolean
}

export interface CreateTypeData {
  name: string
  description?: string
  category_id?: string
  sort_order?: number
}

export interface UpdateTypeData extends Partial<CreateTypeData> {
  is_active?: boolean
}

// API response types
export interface CategoriesResponse {
  categories: DesignTemplateCategory[]
  success: boolean
  error?: string
}

export interface TypesResponse {
  types: DesignTemplateType[]
  success: boolean
  error?: string
}

export interface CategoryTypesResponse {
  category: DesignTemplateCategory
  types: DesignTemplateType[]
  success: boolean
  error?: string
}

// Constants for predefined categories and design context types
export const PREDEFINED_CATEGORIES = [
  'Sports',
  'Gaming', 
  'Music',
  'Business',
  'Education',
  'Technology',
  'Fashion',
  'Food & Beverage',
  'Travel',
  'Health & Fitness',
  'Other'
] as const

// Design context types - these represent the purpose/context of the design
export const DESIGN_CONTEXT_TYPES = [
  'Matchday',
  'Hero',
  'Jersey Number',
  'Epic',
  'Poster',
  'Banner',
  'Logo',
  'Card',
  'Overlay',
  'Thumbnail',
  'Story',
  'Profile',
  'Cover',
  'Invitation',
  'Announcement',
  'Celebration',
  'Memorial',
  'Tribute',
  'Promotion',
  'Anniversary',
  'Seasonal',
  'Holiday',
  'Campaign',
  'Event',
  'Launch',
  'Update',
  'Milestone',
  'Achievement',
  'Victory',
  'Championship',
  'Tournament',
  'League',
  'Team',
  'Player',
  'Coach',
  'Fan',
  'Community',
  'Brand',
  'Product',
  'Service',
  'General'
] as const

// Legacy types for backward compatibility (now empty since we use context types)
export const PREDEFINED_TYPES = {} as const

export type CategorySlug = string
export type CategoryName = typeof PREDEFINED_CATEGORIES[number]
export type DesignContextType = typeof DESIGN_CONTEXT_TYPES[number]

// Helper type for design context type slugs
export type DesignContextSlug = 
  | 'matchday'
  | 'hero'
  | 'jersey-number'
  | 'epic'
  | 'poster'
  | 'banner'
  | 'logo'
  | 'card'
  | 'overlay'
  | 'thumbnail'
  | 'story'
  | 'profile'
  | 'cover'
  | 'invitation'
  | 'announcement'
  | 'celebration'
  | 'memorial'
  | 'tribute'
  | 'promotion'
  | 'anniversary'
  | 'seasonal'
  | 'holiday'
  | 'campaign'
  | 'event'
  | 'launch'
  | 'update'
  | 'milestone'
  | 'achievement'
  | 'victory'
  | 'championship'
  | 'tournament'
  | 'league'
  | 'team'
  | 'player'
  | 'coach'
  | 'fan'
  | 'community'
  | 'brand'
  | 'product'
  | 'service'
  | 'general'
