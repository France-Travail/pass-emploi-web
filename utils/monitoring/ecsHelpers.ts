// Pas d'import depuis utils/httpClient — on utilise du duck typing pour éviter
// la dépendance circulaire (httpClient.ts importera ecsHelpers.ts dans la PR 2).

// ── Types ────────────────────────────────────────────────────────────────────

export interface EcsError {
  type: string
  message: string
  stack_trace?: string
}

// ── toEcsError ───────────────────────────────────────────────────────────────

export function toEcsError(e: unknown): EcsError {
  if (e instanceof Error) {
    return {
      type: e.name || 'Error',
      message: e.message,
      stack_trace: e.stack,
    }
  }
  if (isErrorLike(e)) {
    const err = e as { name?: string; message: string }
    return {
      type: err.name || 'Error',
      message: err.message,
    }
  }
  return {
    type: 'UnknownError',
    message: String(e),
  }
}

function isErrorLike(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'message' in e
}

// ── Redaction ────────────────────────────────────────────────────────────────

const SENSITIVE_KEY_FRAGMENTS = [
  'token',
  'secret',
  'password',
  'authorization',
  'bearer',
  'api_key',
  'apikey',
  'credential',
]
// Exclus volontairement : 'code' (code OAuth), 'key' (clés de config)

export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase()
  return SENSITIVE_KEY_FRAGMENTS.some((fragment) => lower.includes(fragment))
}

export function redactDeep(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj
  if (Array.isArray(obj)) return obj.map(redactDeep)

  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
      key,
      isSensitiveKey(key) ? '[Redacted]' : redactDeep(value),
    ])
  )
}

// ── serializeBodyForLog ──────────────────────────────────────────────────────

const MAX_BODY_BYTES = 4096

export function serializeBodyForLog(body: unknown): string {
  if (body === null || body === undefined) return ''

  try {
    let str: string

    if (body instanceof URLSearchParams) {
      const obj = Object.fromEntries(body.entries())
      str = JSON.stringify(redactDeep(obj))
    } else if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body)
        str = JSON.stringify(redactDeep(parsed))
      } catch {
        str = body
      }
    } else if (typeof body === 'object') {
      str = JSON.stringify(redactDeep(body))
    } else {
      str = String(body)
    }

    return truncate(str, MAX_BODY_BYTES)
  } catch {
    return '[binary]'
  }
}

function truncate(s: string, maxBytes: number): string {
  if (s.length <= maxBytes) return s
  return s.slice(0, maxBytes) + '...[truncated]'
}

// ── mixinMergeStrategy ───────────────────────────────────────────────────────
// Obligatoire : sans deep merge, pino fait un shallow merge qui écrase les
// blocs ECS nested (ex : { user: { id } } + { user: { structure } } → perd id)

export function mixinMergeStrategy(
  mergeObject: Record<string, unknown>,
  mixinObject: Record<string, unknown>
): Record<string, unknown> {
  return deepMerge(mergeObject, mixinObject)
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target }
  for (const [key, value] of Object.entries(source)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>
      )
    } else {
      result[key] = value
    }
  }
  return result
}

// ── pinoSerializers ──────────────────────────────────────────────────────────

export const pinoSerializers = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req(req: any) {
    return {
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res(res: any) {
    return { statusCode: res.statusCode }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err(err: any) {
    return toEcsError(err)
  },
}
