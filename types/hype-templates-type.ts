import { z } from 'zod'

export const hypeTemplateSchema = z.object({
  category: z.string().optional(),
  name: z.string().optional(),
  preview_image_url: z.string().optional(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user_id: z.string().optional(),
  canvas_data: z.string().optional(),
  creator: z.string().optional(),
})
