import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  Activity,
} from 'lucide-react'

export const adminDashboardLinks = {
  user: {
    name: 'Sebastian Bader',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Start It',
      logo: Activity,
      plan: 'Superadmin',
    },
  ],
  navMain: [
    {
      title: 'Stats',
      url: '/admin-dashboard/stats',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Users',
          url: '/admin-dashboard/stats/users',
        },
        {
          title: 'Revenue',
          url: '/admin-dashboard/stats/revenue',
        },
        {
          title: 'System Health',
          url: '/admin-dashboard/stats/system',
        },
      ],
    },
    {
      title: 'User Management',
      url: '/admin-dashboard/user-management',
      icon: Users,
      tooltip: 'Manage users',
      items: [
        {
          title: 'consumers',
          url: '/admin-dashboard/user-management?userType=consumer',
        },
        {
          title: 'creators',
          url: '/admin-dashboard/user-management?userType=creator',
        },
        {
          title: 'admins',
          url: '/admin-dashboard/user-management?userType=admin',
        },
        {
          title: 'owners',
          url: '/admin-dashboard/user-management?userType=product_owner',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}
