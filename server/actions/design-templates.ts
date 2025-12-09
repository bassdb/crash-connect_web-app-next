"use server"
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'
import { createClient } from '@/server/supabase/server'

const setDefaultTeamSchema = z.object({
  designTemplateId: z.string(),
  teamId: z.string(),
})

export const setDefaultTeamForTemplate = actionClient
  .schema(setDefaultTeamSchema)
  .action(async ({ parsedInput: { designTemplateId, teamId } }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from('design_templates')
      .update({ default_team_values: teamId })
      .eq('id', designTemplateId)

    if (error) {
      return { error: `Error ${error.message}` }
    }

    return { success: 'Updated default team' }
  })

const colorDefaultsSchema = z.object({
  designTemplateId: z.string(),
  colorDefaults: z.object({
    primary: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
    secondary: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
    tertiary: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  }),
})

export const updateTemplateColorDefaults = actionClient
  .schema(colorDefaultsSchema)
  .action(async ({ parsedInput: { designTemplateId, colorDefaults } }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from('design_templates')
      .update({ color_defaults: colorDefaults })
      .eq('id', designTemplateId)

    if (error) {
      return { error: `Error ${error.message}` }
    }

    return { success: 'Updated template color defaults' }
  })


