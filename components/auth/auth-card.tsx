import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Socials from '@/components/auth/socials'
import BackButton from '@/components/auth/back-button'

type CardWrapperProps = {
  children: React.ReactNode
  cardTitle: string
  backButtonHref: string
  backButtonLabel: string
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
        <div className='bg-emerald-500 flex items-center justify-center p-6'>
          <div className='relative h-full w-full'>
            <div className='absolute inset-0 flex flex-col items-center justify-center text-white'>
              <h2 className='mb-4 text-2xl font-bold'>Welcome Back</h2>
              <p className='text-center text-sm'>Sign in to continue your journey</p>
            </div>
            <div className='h-64 w-full md:h-full'>
              <svg
                className='h-full w-full'
                viewBox='0 0 500 500'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M250 416.667C342.05 416.667 416.667 342.05 416.667 250C416.667 157.95 342.05 83.3334 250 83.3334C157.95 83.3334 83.3334 157.95 83.3334 250C83.3334 342.05 157.95 416.667 250 416.667Z'
                  stroke='hsl(var(--primary))'
                  strokeWidth='8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M250 166.667C215.482 166.667 187.5 194.649 187.5 229.167C187.5 258.333 208.333 283.333 250 333.333C291.667 283.333 312.5 258.333 312.5 229.167C312.5 194.649 284.518 166.667 250 166.667Z'
                  stroke='white'
                  strokeWidth='8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='rgba(255,255,255,0.2)'
                />
              </svg>
            </div>
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
          <CardFooter>
            <BackButton href={backButtonHref} label={backButtonLabel} />
          </CardFooter>
        </div>
      </div>
    </Card>

    //--------------------------------
    //--------------------------------
  )
}

export default AuthCard
