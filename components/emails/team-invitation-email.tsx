import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface TeamInvitationEmailProps {
  inviterName: string
  teamName: string
  teamSlug: string
  invitationUrl: string
  role: string
}


export const TeamInvitationEmail: React.FC<TeamInvitationEmailProps> = ({
  inviterName,
  teamName,
  teamSlug,
  invitationUrl,
  role,
}) => {
  const roleLabel =
  {
    owner: 'Besitzer',
    admin: 'Administrator',
    member: 'Mitglied',
  }[role] || 'Mitglied'
  
  const organizationName = process.env.ORGANISATION_NAME || 'ai8ht'

  return (
    <Html>
      <Head />
      <Preview>Sie wurden zu einem Team eingeladen</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Team-Einladung</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>Hallo,</Text>

            <Text style={text}>
              <strong>{inviterName}</strong> hat Sie eingeladen, dem Team{' '}
              <strong>{teamName}</strong> auf {organizationName} beizutreten.
            </Text>

            <Text style={text}>
              Sie werden als <strong>{roleLabel}</strong> hinzugefügt.
            </Text>

            <Section style={buttonContainer}>
              <Link href={invitationUrl} style={button}>
                Einladung annehmen
              </Link>
            </Section>

            <Text style={text}>Oder kopieren Sie diesen Link in Ihren Browser:</Text>

            <Text style={linkText}>{invitationUrl}</Text>

            <Text style={text}>Diese Einladung ist 7 Tage gültig.</Text>

            <Text style={text}>
              Falls Sie diese E-Mail nicht erwartet haben, können Sie sie einfach ignorieren.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} DesignTemplates. Alle Rechte vorbehalten.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0',
  padding: '0',
}

const content = {
  padding: '0 40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const linkText = {
  color: '#0070f3',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
  marginBottom: '16px',
}

const footer = {
  textAlign: 'center' as const,
  marginTop: '40px',
  padding: '0 40px',
}

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
}

export default TeamInvitationEmail
