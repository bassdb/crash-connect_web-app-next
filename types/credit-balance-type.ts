export type CreditBalance = {
  user_id: string
  transaction_type: 'purchase' | 'deduction' | 'initial'
  amount: number
  purchase_id: string | null
  deduction_id: string | null
  description: string
  created_at: Date
}
