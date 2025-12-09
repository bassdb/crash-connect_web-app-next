export type OrdersCredits = {
  created_at: string
  user_id: string
  stripe_payment_intent_id: string
  amount: number
  currency: string
  credit_amount: number
  status: 'pending' | 'succeeded' | 'failed'
  updated_at: string
}
