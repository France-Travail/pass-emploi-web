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

// ── API publique ─────────────────────────────────────────────────────────────

export async function fetchJson(
  path: string,
  reqInit?: RequestInit
): Promise<{ content: any; headers: Headers }> {
  const response = await callFetch(path, reqInit)

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return { content: await response.json(), headers: response.headers }
  }
  return { content: undefined, headers: response.headers }
}

export async function fetchNoContent(
  path: string,
  reqInit?: RequestInit
): Promise<void> {
  await callFetch(path, reqInit)
}

// ── Implémentation ───────────────────────────────────────────────────────────

async function callFetch(
  path: string,
  reqInit?: RequestInit
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
    const error = new UnexpectedError((e as Error).message || 'Unexpected error')
    rootLogger.error(
      {
        event: {
          action: 'external_api_call',
          outcome: 'failure',
          duration: nsFrom(startTime),
        },
        'log.logger': 'ApiClient',
        http: { request: { method } },
        ...(parsedUrl
          ? { url: { full: parsedUrl.href, path: parsedUrl.pathname, domain: parsedUrl.hostname } }
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
    await handleHttpError(response, { method, parsedUrl, duration })
  } else {
    rootLogger.info(
      {
        event: { action: 'external_api_call', outcome: 'success', duration },
        'log.logger': 'ApiClient',
        http: {
          request: { method },
          response: { status_code: response.status },
        },
        ...(parsedUrl
          ? { url: { full: parsedUrl.href, path: parsedUrl.pathname, domain: parsedUrl.hostname } }
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
  }: { method: string; parsedUrl: URL | undefined; duration: number }
): Promise<void> {
  if (response.status === 401) {
    const logoutUrl = '/api/auth/federated-logout'
    if (typeof window !== 'undefined') {
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
      'log.logger': 'ApiClient',
      http: {
        request: { method },
        response: { status_code: response.status },
      },
      ...(parsedUrl
        ? { url: { full: parsedUrl.href, path: parsedUrl.pathname, domain: parsedUrl.hostname } }
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
