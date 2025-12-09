import HeaderAuth from '@/components/shell/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'

import '@/app/globals.css'
import FooterWeb from '@/components/shell/footer-web'
import HeaderWeb from '@/components/shell/header-web'
import { Toaster } from '@/components/ui/toaster'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'M. Web App Template ',
  description: "Sebastian's app starter",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={GeistSans.className} suppressHydrationWarning>
      <body className='bg-background text-foreground'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <div className='min-h-screen w-full container flex flex-col gap-20 items-center'>
            <HeaderWeb />
            <main className='flex flex-col justify-start w-full grow'>{children}</main>
            <FooterWeb />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
