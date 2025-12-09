import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MessagesPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>View and manage your messages and chat settings</CardDescription>
        </CardHeader>
        <CardContent>{/* Messages interface will go here */}</CardContent>
      </Card>
    </div>
  )
}
