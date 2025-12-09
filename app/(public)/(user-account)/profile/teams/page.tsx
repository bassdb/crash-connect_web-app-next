import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TeamsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>Manage your teams and team memberships</CardDescription>
        </CardHeader>
        <CardContent>{/* Team management interface will go here */}</CardContent>
      </Card>
    </div>
  )
}
