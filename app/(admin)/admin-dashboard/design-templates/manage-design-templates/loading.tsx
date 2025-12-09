import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className='container mx-auto py-10 flex items-center justify-center min-h-[400px]'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Loader2 className='h-6 w-6 animate-spin' />
        <span>Lade Templates...</span>
      </div>
    </div>
  )
}
