import { kv } from '@vercel/kv'
import type { RateLimitResult } from '@/types/incident-types'

export async function checkRateLimit(
  identifier: string, 
  limit: number, 
  windowInSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:incident:${identifier}`
  const count = await kv.incr(key)
  
  if (count === 1) {
    await kv.expire(key, windowInSeconds)
  }
  
  const ttl = await kv.ttl(key)
  
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: ttl
  }
}

// Helper für IP-Extraktion aus Headers
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

