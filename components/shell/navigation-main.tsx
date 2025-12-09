'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type NavLink = {
  href: string
  label: string
}

export default function NavigationMain({ navLinks }: { navLinks: NavLink[] }) {
  // -----------------------------

  const currentPath = usePathname()

  return (
    <nav>
      <ul className='flex gap-5'>
        {navLinks.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className={cn('text-sm', currentPath === link.href && ' text-emerald-400')}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
