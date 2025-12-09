import { NextResponse } from 'next/server'

// Digital Asset Links für Android App Links
// https://developer.android.com/training/app-links/verify-android-applinks

export async function GET() {
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        // Ersetze mit deinem Android Package Name und SHA256 Fingerprint
        package_name: 'com.crashconnect.app',
        sha256_cert_fingerprints: [
          // Füge hier deine SHA256 Fingerprints hinzu
          // Erhalte sie mit: keytool -list -v -keystore my-release-key.keystore
          'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99',
        ],
      },
    },
  ]

  return new NextResponse(JSON.stringify(assetlinks), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

