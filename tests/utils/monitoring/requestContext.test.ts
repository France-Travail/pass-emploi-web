/**
 * @jest-environment node
 */
import { requestContext } from 'utils/monitoring/requestContext'

describe('requestContext', () => {
  it('stocke et récupère des valeurs dans le même contexte async', async () => {
    const store = new Map<string, unknown>()
    store.set('HTTP_REQUEST_ID', 'test-uuid-123')

    await requestContext.run(store, async () => {
      expect(requestContext.getStore()?.get('HTTP_REQUEST_ID')).toBe(
        'test-uuid-123'
      )
    })
  })

  it("retourne undefined en dehors d'un contexte", () => {
    expect(requestContext.getStore()).toBeUndefined()
  })

  it('isole les contextes entre requêtes parallèles', async () => {
    const results: string[] = []

    await Promise.all([
      requestContext.run(new Map([['id', 'context-1']]), async () => {
        await new Promise((r) => setTimeout(r, 10))
        results.push(requestContext.getStore()?.get('id') as string)
      }),
      requestContext.run(new Map([['id', 'context-2']]), async () => {
        results.push(requestContext.getStore()?.get('id') as string)
      }),
    ])

    expect(results).toContain('context-1')
    expect(results).toContain('context-2')
  })
})
