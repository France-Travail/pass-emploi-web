/**
 * @jest-environment node
 */
jest.mock('elastic-apm-node', () => ({
  currentTraceIds: {
    'trace.id': 'mock-trace-id',
    'transaction.id': 'mock-tx-id',
  },
}))

import { Writable } from 'stream'

import pino from 'pino'

import { mixinMergeStrategy } from 'utils/monitoring/ecsHelpers'

// Helper : crée un logger avec la même config que rootLogger mais écrit dans
// un buffer pour pouvoir inspecter la sortie JSON.
function makeTestLogger(store: Map<string, unknown>) {
  const apm = require('elastic-apm-node')

  const lines: string[] = []
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString().trim())
      cb()
    },
  })

  const logger = pino(
    {
      level: 'info',
      formatters: { level: (label) => ({ level: label }) },
      mixin() {
        const traceIds: Record<string, string> = apm?.currentTraceIds ?? {}
        return {
          ...(Object.keys(traceIds).length > 0
            ? {
                'trace.id': traceIds['trace.id'],
                'transaction.id': traceIds['transaction.id'],
              }
            : {}),
          ...(store.get('HTTP_REQUEST_ID')
            ? {
                http: {
                  request: { id: store.get('HTTP_REQUEST_ID') },
                },
              }
            : {}),
          ...(store.get('USER') ? { user: store.get('USER') } : {}),
        }
      },
      mixinMergeStrategy,
    },
    stream
  )
  return { logger, lines }
}

describe('rootLogger config', () => {
  it('formate level en ECS (pas "log.level")', () => {
    const store = new Map<string, unknown>()
    const { logger, lines } = makeTestLogger(store)
    logger.info({}, 'test')
    const parsed = JSON.parse(lines[0])
    expect(parsed.level).toBe('info')
    expect(parsed['log.level']).toBeUndefined()
  })

  it('injecte http.request.id depuis le store', () => {
    const store = new Map<string, unknown>([
      ['HTTP_REQUEST_ID', 'req-uuid-abc'],
    ])
    const { logger, lines } = makeTestLogger(store)
    logger.info({}, 'test')
    const parsed = JSON.parse(lines[0])
    expect(parsed.http.request.id).toBe('req-uuid-abc')
  })

  it('injecte trace.id depuis APM', () => {
    const store = new Map<string, unknown>()
    const { logger, lines } = makeTestLogger(store)
    logger.info({}, 'test')
    const parsed = JSON.parse(lines[0])
    expect(parsed['trace.id']).toBe('mock-trace-id')
  })

  it('injecte user.* depuis le store sans écraser les autres champs (deep merge)', () => {
    const store = new Map<string, unknown>([
      ['USER', { id: 'conseiller-1', type: 'CONSEILLER', structure: 'MILO' }],
    ])
    const { logger, lines } = makeTestLogger(store)
    logger.info({ user: { extra: 'field' } }, 'test')
    const parsed = JSON.parse(lines[0])
    expect(parsed.user.id).toBe('conseiller-1')
    expect(parsed.user.extra).toBe('field')
  })

  it('injecte http.request.id depuis getPerRequestId quand AsyncLocalStorage est vide', () => {
    const lines: string[] = []
    const stream = new Writable({
      write(chunk, _enc, cb) {
        lines.push(chunk.toString().trim())
        cb()
      },
    })

    const mockGetPerRequestId = jest.fn(() => 'react-cache-id-xyz')
    const logger = pino(
      {
        level: 'info',
        formatters: { level: (label: string) => ({ level: label }) },
        mixin() {
          const emptyStore = new Map<string, unknown>()
          const traceIds: Record<string, string> = {}
          const requestId =
            (emptyStore.get('HTTP_REQUEST_ID') as string | undefined) ??
            mockGetPerRequestId()
          return {
            ...(Object.keys(traceIds).length > 0
              ? {
                  'trace.id': traceIds['trace.id'],
                  'transaction.id': traceIds['transaction.id'],
                }
              : {}),
            ...(requestId ? { http: { request: { id: requestId } } } : {}),
          }
        },
        mixinMergeStrategy,
      },
      stream
    )

    logger.info({}, 'test')
    const parsed = JSON.parse(lines[0])
    expect(parsed.http.request.id).toBe('react-cache-id-xyz')
    expect(mockGetPerRequestId).toHaveBeenCalled()
  })
})
