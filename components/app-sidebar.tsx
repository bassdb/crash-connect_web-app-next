'use client'

import * as React from 'react'

import { NavMain } from '@/components/nav-main_v02'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import { adminDashboardLinks } from '@/lib/navigationLinks'

export function AppSidebar({ projectName, user, ...props }: React.ComponentProps<typeof Sidebar> & { projectName?: string; user?: { name: string; email: string; avatar: string } }) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={adminDashboardLinks.teams} role='superadmin' projectName={projectName} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        {/* <NavProjects projects={adminDashboardLinks.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? adminDashboardLinks.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
