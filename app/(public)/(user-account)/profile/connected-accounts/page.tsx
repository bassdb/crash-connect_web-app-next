import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConnectedAccountsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected third-party accounts and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>{/* Connected accounts interface will go here */}</CardContent>
      </Card>
    </div>
  )
}
