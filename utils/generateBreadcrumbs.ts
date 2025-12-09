// utils/generateBreadcrumbs.ts

import capitalize from '@/utils/capitalize' // Ensure you have a utility to capitalize strings

export function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    return {
      href,
      label: capitalize(segment.replace(/-/g, ' ')), // Replace hyphens with spaces and capitalize
    }
  })

  // Prepend the 'Home' breadcrumb so it can be rendered as a clickable crumb
  return [{ href: '/', label: 'Home' }, ...breadcrumbs]
}
