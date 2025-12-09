'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

import {
  CircleUserRound,
  Mail,
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link as LinkIcon,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
  Users,
  RectangleEllipsis,
  Images,
  Sparkles,
  FileImage,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

const navigationItems = [
  { name: 'Profile', icon: CircleUserRound, href: '/profile' },
  { name: 'Password', icon: RectangleEllipsis, href: '/profile/password' },
  { name: 'Appearance', icon: Paintbrush, href: '/profile/appearance' },
  { name: 'Teams', icon: Users, href: '/profile/teams' },
  { name: 'Emails', icon: Mail, href: '/profile/emails' },
  { name: 'Messages', icon: MessageCircle, href: '/profile/messages' },
  { name: 'Your Files', icon: Images, href: '/profile/files' },
  { name: 'Your AI Models', icon: Sparkles, href: '/profile/ai-models' },
  { name: 'Your Generations', icon: FileImage, href: '/profile/generations' },
  { name: 'Connected accounts', icon: LinkIcon, href: '/profile/connected-accounts' },
  { name: 'Language & region', icon: Globe, href: '/profile/language-region' },
  { name: 'Delete account', icon: Lock, href: '/profile/delete-account' },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  return (
    <div className='h-fit'>
      <SidebarProvider className='items-start'>
        <Sidebar collapsible='none' className='hidden md:flex h-fit'>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}
