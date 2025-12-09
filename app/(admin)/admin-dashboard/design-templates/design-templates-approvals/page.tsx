export const dynamic = 'force-dynamic'
import { createClient } from '@/server/supabase/server'

import Link from 'next/link'
import { ImageIcon, Plus, LayoutGrid, Rows } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DesignTemplateRow } from '@/types/design-template'
import { ApprovalDialog } from '../components/approval-dialog'
import { PublishDialog } from '../components/publish-dialog'

// Funktion zur Status-Badge-Erstellung
function getStatusBadge(status: string | null | undefined) {
  switch (status) {
    case 'waiting_for_approval':
      return (
        <Badge variant='outline' className='border-yellow-500 text-yellow-700'>
          Wartend
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant='outline' className='border-green-500 text-green-700'>
          Genehmigt
        </Badge>
      )
    case 'published':
      return (
        <Badge variant='outline' className='border-blue-500 text-blue-700'>
          Veröffentlicht
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant='outline' className='border-red-500 text-red-700'>
          Abgelehnt
        </Badge>
      )
    case 'draft':
      return (
        <Badge variant='outline' className='border-gray-500 text-gray-700'>
          Entwurf
        </Badge>
      )
    case 'archived':
      return (
        <Badge variant='outline' className='border-gray-400 text-gray-600'>
          Archiviert
        </Badge>
      )
    default:
      return <Badge variant='outline'>Unbekannt</Badge>
  }
}

export default async function DesignTemplatesApprovalsPage({
  searchParams,
}: {
  searchParams: { view?: string }
}) {
  const supabase = await createClient()

  const { data: templates, error } = await supabase
    .from('design_templates')
    .select('*')
    .in('status', ['waiting_for_approval', 'approved'])
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='text-2xl font-bold mb-4'>Design Templates – Freigaben</h1>
        <p className='text-sm text-red-600'>Fehler beim Laden: {error.message}</p>
      </div>
    )
  }

  const rows: DesignTemplateRow[] = (templates ?? []) as unknown as DesignTemplateRow[]
  const isGridView = (searchParams?.view ?? 'table') === 'grid'

  return (
    <div className='container mx-auto py-10'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Design Templates – Freigaben</h1>
        <div className='flex items-center gap-2'>
          <div className='flex rounded-md border overflow-hidden'>
            <Link
              href={{
                pathname: '/admin-dashboard/design-templates/design-templates-approvals',
                query: { view: 'table' },
              }}
              className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${!isGridView ? 'bg-muted' : 'hover:bg-muted/60'}`}
            >
              <Rows className='h-4 w-4' />
              Tabelle
            </Link>
            <Link
              href={{
                pathname: '/admin-dashboard/design-templates/design-templates-approvals',
                query: { view: 'grid' },
              }}
              className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${isGridView ? 'bg-muted' : 'hover:bg-muted/60'}`}
            >
              <LayoutGrid className='h-4 w-4' />
              Grid
            </Link>
          </div>
          <Button asChild variant='default'>
            <Link href='/create-design-template' className='flex items-center gap-2'>
              <Plus size={16} />
              Neues Template
            </Link>
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className='rounded-md border p-8 text-center text-muted-foreground'>
          Keine Templates im Status „waiting_for_approval” oder „approved” gefunden.
        </div>
      ) : isGridView ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {rows.map((template) => (
            <div
              key={template.id}
              className='group rounded-lg border bg-background overflow-hidden hover:shadow-sm transition-shadow'
            >
              <Link
                href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                className='block'
              >
                {template.preview_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={template.preview_image_url}
                    alt={template.name ?? 'preview'}
                    className='aspect-[9/16] w-full object-cover'
                  />
                ) : (
                  <div className='aspect-[9/16] w-full bg-emerald-100 flex items-center justify-center'>
                    <ImageIcon className='h-6 w-6 text-emerald-600' />
                  </div>
                )}
              </Link>
              <div className='p-4 space-y-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block font-medium truncate'
                    >
                      {template.name ?? 'Unbenannt'}
                    </Link>
                    <div className='text-xs text-muted-foreground capitalize truncate'>
                      {template.category ?? '—'}
                    </div>
                  </div>
                  {getStatusBadge(template.status)}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {template.created_at
                    ? new Date(template.created_at).toLocaleString('de-DE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '—'}
                </div>
                <div className='flex gap-2 pt-2'>
                  {template.status === 'waiting_for_approval' && (
                    <ApprovalDialog
                      templateId={template.id}
                      templateName={template.name ?? 'Unbenannt'}
                    >
                      <Button size='sm' className='bg-green-600 hover:bg-green-700'>
                        Genehmigen
                      </Button>
                    </ApprovalDialog>
                  )}
                  {template.status === 'approved' && (
                    <PublishDialog
                      templateId={template.id}
                      templateName={template.name ?? 'Unbenannt'}
                    >
                      <Button size='sm' className='bg-blue-600 hover:bg-blue-700 text-white'>
                        Veröffentlichen
                      </Button>
                    </PublishDialog>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((template) => (
                <TableRow key={template.id} className='group hover:bg-muted/50 transition-colors'>
                  <TableCell className='p-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block p-4 hover:bg-muted/30 transition-colors'
                    >
                      {template.preview_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={template.preview_image_url}
                          alt={template.name ?? 'preview'}
                          className='aspect-[9/16] w-20 rounded-md object-cover'
                        />
                      ) : (
                        <div className='aspect-[9/16] w-20 rounded-md bg-emerald-100 flex items-center justify-center'>
                          <ImageIcon className='h-5 w-5 text-emerald-600' />
                        </div>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className='p-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block p-4 hover:bg-muted/30 transition-colors font-mono text-sm'
                    >
                      {template.id}
                    </Link>
                  </TableCell>
                  <TableCell className='p-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block p-4 hover:bg-muted/30 transition-colors font-medium'
                    >
                      {template.name ?? 'Unbenannt'}
                    </Link>
                  </TableCell>
                  <TableCell className='p-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block p-4 hover:bg-muted/30 transition-colors capitalize'
                    >
                      {template.category ?? '—'}
                    </Link>
                  </TableCell>
                  <TableCell className='p-0'>
                    <div className='p-4'>{getStatusBadge(template.status)}</div>
                  </TableCell>
                  <TableCell className='p-0'>
                    <div className='block p-4 hover:bg-muted/30 transition-colors text-sm text-muted-foreground'>
                      {template.created_at
                        ? new Date(template.created_at).toLocaleString('de-DE', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </div>
                  </TableCell>
                  <TableCell className='p-0'>
                    <div className='p-4 flex gap-2'>
                      {template.status === 'waiting_for_approval' && (
                        <ApprovalDialog
                          templateId={template.id}
                          templateName={template.name ?? 'Unbenannt'}
                        >
                          <Button size='sm' className='bg-green-600 hover:bg-green-700'>
                            Genehmigen
                          </Button>
                        </ApprovalDialog>
                      )}
                      {template.status === 'approved' && (
                        <PublishDialog
                          templateId={template.id}
                          templateName={template.name ?? 'Unbenannt'}
                        >
                          <Button size='sm' className='bg-blue-600 hover:bg-blue-700 text-white'>
                            Veröffentlichen
                          </Button>
                        </PublishDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
