import OrderFlow from './components/order-flow'
import { createClient } from '@/server/supabase/server'

export default async function BuyCredits() {
  const supabase = await createClient()
  const { data: tiers, error } = await supabase.from('credit_packages').select()
  // console.log(tiers)

  return <OrderFlow tiers={tiers ?? []} />
}
