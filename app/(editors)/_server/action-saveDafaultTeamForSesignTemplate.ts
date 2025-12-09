"use server"
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'
import { createClient } from '@/server/supabase/server'

const setDefaultTeamSchema = z.object({
  designTemplateId: z.string(),
  teamId: z.string(),
})

export const saveDefaultTeamForTemplate = actionClient
  .schema(setDefaultTeamSchema)
  .action(async ({ parsedInput: { designTemplateId, teamId } }) => {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('design_templates')
        .update({ default_team_values: teamId })
        .eq('id', designTemplateId)

      if (error) {
        console.error('Error saving default team:', error)
        return {
          error: 'Fehler beim Speichern',
          message: error.message,
        }
      }

      console.log('Standard-Team erfolgreich gespeichert', teamId)
      return {
        success: 'Standard-Team erfolgreich gespeichert',
        message: 'Team-Auswahl wurde erfolgreich gespeichert',
        teamId,
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      return {
        error: 'Unerwarteter Serverfehler',
        message: 'Team-Auswahl konnte nicht gespeichert werden',
      }
    }
  })


  