import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LanguageRegionPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>
            Configure your language preferences and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent>{/* Language and region settings will go here */}</CardContent>
      </Card>
    </div>
  )
}
