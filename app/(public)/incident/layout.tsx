import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schadenmeldung | Crash Connect',
  description: 'Schnelle Schadenmeldung via QR-Code',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  },
  themeColor: '#4a00ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Crash Connect'
  }
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

