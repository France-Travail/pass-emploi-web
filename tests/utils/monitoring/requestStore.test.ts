/**
 * @jest-environment node
 */

describe('requestStore', () => {
  it('getPerRequestId retourne undefined si rien n’a été initialisé', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getPerRequestId } = require('utils/monitoring/requestStore')
      expect(getPerRequestId()).toBeUndefined()
    })
  })

  it('getPerRequestId retourne l’id après initRequestId', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { initRequestId, getPerRequestId } = require('utils/monitoring/requestStore')
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getPerRequestId } = require('utils/monitoring/requestStore')
      expect(() => getPerRequestId()).not.toThrow()
      expect(getPerRequestId()).toBeUndefined()
    })
  })
})
