import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TeamLoading() {
  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header Skeleton */}
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' className='gap-2' disabled>
            <ArrowLeft className='w-4 h-4' />
            Zurück zu Teams
          </Button>
          <div className='flex items-center gap-3'>
            <Skeleton className='w-12 h-12 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <Card>
          <CardContent className='pt-6'>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-3/4' />
          </CardContent>
        </Card>

        {/* Stats Skeleton */}
        <div className='grid gap-4 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className='pt-6'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-8 h-8 rounded' />
                  <div>
                    <Skeleton className='h-8 w-12 mb-1' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Members Skeleton */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <Skeleton className='h-6 w-32 mb-2' />
                <Skeleton className='h-4 w-48' />
              </div>
              <Skeleton className='h-10 w-32' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex items-center justify-between p-3 rounded-lg border'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='w-10 h-10 rounded-full' />
                    <div>
                      <Skeleton className='h-4 w-32 mb-1' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-6 w-16' />
                    <Skeleton className='h-3 w-20' />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32 mb-2' />
            <Skeleton className='h-4 w-64' />
          </CardHeader>
          <CardContent>
            <div className='flex gap-3'>
              <Skeleton className='h-10 w-40' />
              <Skeleton className='h-10 w-40' />
              <Skeleton className='h-10 w-32' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
