'use client'
import {
  PieChart,
  Users,
  CircleUserRound,
  DollarSign,
  Palette,
  CreditCard,
  Bell,
} from 'lucide-react'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'

import { getClientUserRole } from '@/lib/get-client-user-role'


interface UserInfo {
  user_role: string | null
  isOwnerOrAbove: boolean
  isAdminOrAbove: boolean

  // add other properties as needed
}

export function NavMain() {
  const [statsOpen, setStatsOpen] = useState(true)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  const [paymentsOpen, setPaymentsOpen] = useState(false)
  const [contentOpen, setContentOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    const fetchUserInfos = async () => {
      const userInfo = await getClientUserRole()
      if (!userInfo?.user_role) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! No userdata found for you.',
          description: 'There was a problem with your request.',
        })
        return
      }

      setUserInfo(userInfo)
    }

    fetchUserInfos()
  }, [])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {userInfo?.isOwnerOrAbove && (
          <Collapsible
            asChild
            defaultOpen={statsOpen}
            open={statsOpen}
            onOpenChange={setStatsOpen}
            className='group/collapsible'
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip='Get quick insights into your platform'>
                  <PieChart />
                  <span>
                    <Link href='/admin-dashboard'>Stats</Link>
                  </span>
                  <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/stats/users'>
                        <span>Users</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/stats/users'>
                        <span>Revenue</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/stats/users'>
                        <span>System</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}
        <Collapsible
          asChild
          defaultOpen={contentOpen}
          open={contentOpen}
          onOpenChange={setContentOpen}
          className='group/collapsible'
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip='Create and manage content'>
                <Palette />
                <span>
                  <Link href='/admin-dashboard/design-templates'>Design Templates</Link>
                </span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href='/admin-dashboard/design-templates/manage-design-templates/new'>
                      <span>Create</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {userInfo?.isAdminOrAbove && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/design-templates/manage-design-templates'>
                        <span>Manage</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
                {userInfo?.isAdminOrAbove && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/design-templates/design-templates-approvals'>
                        <span>
                          Approvals{' '}
                          <span className='ml-2 rounded-full bg-muted px-2 py-0.5 text-xs'>12</span>
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
                {userInfo?.isAdminOrAbove && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/design-templates/manage-categories'>
                        <span>
                          Categories
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
                {userInfo?.isAdminOrAbove && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/design-templates/manage-types'>
                        <span>
                          Types
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        {userInfo?.isAdminOrAbove && (
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Pricing' asChild>
              <Link href='/admin-dashboard/pricing'>
                <CreditCard />
                <span>Pricing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {userInfo?.isAdminOrAbove && (
          <Collapsible
            asChild
            defaultOpen={paymentsOpen}
            open={paymentsOpen}
            onOpenChange={setPaymentsOpen}
            className='group/collapsible'
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip='Manage Payments'>
                  <DollarSign />
                  <span>
                    <Link href='#'>Payments</Link>
                  </span>
                  <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='#'>
                        <span>History</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='#'>
                        <span>Pending</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='#'>
                        <span>Disputes</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}

        {/* ---------------------- */}

        {userInfo?.isAdminOrAbove && (
          <Collapsible
            asChild
            defaultOpen={statsOpen}
            open={accountsOpen}
            onOpenChange={setAccountsOpen}
            className='group/collapsible'
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip='Manage user accounts'>
                  <Users />
                  <span>
                    <Link href='/admin-dashboard/user-management'>User Accounts</Link>
                  </span>
                  <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/user-management?userType=consumer'>
                        <span>Users</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/user-management?userType=creator'>
                        <span>Creators</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/user-management?userType=admin'>
                        <span>Admins</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/user-management?userType=product_owner'>
                        <span>Owners</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href='/admin-dashboard/user-management/add-user'>
                        <span>Add user</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}

        {/* ---------------------- */}

        <Collapsible
          asChild
          defaultOpen={teamOpen}
          open={teamOpen}
          onOpenChange={setTeamOpen}
          className='group/collapsible'
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip='Manage user accounts'>
                <CircleUserRound />
                <span>
                  <Link href='#'>Team Accounts</Link>
                </span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href='/admin-dashboard/team-accounts/manage-team-accounts'>
                      <span>Manage Teams</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href='/admin-dashboard/team-accounts/create-example-team'>
                      <span>Create Example Team</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href='/admin-dashboard/team-accounts/manage-example-teams'>
                      <span>Manage Example Teams</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        <Collapsible
          asChild
          defaultOpen={notificationsOpen}
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
          className='group/collapsible'
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip='Notifications'>
                <Bell />
                <span>
                  <Link href='#'>Notifications</Link>
                </span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href='#'>
                      <span>Messages</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href='#'>
                      <span>Tasks</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link href='#'>
                      <span>Timelogs</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        {/* ---------------------- */}
      </SidebarMenu>
    </SidebarGroup>
  )
}
