import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default async function SuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ qr_token: string }>
  searchParams: Promise<{ incidentId?: string }>
}) {
  const { qr_token } = await params
  const { incidentId } = await searchParams
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Meldung erfolgreich übermittelt!</CardTitle>
          <CardDescription>
            Vielen Dank für Ihre Meldung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ihre Schadenmeldung wurde erfolgreich erstellt und der Fahrzeugbesitzer wurde benachrichtigt.
            </p>
            {incidentId && (
              <p className="text-sm font-mono text-muted-foreground">
                Meldungs-ID: {incidentId}
              </p>
            )}
          </div>
          
          <div className="space-y-2 pt-4">
            <p className="text-sm font-medium">Nächste Schritte:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Der Fahrzeugbesitzer wurde per E-Mail benachrichtigt</li>
              <li>Sie erhalten eine Bestätigung per E-Mail (falls angegeben)</li>
              <li>Bei Fragen können Sie sich mit der Meldungs-ID an uns wenden</li>
            </ul>
          </div>
          
          <Button asChild className="w-full mt-6">
            <Link href="/">
              Zur Startseite
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

