import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type UserStatsCardProps = {
  title: string
  registeredUsers: number
  activeUsers: number
}

export default function UserStatsCard({ title, registeredUsers, activeUsers }: UserStatsCardProps) {
  return (
    <Card className='w-full h-full flex flex-col items-center justify-center'>
      <CardHeader>
        <CardTitle className='text-xl font-bold text-center text-primary'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center'>
        <div className='text-4xl font-bold text-primary'>{registeredUsers}</div>
        <div className='text-sm text-muted-foreground'>Registered Users</div>
        <div className='text-lg font-semibold text-secondary'>{activeUsers}</div>
        <div className='text-xs text-muted-foreground'>Active Users</div>
      </CardContent>
    </Card>
  )
}
