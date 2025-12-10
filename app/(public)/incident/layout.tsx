import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Schadenmeldung | Crash Connect',
  description: 'Schnelle Schadenmeldung via QR-Code',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Crash Connect'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4a00ff'
}

export default function IncidentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}

