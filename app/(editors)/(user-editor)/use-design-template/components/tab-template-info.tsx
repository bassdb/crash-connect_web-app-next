'use client'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, Tag, FileText, Palette } from 'lucide-react'
import { DesignTemplateData } from '@/app/(editors)/_hooks/useDesignTemplateStore'

interface TabTemplateInfoProps {
  designTemplateDataFromServer: DesignTemplateData | null
  templateId?: string
}

export default function TabTemplateInfo({
  designTemplateDataFromServer,
  templateId,
}: TabTemplateInfoProps) {
  if (!designTemplateDataFromServer) {
    return (
      <div className='flex flex-col items-center justify-center p-4 text-center'>
        <div className='text-muted-foreground'>
          <FileText className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p className='text-sm'>Template-Informationen nicht verfügbar</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='space-y-4'>
      {/* Template Name */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Template Name</span>
        </div>
        <p className='text-sm text-foreground ml-6'>
          {designTemplateDataFromServer.name || 'Unbenannt'}
        </p>
      </div>

      <Separator />

      {/* Description */}
      {designTemplateDataFromServer.description && (
        <>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Beschreibung</span>
            </div>
            <p className='text-sm text-muted-foreground ml-6'>
              {designTemplateDataFromServer.description}
            </p>
          </div>
          <Separator />
        </>
      )}

      {/* Category */}
      {designTemplateDataFromServer.category && (
        <>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Kategorie</span>
            </div>
            <Badge variant='secondary' className='ml-6'>
              {designTemplateDataFromServer.category}
            </Badge>
          </div>
          <Separator />
        </>
      )}

      {/* Tags */}
      {designTemplateDataFromServer.tags && (
        <>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Tags</span>
            </div>
            <div className='flex flex-wrap gap-1 ml-6'>
              {designTemplateDataFromServer.tags.split(',').map((tag, index) => (
                <Badge key={index} variant='outline' className='text-xs'>
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Created Date */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Erstellt am</span>
        </div>
        <p className='text-sm text-muted-foreground ml-6'>
          {formatDate((designTemplateDataFromServer as any).created_at)}
        </p>
      </div>

      <Separator />

      {/* Status */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Palette className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Status</span>
        </div>
        <div className='ml-6'>
          <Badge 
            variant={designTemplateDataFromServer.publish ? 'default' : 'secondary'}
            className={designTemplateDataFromServer.publish ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {designTemplateDataFromServer.publish ? 'Veröffentlicht' : 'Entwurf'}
          </Badge>
        </div>
      </div>

      {/* Template ID */}
      <Separator />
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Template ID</span>
        </div>
        <p className='text-xs font-mono text-muted-foreground ml-6 break-all'>
          {templateId || designTemplateDataFromServer.id}
        </p>
      </div>
    </div>
  )
}
