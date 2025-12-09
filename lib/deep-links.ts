// Deep Link Utility-Funktionen

export const DEEP_LINK_SCHEME = 'crashconnect'

/**
 * Erstellt eine Deep Link URL für die App
 */
export function createDeepLink(path: string, params?: Record<string, string>): string {
  const baseUrl = `${DEEP_LINK_SCHEME}://${path.startsWith('/') ? path.slice(1) : path}`
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    return `${baseUrl}?${searchParams.toString()}`
  }
  
  return baseUrl
}

/**
 * Erstellt eine Universal Link URL (für iOS/Android)
 */
export function createUniversalLink(
  domain: string,
  path: string,
  params?: Record<string, string>
): string {
  const baseUrl = `https://${domain}${path.startsWith('/') ? path : `/${path}`}`
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    return `${baseUrl}?${searchParams.toString()}`
  }
  
  return baseUrl
}

/**
 * Deep Link-Typen für verschiedene App-Bereiche
 */
export const DeepLinks = {
  // Incident-Flows
  incident: {
    create: (incidentId?: string) =>
      createDeepLink('/incident/create', incidentId ? { id: incidentId } : undefined),
    view: (incidentId: string) =>
      createDeepLink('/incident/view', { id: incidentId }),
    report: () => createDeepLink('/incident/report'),
  },

  // Authentication
  auth: {
    signIn: (redirect?: string) =>
      createDeepLink('/sign-in', redirect ? { redirect } : undefined),
    signUp: (redirect?: string) =>
      createDeepLink('/sign-up', redirect ? { redirect } : undefined),
    magicLink: (token?: string) =>
      createDeepLink('/sign-in-magic-link', token ? { token } : undefined),
    resetPassword: (token?: string) =>
      createDeepLink('/forgot-password', token ? { token } : undefined),
  },

  // Teams
  teams: {
    view: (teamId: string) => createDeepLink('/teams/view', { id: teamId }),
    invite: (inviteToken: string) =>
      createDeepLink('/teams/invite', { token: inviteToken }),
    create: () => createDeepLink('/teams/create'),
  },

  // Dashboard
  dashboard: {
    home: () => createDeepLink('/dashboard'),
    protected: () => createDeepLink('/protected'),
  },

  // User Account
  account: {
    profile: () => createDeepLink('/account'),
    settings: () => createDeepLink('/account/settings'),
  },
}

/**
 * Universal Links (für Web-Fallback)
 */
export function createUniversalLinks(domain: string) {
  return {
    incident: {
      create: (incidentId?: string) =>
        createUniversalLink(domain, '/incident/create', incidentId ? { id: incidentId } : undefined),
      view: (incidentId: string) =>
        createUniversalLink(domain, '/incident/view', { id: incidentId }),
      report: () => createUniversalLink(domain, '/incident/report'),
    },

    auth: {
      signIn: (redirect?: string) =>
        createUniversalLink(domain, '/sign-in', redirect ? { redirect } : undefined),
      signUp: (redirect?: string) =>
        createUniversalLink(domain, '/sign-up', redirect ? { redirect } : undefined),
      magicLink: (token?: string) =>
        createUniversalLink(domain, '/sign-in-magic-link', token ? { token } : undefined),
    },

    teams: {
      view: (teamId: string) =>
        createUniversalLink(domain, '/teams/view', { id: teamId }),
      invite: (inviteToken: string) =>
        createUniversalLink(domain, '/teams/invite', { token: inviteToken }),
    },

    dashboard: {
      home: () => createUniversalLink(domain, '/dashboard'),
    },
  }
}

/**
 * Erkennt, ob die App über einen Deep Link geöffnet wurde
 */
export function isDeepLink(url: string): boolean {
  return url.startsWith(`${DEEP_LINK_SCHEME}://`)
}

/**
 * Parsed einen Deep Link und gibt den Pfad und Parameter zurück
 */
export function parseDeepLink(url: string): {
  path: string
  params: Record<string, string>
} | null {
  if (!isDeepLink(url)) {
    return null
  }

  try {
    const parsedUrl = new URL(url.replace(`${DEEP_LINK_SCHEME}://`, 'https://'))
    const params: Record<string, string> = {}

    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value
    })

    return {
      path: parsedUrl.pathname,
      params,
    }
  } catch {
    return null
  }
}

