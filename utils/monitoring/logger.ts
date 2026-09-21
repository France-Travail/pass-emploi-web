import pino from 'pino'

import { mixinMergeStrategy } from './ecsHelpers'
import { requestContext } from './requestContext'
import { getPerRequestId, getPerRequestUser } from './requestStore'

let apm: any
if (typeof window === 'undefined') {
  apm = require('elastic-apm-node')
}

export function buildLogContext(): Record<string, unknown> {
  const store = requestContext.getStore()
  const traceIds: Record<string, string> = apm?.currentTraceIds ?? {}
  const requestId =
    (store?.get('HTTP_REQUEST_ID') as string | undefined) ?? getPerRequestId()
  const user = store?.get('USER') ?? getPerRequestUser()

  return {
    ...(Object.keys(traceIds).length > 0
      ? {
          'trace.id': traceIds['trace.id'],
          'transaction.id': traceIds['transaction.id'],
        }
      : {}),
    ...(requestId ? { http: { request: { id: requestId } } } : {}),
    ...(user ? { user } : {}),
  }
}

export const rootLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level(label: string) {
      return { level: label }
    },
  },
  mixin: buildLogContext,
  mixinMergeStrategy,
})
