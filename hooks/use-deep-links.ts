'use client'

// React imports
import { useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Client logic imports
import { parseDeepLink, isDeepLink } from '@/lib/deep-links'

interface UseDeepLinksOptions {
  /**
   * Callback der aufgerufen wird, wenn ein Deep Link erkannt wird
   */
  onDeepLink?: (path: string, params: Record<string, string>) => void

  /**
   * Automatisch zu Deep Links navigieren
   */
  autoNavigate?: boolean
}

/**
 * Hook zur Verarbeitung von Deep Links in Client-Komponenten
 */
export function useDeepLinks(options: UseDeepLinksOptions = {}) {
  const { onDeepLink, autoNavigate = true } = options
  const router = useRouter()
  const searchParams = useSearchParams()

  /**
   * Navigiert zu einem Pfad innerhalb der App
   */
  const navigateToPath = useCallback(
    (path: string, params?: Record<string, string>) => {
      let targetUrl = path

      if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString()
        targetUrl = `${path}?${queryString}`
      }

      router.push(targetUrl)
    },
    [router]
  )

  /**
   * Verarbeitet einen Deep Link
   */
  const handleDeepLink = useCallback(
    (url: string) => {
      const parsed = parseDeepLink(url)

      if (parsed) {
        const { path, params } = parsed

        // Callback aufrufen
        if (onDeepLink) {
          onDeepLink(path, params)
        }

        // Automatisch navigieren
        if (autoNavigate) {
          navigateToPath(path, params)
        }

        return true
      }

      return false
    },
    [onDeepLink, autoNavigate, navigateToPath]
  )

  /**
   * Prüft URL-Parameter auf Deep Link-Informationen
   */
  useEffect(() => {
    // Prüfe auf 'deep_link' Parameter
    const deepLinkUrl = searchParams.get('deep_link')

    if (deepLinkUrl && isDeepLink(deepLinkUrl)) {
      handleDeepLink(deepLinkUrl)
    }

    // Prüfe auf 'redirect' Parameter (häufig von OAuth verwendet)
    const redirect = searchParams.get('redirect')

    if (redirect && autoNavigate) {
      navigateToPath(redirect)
    }
  }, [searchParams, handleDeepLink, autoNavigate, navigateToPath])

  return {
    handleDeepLink,
    navigateToPath,
    isDeepLink,
  }
}

/**
 * Hook zum Generieren von shareable Deep Links
 */
export function useShareDeepLink() {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  const shareLink = useCallback(
    async (url: string, title?: string, text?: string) => {
      if (canShare) {
        try {
          await navigator.share({
            title,
            text,
            url,
          })
          return { success: true }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            return { success: false, cancelled: true }
          }
          return { success: false, error: err }
        }
      }

      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        return { success: true, copied: true }
      } catch (err) {
        return { success: false, error: err }
      }
    },
    [canShare]
  )

  return {
    canShare,
    shareLink,
  }
}

