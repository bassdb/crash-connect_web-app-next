// UI imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Component imports
import { DeepLinkShareButton } from '@/components/deep-link-share-button'

export default function DeepLinkTestPage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deep Link Test</h1>
          <p className="text-muted-foreground mt-2">
            Teste und validiere Deep Links für iOS und Android
          </p>
        </div>

        <Separator />

        {/* Konfigurations-Status */}
        <Card>
          <CardHeader>
            <CardTitle>Konfigurations-Status</CardTitle>
            <CardDescription>
              Überprüfe die Deep Link Konfiguration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">iOS Universal Links</p>
                <p className="text-xs text-muted-foreground">
                  Apple App Site Association
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Konfiguriert</Badge>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="/.well-known/apple-app-site-association"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Anzeigen
                  </a>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Android App Links</p>
                <p className="text-xs text-muted-foreground">
                  Digital Asset Links
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Konfiguriert</Badge>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="/.well-known/assetlinks.json"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Anzeigen
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test-Links */}
        <Card>
          <CardHeader>
            <CardTitle>Test-Links</CardTitle>
            <CardDescription>
              Klicke auf die Links um Deep Links zu testen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Dashboard */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Dashboard</p>
                  <code className="text-xs text-muted-foreground">
                    /dashboard
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/dashboard">Öffnen</a>
                  </Button>
                  <DeepLinkShareButton
                    path="/dashboard"
                    title="Crash Connect Dashboard"
                    description="Öffne das Dashboard in der App"
                  />
                </div>
              </div>

              {/* Incident erstellen */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Incident erstellen</p>
                  <code className="text-xs text-muted-foreground">
                    /incident/create
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/incident/create">Öffnen</a>
                  </Button>
                  <DeepLinkShareButton
                    path="/incident/create"
                    title="Neuen Incident erstellen"
                    description="Erstelle einen neuen Incident in der App"
                  />
                </div>
              </div>

              {/* Sign In */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Anmelden</p>
                  <code className="text-xs text-muted-foreground">
                    /sign-in
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/sign-in">Öffnen</a>
                  </Button>
                  <DeepLinkShareButton
                    path="/sign-in"
                    title="Bei Crash Connect anmelden"
                    description="Melde dich in der App an"
                  />
                </div>
              </div>

              {/* Team-Einladung */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Team-Einladung (Beispiel)</p>
                  <code className="text-xs text-muted-foreground">
                    /teams/invite?token=test123
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/teams/invite?token=test123">Öffnen</a>
                  </Button>
                  <DeepLinkShareButton
                    path="/teams/invite"
                    params={{ token: 'test123' }}
                    title="Team-Einladung"
                    description="Tritt dem Team bei"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API-Tests */}
        <Card>
          <CardHeader>
            <CardTitle>API-Tests</CardTitle>
            <CardDescription>
              Teste die Deep Link API-Endpunkte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" asChild>
                <a href="/api/deep-link" target="_blank">
                  Deep Link Info anzeigen
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/deep-link/test" target="_blank">
                  Test-Endpunkt anzeigen
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/deep-link/test?platform=ios" target="_blank">
                  iOS-Tests anzeigen
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/deep-link/test?platform=android" target="_blank">
                  Android-Tests anzeigen
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dokumentation */}
        <Card>
          <CardHeader>
            <CardTitle>Dokumentation</CardTitle>
            <CardDescription>
              Weitere Informationen zur Einrichtung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>
                Weitere Informationen zur Konfiguration von Deep Links findest du in der{' '}
                <code className="px-1.5 py-0.5 bg-muted rounded">
                  docs/deep-links-setup.md
                </code>
              </p>

              <div className="space-y-2 pt-4">
                <p className="font-medium">Nächste Schritte:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Apple Team ID in der AASA-Datei eintragen</li>
                  <li>Android Package Name und SHA256 Fingerprint konfigurieren</li>
                  <li>Associated Domains in Xcode hinzufügen</li>
                  <li>Intent Filter in AndroidManifest.xml hinzufügen</li>
                  <li>Deep Links auf echten Geräten testen</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

