import { NextRequest, NextResponse } from 'next/server'

// API-Endpunkt für Deep Link Handling und Testing
// Kann für Debugging und Fallback-Handling verwendet werden

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  const action = searchParams.get('action')

  // Basis-Informationen über Deep Links
  const deepLinkInfo = {
    ios: {
      universalLinks: '/.well-known/apple-app-site-association',
      scheme: 'crashconnect://',
      documentation: 'https://developer.apple.com/documentation/xcode/supporting-associated-domains',
    },
    android: {
      appLinks: '/.well-known/assetlinks.json',
      scheme: 'crashconnect://',
      documentation: 'https://developer.android.com/training/app-links',
    },
    supportedPaths: [
      '/incident/*',
      '/auth/*',
      '/sign-in',
      '/sign-up',
      '/dashboard',
      '/teams/*',
      '/protected/*',
    ],
  }

  // Wenn ein spezifischer Pfad angegeben wurde, leite weiter
  if (path) {
    return NextResponse.redirect(new URL(path, request.url))
  }

  // Wenn eine Aktion angegeben wurde
  if (action) {
    switch (action) {
      case 'test-ios':
        return NextResponse.json({
          message: 'iOS Universal Link Test',
          testUrl: `${request.nextUrl.origin}/incident/test`,
          instructions:
            'Öffne diese URL auf einem iOS-Gerät mit installierter App',
        })
      case 'test-android':
        return NextResponse.json({
          message: 'Android App Link Test',
          testUrl: `${request.nextUrl.origin}/incident/test`,
          instructions:
            'Öffne diese URL auf einem Android-Gerät mit installierter App',
        })
      default:
        break
    }
  }

  // Standard-Antwort mit Informationen
  return NextResponse.json(deepLinkInfo, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

// POST-Endpunkt für Deep Link Validierung
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, platform } = body

    if (!url || !platform) {
      return NextResponse.json(
        { error: 'URL und Platform sind erforderlich' },
        { status: 400 }
      )
    }

    // Validiere URL-Format
    const urlPattern = /^(https?:\/\/|crashconnect:\/\/)/
    if (!urlPattern.test(url)) {
      return NextResponse.json(
        { error: 'Ungültiges URL-Format' },
        { status: 400 }
      )
    }

    // Bestimme den Ziel-Pfad
    let targetPath = '/'
    try {
      const parsedUrl = new URL(url.replace('crashconnect://', 'https://'))
      targetPath = parsedUrl.pathname + parsedUrl.search
    } catch (err) {
      return NextResponse.json(
        { error: 'URL konnte nicht geparst werden' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      platform,
      originalUrl: url,
      targetPath,
      webUrl: `${request.nextUrl.origin}${targetPath}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    )
  }
}

