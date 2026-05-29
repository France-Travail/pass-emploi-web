/**
 * @jest-environment node
 */
import { Session } from 'next-auth'

jest.mock('utils/auth/auth', () => ({
  getSessionServerSide: jest.fn(),
}))
jest.mock('utils/auth/authenticator', () => ({
  RefreshAccessTokenError: 'RefreshAccessTokenError',
}))
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({ get: jest.fn().mockReturnValue('/') }),
}))
jest.mock('elastic-apm-node', () => ({
  setUserContext: jest.fn(),
}))

import { getSessionServerSide } from 'utils/auth/auth'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { requestContext } from 'utils/monitoring/requestContext'

const mockGetSessionServerSide = getSessionServerSide as jest.Mock

function makeSession(overrides: Partial<Session['user']> = {}): Session {
  return {
    user: {
      id: 'conseiller-uuid',
      structure: 'MILO',
      estConseiller: true,
      estSuperviseur: false,
      name: 'Jean Dupont',
      email: 'jean@example.com',
      ...overrides,
    },
    accessToken: 'token-abc',
    error: '',
    expires: '9999-01-01',
  } as unknown as Session
}

describe('getMandatorySessionServerSide', () => {
  it('enrichit le RequestContext avec user.id, type et structure', async () => {
    mockGetSessionServerSide.mockResolvedValue(makeSession())

    const store = new Map<string, unknown>()
    await requestContext.run(store, async () => {
      await getMandatorySessionServerSide()
      const user = store.get('USER') as Record<string, unknown>
      expect(user).toEqual({
        id: 'conseiller-uuid',
        type: 'CONSEILLER',
        structure: 'MILO',
      })
    })
  })

  it("n'écrit USER qu'une seule fois si appelé plusieurs fois", async () => {
    mockGetSessionServerSide.mockResolvedValue(makeSession())

    const store = new Map<string, unknown>()
    await requestContext.run(store, async () => {
      await getMandatorySessionServerSide()
      store.set('USER', { id: 'already-set' }) // simule 2e appel
      await getMandatorySessionServerSide()
      expect((store.get('USER') as Record<string, unknown>).id).toBe(
        'already-set'
      )
    })
  })
})
