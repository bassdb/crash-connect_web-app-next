import { createClient } from '@/server/supabase/server'
import { redirect } from 'next/navigation'
import MasonryGrid from '../components/masonry-grid'
import { demoItems } from '@/lib-dev/demo-data-design-cards'

export default async function Feature01() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/no-user')
  }

  return (
    <div className='h-full'>
      <MasonryGrid items={demoItems} />
    </div>
  )
}
