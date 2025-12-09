import { Button } from '@/components/ui/button'
import { Sparkles, Twitter, Facebook, Linkedin, Link, MessageCircle, Palette, Layout, Tag, Shapes } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/server/supabase/server'
import { headers } from 'next/headers'

interface Template {
  id: string
  name?: string
  preview_image_url?: string
  description?: string
  category?: string
  design_type?: string
  display_type?: string
  type?: string
  created_at?: string
  updated_at?: string
  creator?: string
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('design_templates')
    .select('name, description, preview_image_url')
    .eq('id', slug)
    .single()

  const title = data?.name ? `${data.name} – Design Template` : 'Design Template – Details'
  const description = data?.description ?? 'Details zu diesem Design Template.'
  const path = `/browse/${slug}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'article',
      images: data?.preview_image_url ? [{ url: data.preview_image_url }] : undefined,
    },
    twitter: {
      card: data?.preview_image_url ? 'summary_large_image' : 'summary',
      title,
      description,
      images: data?.preview_image_url ? [data.preview_image_url] : undefined,
    },
    robots: { index: true, follow: true },
  }
}

export default async function TemplateDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch the template by slug (assuming slug is the id or a unique field)
  const { data, error } = await supabase
    .from('design_templates')
    .select('*')
    .eq('id', slug)
    .single()

  if (error || !data) {
    return <div className='text-red-500 p-8'>Template not found.</div>
  }

  const template: Template = data

  // Share URLs
  const hdrs = await headers()
  const host = hdrs.get('host')
  const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? 'https' : 'http'
  const origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? '')
  const shareUrl = `${origin}/browse/${slug}`
  const shareText = template.name ? `${template.name} – Design Template` : 'Design Template'
  const twitterHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`

  // Optional: Creator display name (if accessible)
  let creatorDisplayName: string | null = null
  if (template.creator) {
    const { data: creatorData } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', template.creator)
      .single()
    creatorDisplayName = creatorData?.username ?? creatorData?.full_name ?? null
  }

  return (
    <div className='flex-1 w-full flex flex-col gap-2 items-center justify-center'>
      <div className='w-full text-xl p-3 px-5 rounded-md text-foreground flex items-center'>
        <Button variant='link' asChild>
          <a href='/browse' className='text-foreground hover:text-primary transition-colors'>
            ← Back to Browse
          </a>
        </Button>
      </div>
      <div className='w-full  mx-auto'>
        <div className='flex flex-col md:flex-row gap-8 rounded-xl shadow-md p-6 bg-card'>
          {/* Left: Preview Image */}
          <div className='flex-shrink-0 w-full md:w-1/2 flex items-center justify-center'>
            {template.preview_image_url ? (
              <img
                src={template.preview_image_url}
                alt={template.name || 'Design Template'}
                className='w-full h-full object-contain rounded-xl border'
                style={{ minHeight: '400px' }}
              />
            ) : (
              <div className='w-full h-full max-h-[500px] flex items-center justify-center bg-gray-200 rounded-xl text-gray-400'>
                No Image
              </div>
            )}
          </div>
          {/* Right: Details */}
          <div className='flex-1 flex flex-col items-startjustify-center gap-4 p-2'>
            <div className='w-full flex items-center justify-between gap-4 text-foreground'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center'>
                  <span className='text-lg'>★★★★</span>
                  <span className='text-lg'>☆</span>
                  <span className='ml-1 text-sm text-gray-600'>(4.0)</span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-sm text-gray-600'>Used</span>
                  <span className='font-semibold'>2,547</span>
                  <span className='text-sm text-gray-600'>times</span>
                </div>
              </div>

              {/* Share actions */}
              <div className='flex items-center gap-2'>
                <span className='hidden sm:inline text-sm text-gray-500'>Share</span>
                <a href={twitterHref} target='_blank' rel='noopener noreferrer' aria-label='Share on Twitter' className='inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent'>
                  <Twitter className='h-4 w-4' />
                </a>
                <a href={facebookHref} target='_blank' rel='noopener noreferrer' aria-label='Share on Facebook' className='inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent'>
                  <Facebook className='h-4 w-4' />
                </a>
                <a href={linkedinHref} target='_blank' rel='noopener noreferrer' aria-label='Share on LinkedIn' className='inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent'>
                  <Linkedin className='h-4 w-4' />
                </a>
                <a href={whatsappHref} target='_blank' rel='noopener noreferrer' aria-label='Share on WhatsApp' className='inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent'>
                  <MessageCircle className='h-4 w-4' />
                </a>
                <a href={shareUrl} aria-label='Copy link' className='inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent'>
                  <Link className='h-4 w-4' />
                </a>
              </div>
            </div>
            <h1 className='text-4xl font-bold mb-2 text-foreground'>{template.name}</h1>
            {template.description && <p className='mb-2'>{template.description}</p>}
            {/* Info chips (moved below description) */}
            <div className='flex flex-wrap items-center gap-2 mb-2'>
              {template.design_type && (
                <div className='inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm'>
                  <Palette className='h-4 w-4' />
                  <span className='whitespace-nowrap'>Design: {template.design_type}</span>
                </div>
              )}
              {template.display_type && (
                <div className='inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm'>
                  <Layout className='h-4 w-4' />
                  <span className='whitespace-nowrap'>Display: {template.display_type}</span>
                </div>
              )}
              {template.category && (
                <div className='inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm'>
                  <Tag className='h-4 w-4' />
                  <span className='whitespace-nowrap'>Category: {template.category}</span>
                </div>
              )}
              {template.type && (
                <div className='inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm'>
                  <Shapes className='h-4 w-4' />
                  <span className='whitespace-nowrap'>Type: {template.type}</span>
                </div>
              )}
            </div>
           {creatorDisplayName && (
                  <span>Creator: {creatorDisplayName}</span>
                )}
            {(template.updated_at || creatorDisplayName) && (
              <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                {template.created_at && (
                  <div className='text-sm text-gray-500'>
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </div>
                )}
                {template.updated_at && (
                  <span>Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                )}
                
              </div>
            )}
            {/* Primary CTA below metadata */}
            <div className='w-full pt-4'>
              <Button size='lg' className='w-full h-12 text-base font-semibold' asChild>
                <a href={`/use-design-template?templateId=${template.id}`} className='flex items-center justify-center gap-2'>
                  <Sparkles className='h-5 w-5' />
                  Use this Template
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Community Creations Preview Grid */}
      <div className='w-full mx-auto mt-12'>
        <div className='flex flex-col gap-4'>
          <h2 className='text-2xl font-semibold text-foreground'>What users created with this template</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {[
              '/design-template-placeholders/hype_category-10.jpg',
              '/design-template-placeholders/hype_category-11.jpg',
              '/design-template-placeholders/hype_category-12.jpg',
              '/design-template-placeholders/hype_category-13.jpg',
              '/design-template-placeholders/hype_category-14.jpg',
              '/design-template-placeholders/hype_category-15.jpg',
              '/design-template-placeholders/hype_category-iconic-01.jpg',
              '/design-template-placeholders/hype_category-iconic-02.jpg',
            ].map((src) => (
              <div key={src} className='rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                <div className='relative w-full aspect-[4/3]'>
                  <Image src={src} alt={`User creation preview`} fill className='object-cover' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
