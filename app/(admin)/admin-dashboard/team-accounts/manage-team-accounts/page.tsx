import Link from 'next/link'
import { encodedRedirect } from '@/utils/utils'
import { checkUserRole } from '@/lib/check-session-and-role'
import { createSuperClient } from '@/server/supabase/superadmin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function ManageTeamAccountsPage() {
  // RBAC: nur Admins und darüber (inkl. Product Owner/Owner, Superadmin)
  const role = await checkUserRole()
  if (!role) {
    return encodedRedirect('error', '/auth-feedback', 'Fehler beim Rollen-Check.')
  }
  const { isAdminOrAbove } = role
  if (!isAdminOrAbove) {
    return encodedRedirect('error', '/auth-feedback', 'Nicht autorisiert.')
  }

  const supabaseAdmin = await createSuperClient()
  const { data: teams, error } = await supabaseAdmin
    .from('teams')
    .select('id, name, slug, team_logo_url, is_default, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return encodedRedirect('error', '/auth-feedback', 'Fehler beim Laden der Teams.')
  }

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Team-Accounts</CardTitle>
          <CardDescription>Alle Teams im System, inkl. Default/Beispiel-Teams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className='text-right'>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(teams || []).map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={team.team_logo_url ?? undefined} />
                        <AvatarFallback>{team.name?.[0]?.toUpperCase() ?? 'T'}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className='font-medium'>{team.name}</TableCell>
                    <TableCell className='text-muted-foreground'>{team.slug}</TableCell>
                    <TableCell>
                      {team.is_default ? (
                        <Badge variant='default'>Default</Badge>
                      ) : (
                        <Badge variant='secondary'>Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {team.status === 'active' && <Badge variant='outline'>Aktiv</Badge>}
                      {team.status === 'inactive' && <Badge variant='secondary'>Inaktiv</Badge>}
                      {team.status === 'archived' && (
                        <Badge variant='destructive'>Archiviert</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(team.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className='text-right space-x-2'>
                      <Button asChild variant='outline' size='sm'>
                        <Link href={`/teams/${team.id}`}>Ansehen</Link>
                      </Button>
                      <Button asChild size='sm'>
                        <Link href={`/teams/${team.id}`}>Verwalten</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(teams?.length ?? 0) === 0 && (
              <div className='text-sm text-muted-foreground py-6'>Keine Teams gefunden.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
