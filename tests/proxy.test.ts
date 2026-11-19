/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

import { proxy } from 'proxy'

describe('proxy', () => {
  const request = new NextRequest('https://example.com/mes-jeunes', {
    headers: { cookie: 'session=secret', authorization: 'Bearer token' },
  })

  it('transmet le chemin courant aux composants serveur', () => {
    // When
    const response = proxy(request)

    // Then
    expect(response.headers.get('x-middleware-request-x-current-path')).toEqual(
      '/mes-jeunes'
    )
    expect(
      response.headers.get('x-middleware-override-headers')?.split(',')
    ).toEqual(expect.arrayContaining(['x-current-path', 'cookie']))
  })

  it('ne renvoie pas les headers de la requête dans la réponse', () => {
    // When
    const response = proxy(request)

    // Then
    expect(response.headers.get('cookie')).toBeNull()
    expect(response.headers.get('authorization')).toBeNull()
    expect(response.headers.get('x-current-path')).toBeNull()
  })
})
