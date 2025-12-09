import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GenerationsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Your Generations</CardTitle>
          <CardDescription>View and manage your AI-generated content</CardDescription>
        </CardHeader>
        <CardContent>{/* Generations interface will go here */}</CardContent>
      </Card>
    </div>
  )
}
