import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AiModelsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>AI Models</CardTitle>
          <CardDescription>View and manage your AI models and settings</CardDescription>
        </CardHeader>
        <CardContent>{/* AI models interface will go here */}</CardContent>
      </Card>
    </div>
  )
}
