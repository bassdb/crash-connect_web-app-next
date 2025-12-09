import { createClient } from '@/server/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { CommunityFeed } from '@/components/dashboard/community-feed'
import { TeamActivity } from '@/components/dashboard/team-activity'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <div className="flex-1 w-full">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Willkommen zurück, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Hier ist ein Überblick über deine neuesten Aktivitäten und die Community.
          </p>
        </div>

        {/* Stats Overview */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Community Feed - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CommunityFeed />
          </div>

          {/* Team Activity - Takes up 1 column on large screens */}
          <div className="lg:col-span-1">
            <TeamActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
