import { Resend } from 'resend'
import { render } from '@react-email/components'
import { TeamInvitationEmail } from '@/components/emails/team-invitation-email'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendTeamInvitationParams {
  to: string
  inviterName: string
  teamName: string
  teamSlug: string
  invitationUrl: string
  role: string
}

export async function sendTeamInvitation({
  to,
  inviterName,
  teamName,
  teamSlug,
  invitationUrl,
  role,
}: SendTeamInvitationParams) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      throw new Error('Email service is not configured')
    }

    console.log('Rendering team invitation email with props:', {
      inviterName,
      teamName,
      teamSlug,
      invitationUrl,
      role,
    })

    const emailHtml = render(
      TeamInvitationEmail({
        inviterName,  
        teamName,
        teamSlug, 
        invitationUrl,
        role,
      })
    )

    console.log('Email HTML rendered successfully')

    const fromEmail = process.env.RESEND_TEAM_INVITATION_EMAIL || 'invitations@ai8ht.com'
    console.log('Sending email from:', fromEmail, 'to:', to)

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Einladung zum Team ${teamName}`,
      react: TeamInvitationEmail({
        inviterName,  
        teamName,
        teamSlug,
        invitationUrl,
        role,
      }),
    })

    if (error) {
      console.error('Error sending team invitation email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('Team invitation email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendTeamInvitation:', error)
    throw error
  }
}

export async function sendWelcomeEmail({ to, userName }: { to: string; userName: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: [to],
      subject: 'Willkommen bei DesignTemplates!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Willkommen bei DesignTemplates!</h1>
          <p>Hallo ${userName},</p>
          <p>Vielen Dank für Ihre Registrierung bei DesignTemplates. Wir freuen uns, Sie als neues Mitglied begrüßen zu dürfen!</p>
          <p>Sie können jetzt:</p>
          <ul>
            <li>Design-Templates erstellen und bearbeiten</li>
            <li>Mit Teams zusammenarbeiten</li>
            <li>Ihre Projekte verwalten</li>
          </ul>
          <p>Falls Sie Fragen haben, zögern Sie nicht, uns zu kontaktieren.</p>
          <p>Beste Grüße,<br>Das DesignTemplates Team</p>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      throw new Error(`Failed to send welcome email: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
    throw error
  }
}
