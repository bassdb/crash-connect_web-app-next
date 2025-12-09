import { Message } from '@/components/form-message'
import { FormError } from '@/components/error-handling/form-error'
import { FormSuccess } from '@/components/error-handling/form-success'
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
  const { error, success } = searchParams

  return (
    <div className='flex flex-col grow justify-center items-center'>
      <Card>
        <CardHeader>
          <CardTitle>
            {error && 'There is a problem!'}
            {success && 'Success!'}
          </CardTitle>

          {/* <CardDescription>Card Description</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className='flex flex-col justify-center items-center grow w-full'></div>
          <FormError message={searchParams.error} />
          <FormSuccess message={searchParams.success} />
        </CardContent>
        <CardFooter>
          <Button>
            <Link href='/'> Back to home </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
