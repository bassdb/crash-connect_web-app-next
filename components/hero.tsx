import NextLogo from './next-logo'
import SupabaseLogo from './supabase-logo'

export default function Header() {
  return (
    <div className='flex flex-col gap-16 items-center'>
      <p className='text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center'>
        <span className='font-bold text-3xllg:text-4xl'>Marketing Page </span>
      </p>
      <div className='flex gap-8 justify-center items-center'>any content goes here</div>

      <div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8' />
    </div>
  )
}
