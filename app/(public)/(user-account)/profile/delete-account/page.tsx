import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DeleteAccountPage() {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='w-full border border-dashed border-red-600'>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Before proceeding, please understand that:
            </p>
            <ul className='list-disc list-inside space-y-2 text-sm text-muted-foreground'>
              <li>All your data will be permanently deleted</li>
              <li>Your profile and content will be removed</li>
              <li>You will lose access to all services</li>
              <li>This action cannot be reversed</li>
            </ul>
            <Button variant='destructive'>Delete Account Permanently</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
