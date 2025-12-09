// UI imports
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// Component imports
import Socials from '@/components/auth/socials'
import BackButton from '@/components/auth/back-button'
// Package imports
import Image from 'next/image'

type CardWrapperProps = {
  children: React.ReactNode
  cardTitle: string
  backButtonHref?: string
  backButtonLabel?: string
  showSocials?: boolean
}

function AuthCard({
  children,
  cardTitle,
  backButtonHref,
  backButtonLabel,
  showSocials,
}: CardWrapperProps) {
  return (
    <Card className='w-full max-w-4xl overflow-hidden'>
      <div className='grid md:grid-cols-2'>
        {/* Left side - Illustration */}
        <div className='relative flex items-center justify-center p-6 bg-white dark:bg-white'>
          <div className='relative h-full w-full flex items-center justify-center'>
            <Image
              src='/brand-assets/crash-connect-icon.png'
              alt='Crash Connect Logo'
              width={400}
              height={400}
              className='object-contain z-10'
              priority
            />
          </div>
        </div>
        <div className='p-6'>
          <CardHeader>
            <CardTitle>{cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
          {showSocials && (
            <CardFooter>
              <Socials />
            </CardFooter>
          )}
          {backButtonHref && backButtonLabel && (
            <CardFooter>
              <BackButton href={backButtonHref} label={backButtonLabel} />
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  )
}

export default AuthCard
