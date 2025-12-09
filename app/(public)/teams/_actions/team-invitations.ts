'use server'

import { createClient } from '@/server/supabase/server'
import { createSuperClient } from '@/server/supabase/superadmin'
import { revalidatePath } from 'next/cache'
import { actionClient } from '@/lib/safe-action'
import { sendTeamInvitation } from '@/lib/email-service'
import { inviteMemberSchema, acceptInvitationSchema } from './team-schemas'
import { z } from 'zod'

// Hilfsfunktion zur Formatierung des Einladernamens
function formatInviterName(fullName: string | null, username: string | null, email: string): string {
  if (fullName && fullName.trim()) {
    return `${fullName} (${email})`
  }
  if (username && username.trim()) {
    return `${username} (${email})`
  }
  return email
}

// Einladungsverwaltung
export const inviteTeamMember = actionClient
  .schema(inviteMemberSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Prüfen ob Benutzer Admin oder Owner ist
      const { checkTeamPermission } = await import('./team-permissions')
      const canInvite = await checkTeamPermission(parsedInput.team_id, ['owner', 'admin'])
      if (!canInvite) {
        return { error: 'Nur Team-Owner und Admins können Mitglieder einladen' }
      }

      const supabase = await createSuperClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { error: 'Nicht authentifiziert' }
      }

      // Prüfen ob Benutzer bereits Mitglied ist
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', parsedInput.team_id)
        .eq('user_id', user.id)
        .single()

      if (!existingMember) {
        return { error: 'Sie sind kein Mitglied dieses Teams' }
      }

      // Prüfen ob bereits eine Einladung für diese E-Mail existiert
      const { data: existingInvitation } = await supabase
        .from('team_invitations')
        .select('id, accepted_at')
        .eq('team_id', parsedInput.team_id)
        .eq('email', parsedInput.email)
        .is('accepted_at', null)
        .single()

      if (existingInvitation) {
        return { error: 'Es existiert bereits eine ausstehende Einladung für diese E-Mail-Adresse' }
      }

      // Token für Einladung generieren
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 Tage gültig

      const { data: invitation, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: parsedInput.team_id,
          email: parsedInput.email,
          role: parsedInput.role,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Database error creating invitation:', error)
        return { error: `Fehler beim Erstellen der Einladung: ${error.message}` }
      }

      // Team-Details abrufen für E-Mail
      const { data: team } = await supabase
        .from('teams')
        .select('name, slug, avatar_url')
        .eq('id', parsedInput.team_id)
        .single()

      if (!team) {
        return { error: 'Team nicht gefunden' }
      }

      // Profildaten des Einladers abrufen
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('full_name, username, email')
        .eq('id', user.id)
        .single()

      // Einladernamen formatieren
      const inviterName = formatInviterName(
        inviterProfile?.full_name || null,
        inviterProfile?.username || null,
        inviterProfile?.email || user.email || 'unbekannt@example.com'
      )

      // Einladungs-URL generieren
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const invitationUrl = `${baseUrl}/teams/invite/${invitation.token}`

      try {
        console.log('Attempting to send team invitation email...')
        // E-Mail-Einladung senden
        await sendTeamInvitation({
          to: parsedInput.email,
          inviterName,
          teamName: team.name,
          teamSlug: team.slug,
          invitationUrl,
          role: parsedInput.role,
        })
        console.log('Team invitation email sent successfully')
      } catch (emailError) {
        console.error('Fehler beim Senden der Einladungsemail:', emailError)
        // Einladung trotz E-Mail-Fehler speichern, aber Warnung zurückgeben
        return { 
          invitation,
          warning: `Einladung wurde erstellt, aber E-Mail konnte nicht gesendet werden: ${emailError instanceof Error ? emailError.message : 'Unbekannter Fehler'}. Bitte versuchen Sie es erneut.`
        }
      }

      revalidatePath(`/teams/${parsedInput.team_id}/members`)
      return { invitation }
    } catch (error) {
      console.error('Unexpected error in inviteTeamMember:', error)
      return { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }
    }
  })

export const acceptTeamInvitation = actionClient
  .schema(acceptInvitationSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSuperClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { error: 'Nicht authentifiziert' }
      }

      // Einladung abrufen
      const { data: invitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select(`
          id,
          team_id,
          email,
          role,
          invited_by,
          token,
          expires_at,
          accepted_at,
          created_at
        `)
        .eq('token', parsedInput.token)
        .maybeSingle()

      if (invitationError) {
        console.error('Database error fetching invitation:', invitationError)
        return { error: 'Fehler beim Laden der Einladung' }
      }

      if (!invitation) {
        return { error: 'Ungültige oder abgelaufene Einladung' }
      }

      // Prüfen ob Einladung abgelaufen ist
      if (new Date(invitation.expires_at) < new Date()) {
        return { error: 'Diese Einladung ist abgelaufen' }
      }

      // Prüfen ob Einladung bereits angenommen wurde
      if (invitation.accepted_at) {
        return { error: 'Diese Einladung wurde bereits angenommen' }
      }

      // Prüfen ob E-Mail-Adresse übereinstimmt
      if (user.email !== invitation.email) {
        return { 
          error: 'EMAIL_MISMATCH',
          message: 'Die E-Mail-Adresse Ihrer Einladung stimmt nicht mit Ihrer angemeldeten E-Mail-Adresse überein.'
        }
      }

      // Prüfen ob Benutzer bereits Mitglied des Teams ist
      const { data: existingMembership, error: membershipCheckError } = await supabase
        .from('team_members')
        .select('id, role')
        .eq('team_id', invitation.team_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (membershipCheckError) {
        console.error('Error checking existing membership:', membershipCheckError)
        return { error: 'Fehler beim Prüfen der Team-Mitgliedschaft' }
      }

      if (existingMembership) {
        // Wenn bereits Mitglied, aktualisiere die Rolle falls nötig
        if (existingMembership.role !== invitation.role) {
          const { error: updateRoleError } = await supabase
            .from('team_members')
            .update({ role: invitation.role })
            .eq('team_id', invitation.team_id)
            .eq('user_id', user.id)

          if (updateRoleError) {
            console.error('Error updating member role:', updateRoleError)
            return { error: 'Fehler beim Aktualisieren der Team-Rolle' }
          }
        }

        // Einladung als angenommen markieren
        const { error: updateError } = await supabase
          .from('team_invitations')
          .update({ 
            accepted_at: new Date().toISOString(),
            accepted_by: user.id
          })
          .eq('token', parsedInput.token)

        if (updateError) {
          console.error('Error updating invitation:', updateError)
        }

        revalidatePath(`/teams/${invitation.team_id}/members`)
        return { success: true, message: 'Team-Rolle wurde aktualisiert' }
      }

      // Benutzer zum Team hinzufügen
      const { error: membershipError } = await supabase
        .from('team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
        })

      if (membershipError) {
        console.error('Error adding user to team:', membershipError)
        return { error: `Fehler beim Hinzufügen zum Team: ${membershipError.message}` }
      }

      // Einladung als angenommen markieren
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ 
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
        .eq('token', parsedInput.token)

      if (updateError) {
        console.error('Error updating invitation:', updateError)
        // Nicht kritisch, da Benutzer bereits hinzugefügt wurde
      }

      revalidatePath(`/teams/${invitation.team_id}/members`)
      return { success: true }
    } catch (error) {
      console.error('Unexpected error in acceptTeamInvitation:', error)
      return { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }
    }
  }) 

// Magic Link für Einladung senden
export const sendInvitationMagicLink = actionClient
  .schema(z.object({ token: z.string() }))
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSuperClient()

      // Einladung abrufen
      const { data: invitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select(`
          id,
          team_id,
          email,
          role,
          invited_by,
          token,
          expires_at,
          accepted_at,
          created_at
        `)
        .eq('token', parsedInput.token)
        .maybeSingle()

      if (invitationError) {
        console.error('Database error fetching invitation:', invitationError)
        return { error: 'Fehler beim Laden der Einladung' }
      }

      if (!invitation) {
        return { error: 'Ungültige oder abgelaufene Einladung' }
      }

      // Prüfen ob Einladung abgelaufen ist
      if (new Date(invitation.expires_at) < new Date()) {
        return { error: 'Diese Einladung ist abgelaufen' }
      }

      // Prüfen ob Einladung bereits angenommen wurde
      if (invitation.accepted_at) {
        return { error: 'Diese Einladung wurde bereits angenommen' }
      }

      // Prüfen ob Benutzer mit dieser E-Mail existiert
      const { data: existingUser, error: userCheckError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', invitation.email)
        .maybeSingle()

      if (userCheckError) {
        console.error('Error checking if user exists:', userCheckError)
        return { error: 'Fehler beim Prüfen des Benutzerkontos' }
      }

      if (!existingUser) {
        return { 
          error: 'USER_NOT_FOUND',
          message: 'Es existiert kein Konto mit dieser E-Mail-Adresse. Bitte erstellen Sie zuerst ein Konto.'
        }
      }

      // Magic Link senden (nur wenn Benutzer existiert)
      const { error: magicLinkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: invitation.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/teams/invite/${parsedInput.token}`
        }
      })

      if (magicLinkError) {
        console.error('Error sending magic link:', magicLinkError)
        return { error: 'Fehler beim Senden des Magic Links' }
      }

      return { success: true, message: 'Magic Link wurde an Ihre E-Mail-Adresse gesendet' }
    } catch (error) {
      console.error('Unexpected error in sendInvitationMagicLink:', error)
      return { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }
    }
  })

// Einladung widerrufen (löschen)
export const revokeTeamInvitation = actionClient
  .schema(z.object({ invitation_id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSuperClient()
      const { data: invitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select('id, team_id, accepted_at')
        .eq('id', parsedInput.invitation_id)
        .maybeSingle()

      if (invitationError) {
        console.error('Error loading invitation for revoke:', invitationError)
        return { error: 'Fehler beim Laden der Einladung' }
      }
      if (!invitation) {
        return { error: 'Einladung nicht gefunden' }
      }
      if (invitation.accepted_at) {
        return { error: 'Diese Einladung wurde bereits angenommen' }
      }

      const { checkTeamPermission } = await import('./team-permissions')
      const allowed = await checkTeamPermission(invitation.team_id, ['owner', 'admin'])
      if (!allowed) return { error: 'Keine Berechtigung' }

      const { error: deleteError } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', parsedInput.invitation_id)

      if (deleteError) {
        console.error('Error revoking invitation:', deleteError)
        return { error: 'Fehler beim Widerrufen der Einladung' }
      }

      revalidatePath(`/teams/${invitation.team_id}/members`)
      return { success: true }
    } catch (error) {
      console.error('Unexpected error in revokeTeamInvitation:', error)
      return { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }
    }
  })

// Einladungsrolle ändern
export const updateTeamInvitationRole = actionClient
  .schema(
    z.object({
      invitation_id: z.string().uuid(),
      role: z.enum(['owner', 'admin', 'member']),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSuperClient()
      const { data: invitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select('id, team_id, accepted_at')
        .eq('id', parsedInput.invitation_id)
        .maybeSingle()

      if (invitationError) {
        console.error('Error loading invitation for update:', invitationError)
        return { error: 'Fehler beim Laden der Einladung' }
      }
      if (!invitation) {
        return { error: 'Einladung nicht gefunden' }
      }
      if (invitation.accepted_at) {
        return { error: 'Diese Einladung wurde bereits angenommen' }
      }

      const { checkTeamPermission } = await import('./team-permissions')
      const requiredRole = parsedInput.role === 'owner' ? 'owner' : (['owner', 'admin'] as const)
      const allowed = await checkTeamPermission(invitation.team_id, requiredRole as any)
      if (!allowed) return { error: 'Keine Berechtigung' }

      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ role: parsedInput.role })
        .eq('id', parsedInput.invitation_id)

      if (updateError) {
        console.error('Error updating invitation role:', updateError)
        return { error: 'Fehler beim Aktualisieren der Einladungsrolle' }
      }

      revalidatePath(`/teams/${invitation.team_id}/members`)
      return { success: true }
    } catch (error) {
      console.error('Unexpected error in updateTeamInvitationRole:', error)
      return { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }
    }
  })

// Einladung erneut senden (E-Mail)
export const resendTeamInvitationEmail = actionClient
  .schema(z.object({ invitation_id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSuperClient()
      const { data: invitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select('id, team_id, email, role, invited_by, token, expires_at, accepted_at')
        .eq('id', parsedInput.invitation_id)
        .maybeSingle()

      if (invitationError) {
        console.error('Error loading invitation for resend:', invitationError)
        return { error: 'Fehler beim Laden der Einladung' }
      }
      if (!invitation) {
        return { error: 'Einladung nicht gefunden' }
      }
      if (invitation.accepted_at) {
        return { error: 'Diese Einladung wurde bereits angenommen' }
      }
      if (new Date(invitation.expires_at) < new Date()) {
        return { error: 'Diese Einladung ist abgelaufen. Bitte eine neue Einladung erstellen.' }
      }

      const { checkTeamPermission } = await import('./team-permissions')
      const allowed = await checkTeamPermission(invitation.team_id, ['owner', 'admin'])
      if (!allowed) return { error: 'Keine Berechtigung' }

      const { data: team } = await supabase
        .from('teams')
        .select('name, slug')
        .eq('id', invitation.team_id)
        .single()

      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('full_name, username, email')
        .eq('id', invitation.invited_by)
        .single()

      const inviterName = formatInviterName(
        inviterProfile?.full_name || null,
        inviterProfile?.username || null,
        inviterProfile?.email || 'noreply@example.com'
      )

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const invitationUrl = `${baseUrl}/teams/invite/${invitation.token}`

      await sendTeamInvitation({
        to: invitation.email,
        inviterName,
        teamName: team?.name || 'Team',
        teamSlug: team?.slug || invitation.team_id,
        invitationUrl,
        role: invitation.role,
      })

      return { success: true }
    } catch (error) {
      console.error('Unexpected error in resendTeamInvitationEmail:', error)
      return { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }
    }
  })

// Funktion zum Verarbeiten von Einladungen nach der Registrierung
export const processInvitationAfterRegistration = actionClient
  .schema(z.object({ 
    token: z.string(),
    user_id: z.string().uuid()
  }))
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSuperClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || user.id !== parsedInput.user_id) {
        return { error: 'Nicht authentifiziert oder ungültige Benutzer-ID' }
      }

      // Einladung abrufen
      const { data: invitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select(`
          id,
          team_id,
          email,
          role,
          invited_by,
          token,
          expires_at,
          accepted_at,
          created_at
        `)
        .eq('token', parsedInput.token)
        .maybeSingle()

      if (invitationError) {
        console.error('Database error fetching invitation:', invitationError)
        return { error: 'Fehler beim Laden der Einladung' }
      }

      if (!invitation) {
        return { error: 'Ungültige oder abgelaufene Einladung' }
      }

      // Prüfen ob Einladung abgelaufen ist
      if (new Date(invitation.expires_at) < new Date()) {
        return { error: 'Diese Einladung ist abgelaufen' }
      }

      // Prüfen ob Einladung bereits angenommen wurde
      if (invitation.accepted_at) {
        return { error: 'Diese Einladung wurde bereits angenommen' }
      }

      // Prüfen ob E-Mail-Adresse übereinstimmt
      if (user.email !== invitation.email) {
        return { 
          error: 'EMAIL_MISMATCH',
          message: 'Die E-Mail-Adresse Ihrer Einladung stimmt nicht mit Ihrer angemeldeten E-Mail-Adresse überein.'
        }
      }

      // Prüfen ob Benutzer bereits Mitglied des Teams ist
      const { data: existingMembership, error: membershipCheckError } = await supabase
        .from('team_members')
        .select('id, role')
        .eq('team_id', invitation.team_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (membershipCheckError) {
        console.error('Error checking existing membership:', membershipCheckError)
        return { error: 'Fehler beim Prüfen der Team-Mitgliedschaft' }
      }

      if (existingMembership) {
        // Wenn bereits Mitglied, aktualisiere die Rolle falls nötig
        if (existingMembership.role !== invitation.role) {
          const { error: updateRoleError } = await supabase
            .from('team_members')
            .update({ role: invitation.role })
            .eq('team_id', invitation.team_id)
            .eq('user_id', user.id)

          if (updateRoleError) {
            console.error('Error updating member role:', updateRoleError)
            return { error: 'Fehler beim Aktualisieren der Team-Rolle' }
          }
        }

        // Einladung als angenommen markieren
        const { error: updateError } = await supabase
          .from('team_invitations')
          .update({ 
            accepted_at: new Date().toISOString(),
            accepted_by: user.id
          })
          .eq('token', parsedInput.token)

        if (updateError) {
          console.error('Error updating invitation:', updateError)
        }

        revalidatePath(`/teams/${invitation.team_id}/members`)
        return { success: true, message: 'Team-Rolle wurde aktualisiert' }
      }

      // Benutzer zum Team hinzufügen
      const { error: membershipError } = await supabase
        .from('team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
        })

      if (membershipError) {
        console.error('Error adding user to team:', membershipError)
        return { error: `Fehler beim Hinzufügen zum Team: ${membershipError.message}` }
      }

      // Einladung als angenommen markieren
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ 
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
        .eq('token', parsedInput.token)

      if (updateError) {
        console.error('Error updating invitation:', updateError)
        // Nicht kritisch, da Benutzer bereits hinzugefügt wurde
      }

      revalidatePath(`/teams/${invitation.team_id}/members`)
      return { success: true }
    } catch (error) {
      console.error('Unexpected error in processInvitationAfterRegistration:', error)
      return { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' }
    }
  }) 