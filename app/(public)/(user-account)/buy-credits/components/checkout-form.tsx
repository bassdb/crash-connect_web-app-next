'use client'

import { Button } from '@/components/ui/button'

import { useEffect, useState } from 'react'

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    if (!stripe || !elements) {
      setErrorMessage('An unknown error occurred')
      return
    }
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:3000/your-credits',
      },
    })

    if (submitError) {
      setErrorMessage(submitError.message || 'An unknown error occurred')
      setLoading(false)
      return
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
      <PaymentElement />
      <Button variant={'default'} type='submit' disabled={!stripe || !elements || loading}>
        Pay
      </Button>
      {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
    </form>
  )
}
