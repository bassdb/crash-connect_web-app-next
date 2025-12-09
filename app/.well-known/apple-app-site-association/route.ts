import { NextResponse } from 'next/server'

// Apple App Site Association für iOS Universal Links
// https://developer.apple.com/documentation/xcode/supporting-associated-domains

export async function GET() {
  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          // Ersetze mit deiner Apple Team ID und Bundle ID
          appID: 'TEAM_ID.com.crashconnect.app',
          paths: [
            '/incident/*',
            '/auth/*',
            '/sign-in',
            '/sign-up',
            '/dashboard',
            '/teams/*',
            '/protected/*',
            '/auth-feedback',
            '/auth-message',
          ],
        },
      ],
    },
    webcredentials: {
      apps: ['TEAM_ID.com.crashconnect.app'],
    },
  }

  return new NextResponse(JSON.stringify(aasa), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

