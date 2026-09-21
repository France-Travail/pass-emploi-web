/**
 * @jest-environment node
 */
jest.mock('elastic-apm-node', () => ({
  currentTraceIds: {
    'trace.id': 'mock-trace-id',
    'transaction.id': 'mock-tx-id',
  },
}))
jest.mock('utils/monitoring/requestStore', () => ({
  getPerRequestId: jest.fn(),
  getPerRequestUser: jest.fn(),
}))

import { Writable } from 'stream'

import pino from 'pino'

import { mixinMergeStrategy } from 'utils/monitoring/ecsHelpers'
import { buildLogContext } from 'utils/monitoring/logger'
import { requestContext } from 'utils/monitoring/requestContext'
import {
  getPerRequestId,
  getPerRequestUser,
} from 'utils/monitoring/requestStore'

const mockGetPerRequestId = getPerRequestId as jest.Mock
const mockGetPerRequestUser = getPerRequestUser as jest.Mock

// Logger avec la config de rootLogger (mixin réel) mais qui écrit dans un
// buffer pour inspecter la sortie JSON.
function makeTestLogger() {
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
      mixin: buildLogContext,
      mixinMergeStrategy,
    },
    stream
  )
  return { logger, lines }
}

const user = { id: 'conseiller-1', type: 'CONSEILLER', structure: 'MILO' }

describe('rootLogger config', () => {
  beforeEach(() => {
    mockGetPerRequestId.mockReturnValue(undefined)
    mockGetPerRequestUser.mockReturnValue(undefined)
  })

  it('formate level en ECS (pas "log.level")', () => {
    const { logger, lines } = makeTestLogger()
    logger.info({}, 'test')
    const parsed = JSON.parse(lines[0])
    expect(parsed.level).toBe('info')
    expect(parsed['log.level']).toBeUndefined()
  })

  it('injecte trace.id depuis APM', () => {
    const { logger, lines } = makeTestLogger()
    logger.info({}, 'test')
    const parsed = JSON.parse(lines[0])
    expect(parsed['trace.id']).toBe('mock-trace-id')
  })

  describe('dans le contexte AsyncLocalStorage', () => {
    it('injecte http.request.id depuis le store', () => {
      const store = new Map<string, unknown>([
        ['HTTP_REQUEST_ID', 'req-uuid-abc'],
      ])
      requestContext.run(store, () => {
        const { logger, lines } = makeTestLogger()
        logger.info({}, 'test')
        const parsed = JSON.parse(lines[0])
        expect(parsed.http.request.id).toBe('req-uuid-abc')
      })
    })

    it('injecte user.* depuis le store sans écraser les autres champs (deep merge)', () => {
      const store = new Map<string, unknown>([['USER', user]])
      requestContext.run(store, () => {
        const { logger, lines } = makeTestLogger()
        logger.info({ user: { extra: 'field' } }, 'test')
        const parsed = JSON.parse(lines[0])
        expect(parsed.user.id).toBe('conseiller-1')
        expect(parsed.user.extra).toBe('field')
      })
    })
  })

  describe('hors contexte AsyncLocalStorage (rendu RSC)', () => {
    it('injecte http.request.id depuis le requestStore', () => {
      mockGetPerRequestId.mockReturnValue('react-cache-id-xyz')
      const { logger, lines } = makeTestLogger()
      logger.info({}, 'test')
      const parsed = JSON.parse(lines[0])
      expect(parsed.http.request.id).toBe('react-cache-id-xyz')
    })

    it('injecte user.* depuis le requestStore', () => {
      mockGetPerRequestUser.mockReturnValue(user)
      const { logger, lines } = makeTestLogger()
      logger.info({}, 'test')
      const parsed = JSON.parse(lines[0])
      expect(parsed.user).toEqual(user)
    })

    it('n’injecte ni request.id ni user si rien n’est disponible', () => {
      const { logger, lines } = makeTestLogger()
      logger.info({}, 'test')
      const parsed = JSON.parse(lines[0])
      expect(parsed.http).toBeUndefined()
      expect(parsed.user).toBeUndefined()
    })
  })
})
