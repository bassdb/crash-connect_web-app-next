import { createClient } from '@/server/supabase/server'

export async function getCreditBalance() {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  const { data: creditBalance, error } = await supabase
    .from('user_credit_balances')
    .select('*')
    .eq('user_id', user?.user?.id)

  const { data: latestPurchase, error: latestPurchaseError } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user?.user?.id)
    .eq('transaction_type', 'purchase')

  const currentBalance = creditBalance?.[0]?.current_balance
  console.log('currentBalance: ', currentBalance)
  const latestPurchaseCreditAmount = latestPurchase?.[0]?.credit_amount
  //   console.log('latestPurchaseCreditAmount: ', latestPurchaseCreditAmount)
  const progressValue = (latestPurchaseCreditAmount / 100) * currentBalance
  //   console.log(progressValue)
  const percentageNotUsed = latestPurchaseCreditAmount
    ? Math.round((currentBalance / latestPurchaseCreditAmount) * 100)
    : 0
  //   console.log('percentageNotUsed: ', percentageNotUsed)

  const creditBalanceData = {
    currentBalance,
    latestPurchase,
    progressValue,
    percentageNotUsed,
  }

  return creditBalanceData
}
