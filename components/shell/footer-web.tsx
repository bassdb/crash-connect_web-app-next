import { Copyright } from 'lucide-react'

export default function FooterWeb() {
  const year = new Date().getFullYear()
  return (
    <footer className='w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16'>
      <p>
        <span className='font-bold display:inline'>© {year} </span>
        {/* <Copyright /> */}
        Powered by{' '}
        <a href='/' target='_blank' className='font-bold hover:underline' rel='noreferrer'>
          ai8ht ✌
        </a>
      </p>
    </footer>
  )
}
