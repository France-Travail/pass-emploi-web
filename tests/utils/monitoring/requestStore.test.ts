/**
 * @jest-environment node
 */

describe('requestStore', () => {
  it('getPerRequestId retourne undefined si rien n’a été initialisé', () => {
    jest.isolateModules(() => {
      const { getPerRequestId } = require('utils/monitoring/requestStore')
      expect(getPerRequestId()).toBeUndefined()
    })
  })

  it('getPerRequestId retourne l’id après initRequestId', () => {
    jest.isolateModules(() => {
      jest.mock('react', () => ({
        cache: (fn: () => unknown) => {
          const result = fn()
          return () => result
        },
      }))

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
      jest.mock('react', () => ({
        cache: () => () => {
          throw new Error('Cannot use cache outside RSC')
        },
      }))

      const { getPerRequestId } = require('utils/monitoring/requestStore')
      expect(() => getPerRequestId()).not.toThrow()
      expect(getPerRequestId()).toBeUndefined()
    })
  })

  it('initRequestId ne jette pas quand React.cache lève une erreur (hors RSC)', () => {
    jest.isolateModules(() => {
      jest.mock('react', () => ({
        cache: () => () => {
          throw new Error('Cannot use cache outside RSC')
        },
      }))

      const { initRequestId } = require('utils/monitoring/requestStore')
      expect(() => initRequestId('req-abc-123')).not.toThrow()
    })
  })
})
