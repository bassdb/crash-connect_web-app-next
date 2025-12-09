// lib/stripe.js

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key in environment variables')
}

const stripeServer = new Stripe(process.env.STRIPE_SECRET_KEY)

export default stripeServer
