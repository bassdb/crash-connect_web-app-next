import { createClient } from '@/server/supabase/server'
import { BellRing, Check, Send } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import AddNotificationCard from './add-notification'

async function InsertData() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('notes').select('*')

  return (
    <div className='flex flex-col items-center gap-4 mx-auto w-full max-w-4xl'>
      <AddNotificationCard />
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>You have {data?.length} unread messages.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className=' flex items-center space-x-4 rounded-md border p-4'>
            <BellRing />
            <div className='flex-1 space-y-1'>
              <p className='text-sm font-medium leading-none'>Push Notifications</p>
              <p className='text-sm text-muted-foreground'>Send notifications to device.</p>
            </div>
            <Switch />
          </div>
          <div>
            {data &&
              data.map((note) => (
                <div
                  key={note.id}
                  className='mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0'
                >
                  <span className='flex h-2 w-2 translate-y-1 rounded-full bg-sky-500' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium leading-none'>{note.title}</p>
                    <p className='text-sm text-muted-foreground'>1</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className='w-full'>
            <Check /> Mark all as read
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
export default InsertData
