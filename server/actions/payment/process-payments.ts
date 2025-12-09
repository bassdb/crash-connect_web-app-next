'use server'

import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'
import stripeServer from '@/utils/stripe-server'
import { createSuperClient } from '@/server/supabase/superadmin'

const planPrices = z.object({
  packageId: z.string(),
})

export const processPayments = actionClient
  .schema(planPrices)
  .action(async ({ parsedInput: { packageId } }) => {
    console.log('User wants to get package:', packageId)
    console.log('Collecting Infos from Database to calculate amount for :', packageId)
    console.log('--------------------------------')

    // get package from db and infer the price
    const supabaseAdmin = await createSuperClient()

    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser()

    if (!user) {
      return {
        error: 'No active session found. Please login or subscribe to purchase credits.',
      }
    }

    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('credit_packages')
      .select()
      .eq('id', packageId)
    console.log('Package data:', packageData)
    console.log('Now trying to create payment intent')
    console.log('--------------------------------')

    if (!packageData) {
      return {
        error: 'Credits package not found! Try again.',
      }
    }
    const { price, name, credits } = packageData[0]

    const amount = price * 100

    const paymentIntent = await stripeServer.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        packageId,
        name,
        credits,
        userId: user.id,
      },
    })

    console.log('Payment intent created:', paymentIntent.id)
    console.log('--------------------------------')
    console.log('Now creating order in db')

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders_credits')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency: paymentIntent.currency,
        credit_amount: credits,
        status: 'pending',
      })
      .single()

    if (orderError) {
      console.log('No order created:', orderError.message)
      return {
        error: 'Error creating order in our system. Please try again.',
      }
    }

    console.log('Order successfully created, now sending client secret to client')
    console.log('--------------------------------')

    return {
      success: 'received package you want to buy: ',
      paymentIntentID: paymentIntent.id,
      clientSecretID: paymentIntent.client_secret,
    }
  })
