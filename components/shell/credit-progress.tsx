import { Progress } from '@/components/ui/progress'
import { getCreditBalance } from '@/lib/credit-balance'

import { createClient } from '@/server/supabase/server'

export default async function CreditProgress({ percentageNotUsed }: { percentageNotUsed: number }) {
  return <Progress className='w-full h-1' value={percentageNotUsed} />
}
