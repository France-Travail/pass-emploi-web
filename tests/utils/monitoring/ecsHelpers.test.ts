/**
 * @jest-environment node
 */
import {
  isSensitiveKey,
  mixinMergeStrategy,
  pinoSerializers,
  redactDeep,
  serializeBodyForLog,
  toEcsError,
} from 'utils/monitoring/ecsHelpers'
import { ApiError, UnexpectedError } from 'utils/httpClient'

describe('toEcsError', () => {
  it('convertit une Error JS standard', () => {
    const error = new Error('quelque chose a planté')
    error.name = 'TypeError'
    const result = toEcsError(error)
    expect(result).toEqual({
      type: 'TypeError',
      message: 'quelque chose a planté',
      stack_trace: expect.stringContaining('TypeError'),
    })
  })

  it('convertit une ApiError (implements Error, pas extends)', () => {
    const error = new ApiError(403, 'Vous n\'avez pas le droit')
    const result = toEcsError(error)
    expect(result).toEqual({
      type: 'API_ERROR',
      message: 'Vous n\'avez pas le droit',
    })
  })

  it('convertit une UnexpectedError', () => {
    const error = new UnexpectedError('réseau coupé')
    const result = toEcsError(error)
    expect(result).toEqual({
      type: 'UNEXPECTED_ERROR',
      message: 'réseau coupé',
    })
  })

  it('gère une valeur inconnue (string)', () => {
    const result = toEcsError('erreur inattendue')
    expect(result).toEqual({
      type: 'UnknownError',
      message: 'erreur inattendue',
    })
  })

  it('gère null', () => {
    const result = toEcsError(null)
    expect(result).toEqual({ type: 'UnknownError', message: 'null' })
  })
})

describe('isSensitiveKey', () => {
  it.each([
    'access_token',
    'refresh_token',
    'client_secret',
    'password',
    'Authorization',
    'bearer',
    'api_key',
    'apikey',
    'credential',
    'AUTHORIZATION',
    'subject_token',
  ])('détecte la clé sensible : %s', (key) => {
    expect(isSensitiveKey(key)).toBe(true)
  })

  it.each(['client_id', 'code', 'key', 'grant_type', 'scope', 'user_id'])(
    'ne masque pas la clé non-sensible : %s',
    (key) => {
      expect(isSensitiveKey(key)).toBe(false)
    }
  )
})

describe('redactDeep', () => {
  it('masque les valeurs sensibles au premier niveau', () => {
    const result = redactDeep({
      client_id: 'pass-emploi-web',
      client_secret: 'super-secret',
      grant_type: 'refresh_token',
    })
    expect(result).toEqual({
      client_id: 'pass-emploi-web',
      client_secret: '[Redacted]',
      grant_type: 'refresh_token',
    })
  })

  it('masque les valeurs sensibles en profondeur', () => {
    const result = redactDeep({
      outer: {
        access_token: 'token-value',
        safe_field: 'visible',
      },
    })
    expect(result).toEqual({
      outer: {
        access_token: '[Redacted]',
        safe_field: 'visible',
      },
    })
  })

  it('gère les tableaux', () => {
    const result = redactDeep([{ password: 'secret' }, { name: 'visible' }])
    expect(result).toEqual([{ password: '[Redacted]' }, { name: 'visible' }])
  })

  it('retourne les primitives telles quelles', () => {
    expect(redactDeep('texte')).toBe('texte')
    expect(redactDeep(42)).toBe(42)
    expect(redactDeep(null)).toBeNull()
  })
})

describe('serializeBodyForLog', () => {
  it('sérialise un objet JSON en masquant les secrets', () => {
    const body = JSON.stringify({
      client_id: 'pass-emploi-web',
      client_secret: 'top-secret',
    })
    const result = serializeBodyForLog(body)
    expect(result).toContain('pass-emploi-web')
    expect(result).toContain('[Redacted]')
    expect(result).not.toContain('top-secret')
  })

  it('sérialise URLSearchParams en masquant les secrets', () => {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_secret: 'secret-value',
      refresh_token: 'token-abc',
    })
    const result = serializeBodyForLog(body)
    expect(result).toContain('refresh_token')
    expect(result).not.toContain('secret-value')
    expect(result).not.toContain('token-abc')
  })

  it('tronque les bodies dépassant 4 Ko', () => {
    const longBody = JSON.stringify({ data: 'x'.repeat(5000) })
    const result = serializeBodyForLog(longBody)
    expect(result.length).toBeLessThan(4200)
    expect(result).toContain('[truncated]')
  })

  it('retourne une chaîne vide pour null/undefined', () => {
    expect(serializeBodyForLog(null)).toBe('')
    expect(serializeBodyForLog(undefined)).toBe('')
  })
})

describe('mixinMergeStrategy', () => {
  it('fusionne en profondeur sans écraser les blocs ECS nested', () => {
    const mergeObject = {
      event: { action: 'request_completed' },
      user: { id: 'user-1' },
    }
    const mixinObject = {
      user: { structure: 'MILO' },
      'trace.id': 'abc123',
    }
    const result = mixinMergeStrategy(mergeObject, mixinObject)
    expect(result).toEqual({
      event: { action: 'request_completed' },
      user: { id: 'user-1', structure: 'MILO' },
      'trace.id': 'abc123',
    })
  })

  it('un shallow merge écraserait user — deep merge préserve user.id', () => {
    const mergeObject = { user: { id: 'user-1', type: 'CONSEILLER' } }
    const mixinObject = { user: { structure: 'MILO' } }
    const result = mixinMergeStrategy(mergeObject, mixinObject) as Record<string, any>
    expect(result.user.id).toBe('user-1')
    expect(result.user.structure).toBe('MILO')
  })
})

describe('pinoSerializers', () => {
  it('sérialise req avec method, url, remoteAddress', () => {
    const req = {
      method: 'GET',
      url: '/jeunes',
      remoteAddress: '127.0.0.1',
      extra: 'ignored',
    }
    expect(pinoSerializers.req(req)).toEqual({
      method: 'GET',
      url: '/jeunes',
      remoteAddress: '127.0.0.1',
    })
  })

  it('sérialise res avec statusCode', () => {
    const res = { statusCode: 200, extra: 'ignored' }
    expect(pinoSerializers.res(res)).toEqual({ statusCode: 200 })
  })

  it('sérialise err via toEcsError (Error JS)', () => {
    const err = new Error('boom')
    err.name = 'RangeError'
    const result = pinoSerializers.err(err)
    expect(result).toEqual({
      type: 'RangeError',
      message: 'boom',
      stack_trace: expect.stringContaining('RangeError'),
    })
  })
})
