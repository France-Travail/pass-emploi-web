import pino from 'pino'

import { mixinMergeStrategy } from 'utils/monitoring/ecsHelpers'
import { requestContext } from 'utils/monitoring/requestContext'

let apm: any
if (typeof window === 'undefined') {
  apm = require('elastic-apm-node')
}

export const rootLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  messageKey: 'message',
  formatters: {
    level(label: string) {
      return { 'log.level': label }
    },
  },
  mixin() {
    const store = requestContext.getStore()
    const traceIds: Record<string, string> = apm?.currentTraceIds ?? {}

    return {
      ...(Object.keys(traceIds).length > 0
        ? {
            'trace.id': traceIds['trace.id'],
            'transaction.id': traceIds['transaction.id'],
          }
        : {}),
      ...(store?.get('HTTP_REQUEST_ID')
        ? { 'http.request.id': store.get('HTTP_REQUEST_ID') }
        : {}),
      ...(store?.get('USER') ? { user: store.get('USER') } : {}),
    }
  },
  mixinMergeStrategy,
})
