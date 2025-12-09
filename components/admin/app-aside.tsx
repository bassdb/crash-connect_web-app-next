import { ChartLine, Link, UserPen, Users } from 'lucide-react'

export default function AppAside() {
  return (
    <aside className='w-1/5 rounded-md border border-emerald-600'>
      <nav>
        <ul className='space-y-2 py-4 px-2'>
          <li className='flex flex-row gap-3 items-center bg-slate-50/5 py-2 px-4 rounded-md'>
            <ChartLine
              size={14}
              className='mr-3 transition-all duration-200 group-hover:translate-x-1'
            />
            <Link href='/admin-dashboard'>Status</Link>
          </li>
          <li className='flex flex-row gap-3 items-center bg-slate-50/5 py-2 px-4 rounded-md'>
            <UserPen
              size={14}
              className='mr-3 transition-all duration-200 group-hover:translate-x-1'
            />
            <Link href='/admin-dashboard'>Users</Link>
          </li>
          <li className='flex flex-row gap-3 items-center bg-slate-50/5 py-2 px-4 rounded-md'>
            <Users
              size={14}
              className='mr-3 transition-all duration-200 group-hover:translate-x-1'
            />
            <Link href='/admin-dashboard'>Teams</Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
