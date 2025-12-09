'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check } from 'lucide-react'

import CheckoutForm from './checkout-form'
import { useToast } from '@/hooks/use-toast'

import { Elements } from '@stripe/react-stripe-js'

import convertToSubcurrency from '@/utils/convertToSubcurrency'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'

import { processPayments } from '@/server/actions/payment/process-payments'

import getStripe from '@/utils/get-stripe'
import { set } from 'zod'

type Tier = {
  id: string
  name: string
  credits: number
  price: number
  description: string
  features?: string[]
}

const stripePromise = getStripe()
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE!)

export default function OrderFlow({ tiers }: { tiers: Tier[] }) {
  const [checkoutState, setCheckoutState] = useState('choosePlan')
  const [clientSecret, setClientSecret] = useState<string>('')

  const [packageId, setPackageId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const { toast } = useToast()

  const handleCheckout = (packageId: string) => {
    execute({ packageId })
  }

  const { execute } = useAction(processPayments, {
    onSuccess: ({ data }) => {
      if (!data) return
      if (data.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error,
        })
        return
      }

      if (data.success) {
        toast({
          title: 'Proceeding to checkout',
          description: 'Please provide your payment information',
        })

        if (data.clientSecretID) {
          setClientSecret(data.clientSecretID)
          toast({
            title: 'Your payment is ready',
            description: 'Please provide your payment information',
          })
        }
        setCheckoutState('checkout')
      }
    },
  })

  const appearance = {
    theme: 'flat',
  }
  const stripeOptions = {
    clientSecret,
  }

  // const handleCheckout = ()=>

  return (
    <div className='py-12'>
      {checkoutState === 'choosePlan' && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h2 className='text-3xl font-extrabold sm:text-4xl'>Choose Your Credit Package</h2>
            <p className='mt-4 text-xl'>Select the plan that best fits your needs.</p>
          </div>

          <div className='mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2'>
            {tiers.map((tier) => (
              <Card key={tier.name} className='flex flex-col justify-between'>
                <CardHeader>
                  <CardTitle className='text-2xl font-bold'>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='mt-4 flex items-baseline text-6xl font-extrabold'>
                    ${tier.price}
                    <span className='ml-1 text-2xl font-medium text-gray-500'>/mo</span>
                  </div>
                  <p className='mt-4 text-lg text-gray-500'>{tier.credits} credits</p>
                  {/* <ul className='mt-6 space-y-4'>
                    {tier.features.map((feature) => (
                      <li key={feature} className='flex'>
                        <Check className='flex-shrink-0 w-6 h-6 text-green-500' />
                        <span className='ml-3 text-base text-gray-700'>{feature}</span>
                      </li>
                    ))}
                  </ul> */}
                </CardContent>
                <CardFooter>
                  <Button className='w-full' onClick={() => handleCheckout(tier.id)}>
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      {checkoutState === 'checkout' && clientSecret ? (
        <>
          <Card className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <CardHeader>
              <CardTitle>Fill in your payment details</CardTitle>
              <CardDescription>
                To complete your purchase and finally get your credits proceed with the payment
                method below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
