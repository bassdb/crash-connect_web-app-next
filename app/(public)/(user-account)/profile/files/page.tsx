import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FilesPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
          <CardDescription>Manage and organize your uploaded files</CardDescription>
        </CardHeader>
        <CardContent>{/* File management interface will go here */}</CardContent>
      </Card>
    </div>
  )
}
