'use server'

import { createSuperClient } from '@/server/supabase/superadmin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface CreateExampleTeamInput {
  name: string
  description: string
  slug: string
  status: 'active' | 'inactive' | 'archived'
  is_default: boolean
  other_creators_can_use_example_team: boolean
}

export async function createExampleTeam(
  input: CreateExampleTeamInput
): Promise<{ success: boolean; teamId?: string; error?: string }> {
  try {
    const supabaseAdmin = await createSuperClient()

    // Check if slug already exists
    const { data: existingTeam } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('slug', input.slug)
      .single()

    if (existingTeam) {
      return { success: false, error: 'Ein Team mit diesem Slug existiert bereits' }
    }

    // Create team
    const { data: team, error: createError } = await supabaseAdmin
      .from('teams')
      .insert({
        name: input.name,
        description: input.description || null,
        slug: input.slug,
        status: input.status,
        is_default: input.is_default,
        other_creators_can_use_example_team: input.other_creators_can_use_example_team,
        team_logo_url: null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Team creation error:', createError)
      return { success: false, error: createError.message }
    }

    // Revalidate and redirect to edit page of the created team
    revalidatePath('/admin-dashboard/team-accounts')
    redirect(`/admin-dashboard/team-accounts/edit-example-team/${team.id}`)
  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}
