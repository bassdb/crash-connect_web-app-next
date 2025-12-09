import { ThemeSwitcher } from '@/components/theme-switcher'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'

import '@/app/globals.css'

import { Toaster } from '@/components/ui/toaster'
import FabricInitializer from '@/app/(editors)/_components/fabric-initializer'

import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DashboardBreadcrumbs from '@/components/dashboard-breadcrumbs'
import { cookies } from 'next/headers'
import { createClient } from '@/server/supabase/server'
import { checkUserRole } from '@/lib/check-session-and-role'
import { encodedRedirect } from '@/utils/utils'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Admin Area of Start It',
  description: 'Here the assigned admin can manage the app',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true'

  const getUserRole = await checkUserRole()

  if (!getUserRole) {
    return encodedRedirect('error', '/auth-feedback', 'Error fetching your role.')
  }
  const { user_role, isOwnerOrAbove, isCreatorOrAbove } = getUserRole

  // console.log('User role detected (admin layout):', user_role)
  // console.log('User condition detected (admin layout):', isOwnerOrAbove)

  if (!isCreatorOrAbove) {
    return encodedRedirect('error', '/auth-feedback', 'You are not authorized to access this page.')
  }
  return (
    <html lang='en' className={GeistSans.className} suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <FabricInitializer />
          {/* <header className='flex justify-between px-4 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'></header> */}

          {/* <div className='flex flex-col justify-start w-full grow'>{children}</div> */}
          {children}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
