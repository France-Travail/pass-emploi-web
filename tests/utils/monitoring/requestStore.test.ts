/**
 * @jest-environment node
 */

const reactCacheOk = () => ({
  cache: (fn: () => unknown) => {
    const result = fn()
    return () => result
  },
})

const reactCacheKo = () => ({
  cache: () => () => {
    throw new Error('Cannot use cache outside RSC')
  },
})

describe('requestStore', () => {
  describe('requestId', () => {
    it('getPerRequestId retourne undefined si rien n’a été initialisé', () => {
      jest.isolateModules(() => {
        const { getPerRequestId } = require('utils/monitoring/requestStore')
        expect(getPerRequestId()).toBeUndefined()
      })
    })

    it('getPerRequestId retourne l’id après initRequestId', () => {
      jest.isolateModules(() => {
        jest.mock('react', reactCacheOk)

        const {
          initRequestId,
          getPerRequestId,
        } = require('utils/monitoring/requestStore')
        initRequestId('req-abc-123')
        expect(getPerRequestId()).toBe('req-abc-123')
      })
    })

    it('getPerRequestId ne jette pas quand React.cache lève une erreur (hors RSC)', () => {
      jest.isolateModules(() => {
        jest.mock('react', reactCacheKo)

        const { getPerRequestId } = require('utils/monitoring/requestStore')
        expect(() => getPerRequestId()).not.toThrow()
        expect(getPerRequestId()).toBeUndefined()
      })
    })

    it('initRequestId ne jette pas quand React.cache lève une erreur (hors RSC)', () => {
      jest.isolateModules(() => {
        jest.mock('react', reactCacheKo)

        const { initRequestId } = require('utils/monitoring/requestStore')
        expect(() => initRequestId('req-abc-123')).not.toThrow()
      })
    })
  })

  describe('user', () => {
    const user = { id: 'conseiller-1', type: 'CONSEILLER', structure: 'MILO' }

    it('getPerRequestUser retourne undefined si rien n’a été initialisé', () => {
      jest.isolateModules(() => {
        const { getPerRequestUser } = require('utils/monitoring/requestStore')
        expect(getPerRequestUser()).toBeUndefined()
      })
    })

    it('getPerRequestUser retourne le user après initRequestUser', () => {
      jest.isolateModules(() => {
        jest.mock('react', reactCacheOk)

        const {
          initRequestUser,
          getPerRequestUser,
        } = require('utils/monitoring/requestStore')
        initRequestUser(user)
        expect(getPerRequestUser()).toEqual(user)
      })
    })

    it('initRequestUser et getPerRequestUser ne jettent pas hors RSC', () => {
      jest.isolateModules(() => {
        jest.mock('react', reactCacheKo)

        const {
          initRequestUser,
          getPerRequestUser,
        } = require('utils/monitoring/requestStore')
        expect(() => initRequestUser(user)).not.toThrow()
        expect(getPerRequestUser()).toBeUndefined()
      })
    })
  })
})
