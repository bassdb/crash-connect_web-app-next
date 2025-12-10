import { createClient } from '@/server/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default async function IncidentWelcomePage({ 
  params 
}: { 
  params: Promise<{ qr_token: string }> 
}) {
  const { qr_token } = await params
  const supabase = await createClient()
  
  // Server-seitige Token-Verifizierung
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('id, license_plate, qr_token, vehicle_details, created_at')
    .eq('qr_token', qr_token)
    .single()
  
  if (error || !vehicle) {
    console.error('Vehicle not found for qr_token:', qr_token)
    console.error('Error details:', error)
    notFound()
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Schaden melden</CardTitle>
          <CardDescription>
            KFZ mit Kennzeichen <strong>{vehicle.license_plate}</strong> beschädigt?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Helfen Sie dem Fahrzeugbesitzer, indem Sie einen Schadensbericht erstellen.
            Der Vorgang dauert ca. 3-5 Minuten.
          </p>
          <Button asChild className="w-full">
            <Link href={`/incident/${qr_token}/step-01`}>
              Meldung starten
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

