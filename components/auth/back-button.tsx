'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

type BackButtonType = {
  href: string
  label: string
}

function BackButton({ href, label }: BackButtonType) {
  return (
    <Button className='font-medium w-full' asChild variant={'link'}>
      <Link href={href}>{label}</Link>
    </Button>
  )
}
export default BackButton
