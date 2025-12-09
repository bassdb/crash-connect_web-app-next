import { Message } from '@/components/form-message'
import { FormError } from '@/components/error-handling/form-error'
import { FormSuccess } from '@/components/error-handling/form-success'
// import { DotLottieReact } from '@lottiefiles/dotlottie-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AuthFeedback(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams
  const { error, success, information } = searchParams

  return (
    <div className='flex flex-col grow justify-center items-center'>
      <Card className='min-w-[300px] w-1/2 min-h-[250px] h-1/2'>
        <CardHeader>
          <CardTitle>
            {error && 'There is a problem!'}
            {success && 'Success!'}
            {information && 'Info!'}
          </CardTitle>

          {/* <CardDescription>Card Description</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className='flex flex-col justify-center items-center grow w-full'>
            {/* <DotLottieReact src='public/lotties/notAuthorized.lottie' loop autoplay /> */}
          </div>
          <FormError message={searchParams.error} />
          <FormSuccess message={searchParams.success} />
        </CardContent>
        <CardFooter>
          <Button>
            <Link href='/admin-dashboard/user-management'> Back to dashboard </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
