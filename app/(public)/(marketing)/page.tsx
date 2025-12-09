import Hero from '@/components/hero'

export default async function Index() {
  return (
    <div className='flex flex-col justify-center items-center w-full grow'>
      <Hero />
      <div className='flex flex-col items-center gap-6'>
        <h2 className='font-medium text-xl mb-4'>Hell yeah 🤘🏻</h2>
      </div>
    </div>
  )
}
