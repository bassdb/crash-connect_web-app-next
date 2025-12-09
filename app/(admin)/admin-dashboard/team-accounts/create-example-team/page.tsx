import { encodedRedirect } from '@/utils/utils'
import { checkUserRole } from '@/lib/check-session-and-role'
import CreateExampleTeamForm from './create-example-team-form'

export default async function CreateExampleTeamPage() {
  // RBAC: nur Admins und darüber (inkl. Product Owner/Owner, Superadmin)
  const role = await checkUserRole()
  if (!role) {
    return encodedRedirect('error', '/auth-feedback', 'Fehler beim Rollen-Check.')
  }
  const { isAdminOrAbove } = role
  if (!isAdminOrAbove) {
    return encodedRedirect('error', '/auth-feedback', 'Nicht autorisiert.')
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Neues Standard-Team erstellen</h1>
        <p className="text-muted-foreground">
          Erstellen Sie ein neues Standard-Team, das neuen Benutzern als Beispiel zur Verfügung gestellt wird.
        </p>
      </div>

      <CreateExampleTeamForm />
    </div>
  )
}


