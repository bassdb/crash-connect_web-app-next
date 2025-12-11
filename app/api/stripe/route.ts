import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSuperClient } from '@/server/supabase/superadmin'

import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
  })
  const sig = req.headers.get('stripe-signature') || ''
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  // Read the request body as text
  const reqText = await req.text()
  // Convert the text to a buffer
  const reqBuffer = Buffer.from(reqText)

  let event

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, sig, signingSecret)
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, {
      status: 400,
    })
  }

  // Handle the event just an example!
  switch (event.type) {
    case 'payment_intent.succeeded':
      const retrieveOrder = await stripe.paymentIntents.retrieve(event.data.object.id, {
        expand: ['latest_charge'],
      })
      const charge = retrieveOrder.latest_charge as Stripe.Charge

      console.log(charge.receipt_url)

      // Then define and call a function to handle the event product.created
      const supabase = await createSuperClient()
      const { data, error } = await supabase
        .from('orders_credits')
        .update({ status: 'succeeded', receiptURL: charge.receipt_url })
        .eq('stripe_payment_intent_id', event.data.object.id)
        .select()
      if (error) {
        console.error(error)
      }
      console.log(data)
      if (data) {
        const { data: creditBalanceData, error: creditBalanceError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: data[0]?.user_id,
            transaction_type: 'purchase',
            credit_amount: data[0].credit_amount,
            description: `${data[0].credit_amount} Credits purchased for ${data[0].amount}`,
            order_id: data[0].id,
          })
          .select()
        if (creditBalanceError) {
          console.error(creditBalanceError)
        }
        console.log(creditBalanceData)
        revalidatePath('/your-credits')
      }
      break

    default:
      console.log(`${event.type}`)
  }

  return new Response('ok', { status: 200 })
}
