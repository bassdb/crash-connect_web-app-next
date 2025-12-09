interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!token) return false
  
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token
        })
      }
    )
    
    const data: TurnstileResponse = await response.json()
    return data.success
  } catch (error) {
    console.error('Turnstile verification failed:', error)
    return false
  }
}

// Honeypot-Check (Feld sollte leer sein)
export function checkHoneypot(value: string | null | undefined): boolean {
  return !value || value.trim() === ''
}

// SMS-Verifizierungscode generieren
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

