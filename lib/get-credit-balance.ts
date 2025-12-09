import { createClient } from '@/server/supabase/server'

export async function getCreditBalance() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  // Get all credit transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user?.user?.id)

  if (transactionsError) {
    console.error('Error fetching transactions:', transactionsError)
    return {
      currentBalance: 0,
      totalPurchased: 0,
      latestPurchase: null,
      progressValue: 0,
      percentageNotUsed: 0,
    }
  }

  // Get current balance
  const { data: creditBalance, error: balanceError } = await supabase
    .from('user_credit_balances')
    .select('*')
    .eq('user_id', user?.user?.id)
    .single()

  if (balanceError) {
    console.error('Error fetching balance:', balanceError)
    return {
      currentBalance: 0,
      totalPurchased: 0,
      latestPurchase: null,
      progressValue: 0,
      percentageNotUsed: 0,
    }
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders_credits')
    .select('*')
    .eq('user_id', user?.user?.id)

  if (ordersError) {
    console.error('Error fetching orders:', ordersError)
  }

  // Calculate total purchased credits (including free tier)
  const totalPurchased = transactions
    .filter((t) => t.transaction_type === 'purchase')
    .reduce((sum, t) => sum + t.credit_amount, 10) // Adding 10 for free tier

  // Get latest purchase
  const latestPurchase = transactions
    .filter((t) => t.transaction_type === 'purchase')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  const currentBalance = creditBalance?.current_balance || 0
  const progressValue = latestPurchase ? (currentBalance / latestPurchase.credit_amount) * 100 : 0
  const percentageNotUsed =
    totalPurchased > 0 ? Math.round((currentBalance / totalPurchased) * 100) : 0

  return {
    transactions,
    currentBalance,
    totalPurchased,
    latestPurchase,
    progressValue,
    percentageNotUsed,
  }
}
