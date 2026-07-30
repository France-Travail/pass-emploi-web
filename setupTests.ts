import { TextDecoder, TextEncoder } from 'node:util'

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { Settings } from 'luxon'

Settings.throwOnInvalid = true

// react-router-dom v7 (peer dep de @elastic/apm-rum-react) référence TextEncoder/TextDecoder
// au chargement du module, absents du global jsdom (https://github.com/jsdom/jsdom/issues/2524)
if (global.TextEncoder === undefined) {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

expect.extend(toHaveNoViolations)

global.fetch = jest.fn(async () => new Response())
if (typeof window !== 'undefined') {
  // https://github.com/jsdom/jsdom/issues/1695
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
  window.HTMLElement.prototype.scrollTo = jest.fn()
}

jest.mock('utils/analytics/useMatomo')

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT NOT_FOUND')
  }),
  redirect: jest.fn((destination) => {
    throw new Error('NEXT_REDIRECT ' + destination)
  }),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))
jest.mock('next/headers', () => ({
  headers: jest.fn(async () => ({
    get: jest.fn(),
    has: jest.fn(),
  })),
}))

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: {
      id: 'id-conseiller-1',
      estSuperviseur: false,
      structure: 'MILO',
    },
    accessToken: 'accessToken',
  })),
}))

afterEach(() => {
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
  cleanup()
})
