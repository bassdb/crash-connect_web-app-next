export const dynamic = 'force-dynamic'
import { createClient } from '@/server/supabase/server'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ImageIcon, MoreHorizontal, Plus, LayoutGrid, Rows } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import DeleteHypeTemplate from './components/delete-hype-template'
import { DesignTemplateRow } from '@/types/design-template'

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
      return (
        <Badge variant='outline' className='border-gray-500 text-gray-700'>
          Entwurf
        </Badge>
      )
  }
}

export default async function ManageDesignTemplates({
  searchParams,
}: {
  searchParams: { view?: string }
}) {
  const supabase = await createClient()
  const { data: templates, error } = await supabase
    .from('design_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    return { error: error.message }
  }

  const isGridView = (searchParams?.view ?? 'table') === 'grid'

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold'>Design Templates</h1>
        <div className='flex items-center gap-2'>
          <div className='flex rounded-md border overflow-hidden'>
            <Link
              href={{
                pathname: '/admin-dashboard/design-templates/manage-design-templates',
                query: { view: 'table' },
              }}
              className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${!isGridView ? 'bg-muted' : 'hover:bg-muted/60'}`}
            >
              <Rows className='h-4 w-4' />
              Tabelle
            </Link>
            <Link
              href={{
                pathname: '/admin-dashboard/design-templates/manage-design-templates',
                query: { view: 'grid' },
              }}
              className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${isGridView ? 'bg-muted' : 'hover:bg-muted/60'}`}
            >
              <LayoutGrid className='h-4 w-4' />
              Grid
            </Link>
          </div>
          <Button asChild variant='default'>
            <Link
              href='/admin-dashboard/design-templates/manage-design-templates/new'
              className='flex items-center gap-2'
            >
              <Plus size={16} />
              Add New Template
            </Link>
          </Button>
        </div>
      </div>
      {isGridView ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {templates?.map((template: DesignTemplateRow) => (
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
                    alt={template.name}
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
                      {template.name}
                    </Link>
                    <div className='text-xs text-muted-foreground capitalize truncate'>
                      {template.category}
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
                  <Button asChild size='sm' variant='secondary'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                    >
                      Details
                    </Link>
                  </Button>
                  <Button asChild size='sm' variant='outline'>
                    <Link href={`/create-design-template?designTemplateId=${template.id}`}>
                      Editor
                    </Link>
                  </Button>
                  <DeleteHypeTemplate templateId={template.id} />
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
                <TableHead className='w-[50px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((template: DesignTemplateRow) => (
                <TableRow key={template.id} className='group hover:bg-muted/50 transition-colors'>
                  <TableCell className='p-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block p-4 hover:bg-muted/30 transition-colors'
                    >
                      {template.preview_image_url ? (
                        <img
                          src={template.preview_image_url}
                          alt={template.name}
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
                      {template.name}
                    </Link>
                  </TableCell>
                  <TableCell className='p-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block p-4 hover:bg-muted/30 transition-colors capitalize'
                    >
                      {template.category}
                    </Link>
                  </TableCell>
                  <TableCell className='p-0'>
                    <div className='p-4'>{getStatusBadge(template.status)}</div>
                  </TableCell>
                  <TableCell className='p-0'>
                    <Link
                      href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                      className='block p-4 hover:bg-muted/30 transition-colors text-sm text-muted-foreground'
                    >
                      {template.created_at ? (
                        new Date(template.created_at).toLocaleString('de-DE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      ) : (
                        <p>no info</p>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild className='cursor-pointer'>
                          <Link
                            href={`/admin-dashboard/design-templates/manage-design-templates/${template.id}`}
                          >
                            Details anzeigen
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className='cursor-pointer'>
                          <Link href={`/create-design-template?designTemplateId=${template.id}`}>
                            Im Editor bearbeiten
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='cursor-pointer'>Duplizieren</DropdownMenuItem>
                        <DeleteHypeTemplate templateId={template.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
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
