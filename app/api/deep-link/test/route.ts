import { NextRequest, NextResponse } from 'next/server'

/**
 * Test-Endpunkt für Deep Links
 * Dieser Endpunkt kann verwendet werden, um Deep Links zu testen
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get('platform') || 'all'
  const testPath = searchParams.get('path') || '/dashboard'

  const baseUrl = request.nextUrl.origin

  const testResults = {
    timestamp: new Date().toISOString(),
    baseUrl,
    platform,
    tests: {
      ios: {
        name: 'iOS Universal Links',
        configUrl: `${baseUrl}/.well-known/apple-app-site-association`,
        testUrl: `${baseUrl}${testPath}`,
        instructions: [
          '1. Öffne Safari auf einem iOS-Gerät',
          '2. Navigiere zur Test-URL',
          '3. Tippe auf den Link',
          '4. Die App sollte sich öffnen (wenn installiert)',
        ],
        validation:
          'Teste mit: xcrun simctl openurl booted "URL"',
      },
      android: {
        name: 'Android App Links',
        configUrl: `${baseUrl}/.well-known/assetlinks.json`,
        testUrl: `${baseUrl}${testPath}`,
        instructions: [
          '1. Öffne Chrome auf einem Android-Gerät',
          '2. Navigiere zur Test-URL',
          '3. Tippe auf den Link',
          '4. Die App sollte sich öffnen (wenn installiert)',
        ],
        validation:
          'Teste mit: adb shell am start -W -a android.intent.action.VIEW -d "URL" com.crashconnect.app',
      },
      customScheme: {
        name: 'Custom URL Scheme',
        testUrl: `crashconnect://${testPath.startsWith('/') ? testPath.slice(1) : testPath}`,
        instructions: [
          '1. Öffne einen Browser oder App',
          '2. Navigiere zur Custom Scheme URL',
          '3. Die App sollte sich direkt öffnen',
        ],
        note: 'Custom URL Schemes funktionieren nicht im Web, nur in nativen Apps',
      },
    },
    quickTests: [
      {
        name: 'Dashboard öffnen',
        universalLink: `${baseUrl}/dashboard`,
        customScheme: 'crashconnect://dashboard',
      },
      {
        name: 'Incident erstellen',
        universalLink: `${baseUrl}/incident/create`,
        customScheme: 'crashconnect://incident/create',
      },
      {
        name: 'Sign In',
        universalLink: `${baseUrl}/sign-in`,
        customScheme: 'crashconnect://sign-in',
      },
      {
        name: 'Team-Einladung',
        universalLink: `${baseUrl}/teams/invite?token=test123`,
        customScheme: 'crashconnect://teams/invite?token=test123',
      },
    ],
  }

  // Wenn ein spezifischer Test angefordert wurde
  if (platform === 'ios') {
    return NextResponse.json(testResults.tests.ios)
  }

  if (platform === 'android') {
    return NextResponse.json(testResults.tests.android)
  }

  // Alle Tests zurückgeben
  return NextResponse.json(testResults, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

