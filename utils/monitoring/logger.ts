import pino from 'pino'

import { mixinMergeStrategy } from './ecsHelpers'
import { requestContext } from './requestContext'
import { getPerRequestId } from './requestStore'

let apm: any
if (typeof window === 'undefined') {
  apm = require('elastic-apm-node')
}

export const rootLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level(label: string) {
      return { level: label }
    },
  },
  mixin() {
    const store = requestContext.getStore()
    const traceIds: Record<string, string> = apm?.currentTraceIds ?? {}
    const requestId =
      (store?.get('HTTP_REQUEST_ID') as string | undefined) ?? getPerRequestId()

    return {
      ...(Object.keys(traceIds).length > 0
        ? {
            'trace.id': traceIds['trace.id'],
            'transaction.id': traceIds['transaction.id'],
          }
        : {}),
      ...(requestId ? { http: { request: { id: requestId } } } : {}),
      ...(store?.get('USER') ? { user: store.get('USER') } : {}),
    }
  },
  mixinMergeStrategy,
})
