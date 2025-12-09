export const dynamic = 'force-dynamic'
import { createClient } from '@/server/supabase/server'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeCheck, ClipboardList, Rocket, Flame, Star, Share2, Tag, Shapes } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function DesignTemplatesDashboard() {
  const supabase = await createClient()

  const [{ count: totalCount, error: totalErr }, { count: activeCount, error: activeErr }, { count: reviewCount, error: reviewErr }] = await Promise.all([
    supabase.from('design_templates').select('*', { count: 'exact', head: true }),
    supabase
      .from('design_templates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('design_templates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
  ])

  const hasError = Boolean(totalErr || activeErr || reviewErr)
  const totals = {
    all: totalCount ?? 0,
    active: activeCount ?? 0,
    inReview: reviewCount ?? 0,
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>Design Templates Übersicht</h1>
      {hasError && (
        <p className='text-sm text-red-600 mb-4'>Konnte Zähler nicht vollständig laden.</p>
      )}

      <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
        <Link href='/admin-dashboard/design-templates/manage-design-templates'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Alle Templates</CardTitle>
            <ClipboardList className='h-5 w-5 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{totals.all}</div>
          </CardContent>
        </Card>
        </Link>


        
        <Link href='#'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Aktiv (veröffentlicht)</CardTitle>
            <Rocket className='h-5 w-5 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{totals.active}</div>
          </CardContent>
        </Card>
        </Link>


        <Link href='/admin-dashboard/design-templates/design-templates-approvals'>
        
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>In Prüfung</CardTitle>
            <BadgeCheck className='h-5 w-5 text-amber-600' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{totals.inReview}</div>
            <p className='text-xs text-muted-foreground mt-1'>(wartet auf Freigabe)</p>
          </CardContent>
        </Card>
        </Link>
      
      </div>

      {/* Highlights Section */}
      <div className='mt-10'>
        <h2 className='text-xl font-semibold mb-4'>Highlights</h2>
        <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {/* Most Used */}
          <Card className='overflow-hidden'>
            <div className='relative aspect-[16/9]'>
              <Image
                src='/hype_previews/hype_preview_01.jpg'
                alt='Meist genutzt'
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                priority
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
              <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                <div className='flex items-center gap-2 text-xs opacity-90 mb-1'>
                  <Flame className='h-4 w-4' />
                  <span>Meist genutzt</span>
                </div>
                <div className='text-lg font-semibold'>Champion Poster</div>
                <div className='text-sm opacity-90'>1.245 Nutzungen • Woche</div>
              </div>
            </div>
          </Card>

          {/* Best Rated */}
          <Card className='overflow-hidden'>
            <div className='relative aspect-[16/9]'>
              <Image
                src='/hype_previews/hype_preview_05.jpg'
                alt='Beste Bewertung'
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
              <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                <div className='flex items-center gap-2 text-xs opacity-90 mb-1'>
                  <Star className='h-4 w-4' />
                  <span>Beste Bewertung</span>
                </div>
                <div className='text-lg font-semibold'>Modern Social Banner</div>
                <div className='text-sm opacity-90'>4.9 / 5 • 312 Bewertungen</div>
              </div>
            </div>
          </Card>

          {/* Most Shared */}
          <Card className='overflow-hidden'>
            <div className='relative aspect-[16/9]'>
              <Image
                src='/hype_previews/hype_preview_09.jpg'
                alt='Am meisten geteilt'
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
              <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                <div className='flex items-center gap-2 text-xs opacity-90 mb-1'>
                  <Share2 className='h-4 w-4' />
                  <span>Am meisten geteilt</span>
                </div>
                <div className='text-lg font-semibold'>Event Flyer Neon</div>
                <div className='text-sm opacity-90'>842 Shares • Monat</div>
              </div>
            </div>
          </Card>

          {/* Trending Category */}
          <Card className='overflow-hidden'>
            <div className='relative aspect-[16/9]'>
              <div className='absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600' />
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_40%)]' />
              <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                <div className='flex items-center gap-2 text-xs opacity-90 mb-1'>
                  <Tag className='h-4 w-4' />
                  <span>Trend-Kategorie</span>
                </div>
                <div className='text-lg font-semibold'>Social Media</div>
                <div className='text-sm opacity-90'>+38% Nutzung • 7 Tage</div>
              </div>
            </div>
          </Card>

          {/* Trending Type */}
          <Card className='overflow-hidden'>
            <div className='relative aspect-[16/9]'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600' />
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.25),transparent_40%)]' />
              <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                <div className='flex items-center gap-2 text-xs opacity-90 mb-1'>
                  <Shapes className='h-4 w-4' />
                  <span>Trend-Typ</span>
                </div>
                <div className='text-lg font-semibold'>Poster</div>
                <div className='text-sm opacity-90'>+22% Veröffentlichungen • 30 Tage</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


