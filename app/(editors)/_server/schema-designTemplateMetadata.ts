import { z } from 'zod'

export const designTemplateMetadataSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
  category: z.string().optional(),
  tags: z.string().optional(),
  description: z.string().optional(),
  designTemplateState: z.enum(['draft', 'approved', 'published']).default('draft'),
  preview_image_url: z.string().optional(),
})
