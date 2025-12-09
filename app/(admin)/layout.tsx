import { ThemeSwitcher } from '@/components/theme-switcher'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'

import '@/app/globals.css'

import { Toaster } from '@/components/ui/toaster'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

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
  const sidebarCookie = cookieStore.get('sidebar:state')?.value
  const defaultOpen = sidebarCookie ? sidebarCookie === 'true' : true

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
  // Supabase User + Profile laden, um Avatar an die Client-Sidebar zu geben
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let sidebarUser: { name: string; email: string; avatar: string } | undefined = undefined
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()

    sidebarUser = {
      name: profile?.full_name || user.user_metadata?.full_name || user.email || 'User',
      email: user.email || '',
      avatar: profile?.avatar_url || '',
    }
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
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar projectName={process.env.ORGANISATION_NAME} user={sidebarUser} />
            <SidebarInset>
              <header className='flex justify-between px-4 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
                <div className='flex items-center gap-2 px-4'>
                  <SidebarTrigger className='-ml-1' />
                  <Separator orientation='vertical' className='mr-2 h-4' />
                  <DashboardBreadcrumbs />
                </div>
                <div className='flex items-center gap-2'>
                  <ThemeSwitcher />
                </div>
              </header>

              <main className='flex flex-col justify-start w-full grow'>
                {/* <HeaderWeb /> */}
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
