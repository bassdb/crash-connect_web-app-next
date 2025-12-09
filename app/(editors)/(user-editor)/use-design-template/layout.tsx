import { ThemeSwitcher } from '@/components/theme-switcher'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'

import '@/app/globals.css'

import { Toaster } from '@/components/ui/toaster'
import FabricInitializer from '@/app/(editors)/_components/fabric-initializer'

import { createClient } from '@/server/supabase/server'
import { encodedRedirect } from '@/utils/utils'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Make the design yours!',
  description: 'Hier können Sie Design Templates verwenden und bearbeiten',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  // Prüfe ob der Benutzer authentifiziert ist
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return encodedRedirect('error', '/sign-in', 'Sie müssen sich anmelden, um Templates zu verwenden.')
  }
  
  return (
    <html lang='de' className={GeistSans.className} suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <FabricInitializer />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
