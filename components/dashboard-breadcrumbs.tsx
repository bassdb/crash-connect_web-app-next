'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'

import { generateBreadcrumbs } from '@/utils/generateBreadcrumbs'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type Props = {}

export default function DashboardBreadcrumbs({}: Props) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)
  // console.log(breadcrumbs)
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href} className='inline-flex items-center gap-1'>
                    {index === 0 ? <Home className='h-4 w-4' aria-hidden /> : null}
                    <span>{crumb.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
