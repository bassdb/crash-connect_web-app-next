import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EmailsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>
            Manage your email addresses and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>{/* Email management interface will go here */}</CardContent>
      </Card>
    </div>
  )
}
