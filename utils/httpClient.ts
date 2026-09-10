import { redirect } from 'next/navigation'

import { toEcsError } from 'utils/monitoring/ecsHelpers'
import { captureError } from 'utils/monitoring/elastic'
import { rootLogger } from 'utils/monitoring/logger'

// ── Types publics ────────────────────────────────────────────────────────────

export class ApiError implements Error {
  name = 'API_ERROR'

  constructor(
    readonly statusCode: number,
    readonly message: string
  ) {}
}

export class UnexpectedError implements Error {
  name = 'UNEXPECTED_ERROR'

  constructor(readonly message: string) {}
}

export interface FetchOptions {
  // Sur 401, déconnecte le conseiller (redirection federated-logout). true par défaut.
  // Passer false quand le 401 peut venir d'une ressource tierce (ex : token France
  // Travail du bénéficiaire refusé par l'API partenaire) et ne doit donc PAS déconnecter
  // le conseiller : l'appelant reçoit alors une ApiError(401) à traiter lui-même.
  logoutOn401?: boolean
}

// ── API publique ─────────────────────────────────────────────────────────────

export async function fetchJson(
  path: string,
  reqInit?: RequestInit,
  options?: FetchOptions
): Promise<{ content: any; headers: Headers }> {
  const response = await callFetch(path, reqInit, options)

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return { content: await response.json(), headers: response.headers }
  }
  return { content: undefined, headers: response.headers }
}

export async function fetchNoContent(
  path: string,
  reqInit?: RequestInit,
  options?: FetchOptions
): Promise<void> {
  await callFetch(path, reqInit, options)
}

// ── Implémentation ───────────────────────────────────────────────────────────

async function callFetch(
  path: string,
  reqInit?: RequestInit,
  options?: FetchOptions
): Promise<Response> {
  const method = reqInit?.method ?? 'GET'
  const startTime = Date.now()

  // Parse URL best-effort (path may be relative in some call sites)
  let parsedUrl: URL | undefined
  try {
    parsedUrl = new URL(path)
  } catch {
    // relative URL — skip domain/path extraction
  }

  let response: Response
  try {
    response = await fetch(path, reqInit)
  } catch (e) {
    const error = new UnexpectedError(
      (e as Error).message || 'Unexpected error'
    )
    rootLogger.error(
      {
        event: {
          action: 'external_api_call',
          outcome: 'failure',
          duration: nsFrom(startTime),
        },
        context: 'ApiClient',
        http: { request: { method } },
        ...(parsedUrl
          ? {
              url: {
                full: parsedUrl.href,
                path: parsedUrl.pathname,
                domain: parsedUrl.hostname,
              },
            }
          : {}),
        error: toEcsError(error),
      },
      'external_api_call'
    )
    captureError(error)
    throw error
  }

  const duration = nsFrom(startTime)

  if (!response.ok) {
    await handleHttpError(response, {
      method,
      parsedUrl,
      duration,
      logoutOn401: options?.logoutOn401 ?? true,
    })
  } else {
    rootLogger.info(
      {
        event: { action: 'external_api_call', outcome: 'success', duration },
        context: 'ApiClient',
        http: {
          request: { method },
          response: { status_code: response.status },
        },
        ...(parsedUrl
          ? {
              url: {
                full: parsedUrl.href,
                path: parsedUrl.pathname,
                domain: parsedUrl.hostname,
              },
            }
          : {}),
      },
      'external_api_call'
    )
  }

  return response
}

async function handleHttpError(
  response: Response,
  {
    method,
    parsedUrl,
    duration,
    logoutOn401,
  }: {
    method: string
    parsedUrl: URL | undefined
    duration: number
    logoutOn401: boolean
  }
): Promise<void> {
  if (response.status === 401 && logoutOn401) {
    const logoutUrl = '/api/auth/federated-logout'
    if (typeof window !== 'undefined') {
      // Route API qui redirige vers l'IdP : une navigation complète est voulue, pas une navigation client vers une page Next.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(logoutUrl)
    } else {
      redirect(logoutUrl)
    }
  }

  const json: any = await response.json()
  const message = json?.message || response.statusText
  const error = new ApiError(response.status, message)
  const level = response.status >= 500 ? 'error' : 'info'

  rootLogger[level](
    {
      event: { action: 'external_api_call', outcome: 'failure', duration },
      context: 'ApiClient',
      http: {
        request: { method },
        response: { status_code: response.status },
      },
      ...(parsedUrl
        ? {
            url: {
              full: parsedUrl.href,
              path: parsedUrl.pathname,
              domain: parsedUrl.hostname,
            },
          }
        : {}),
      error: toEcsError(error),
    },
    'external_api_call'
  )

  captureError(error)
  throw error
}

function nsFrom(startMs: number): number {
  return (Date.now() - startMs) * 1_000_000
}
