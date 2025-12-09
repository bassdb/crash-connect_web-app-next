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
  title: 'Start It - A starter for my next app',
  description: "Hust start it, don't wait for it",
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
          <div className='min-h-screen w-full container flex flex-col gap-4 items-center'>
            <HeaderWeb />
            <main className='flex flex-col justify-start w-full grow'>{children}</main>
            <FooterWeb />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
