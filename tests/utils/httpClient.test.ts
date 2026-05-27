jest.mock('utils/monitoring/logger', () => ({
  rootLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))
jest.mock('utils/monitoring/ecsHelpers', () => ({
  toEcsError: jest.fn((e) => ({ type: (e as any).name, message: (e as any).message })),
}))

import {
  ApiError,
  fetchJson,
  fetchNoContent,
  UnexpectedError,
} from 'utils/httpClient'

describe('HttpClient', () => {
  describe('fetchJson', () => {
    let reqInfo: string
    let reqInit: RequestInit
    let responseHeaders: Headers
    let actual: any
    beforeEach(async () => {
      // Given
      reqInfo = '/api/path/whatever'
      reqInit = {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: {
          Authorization: `Bearer accessToken`,
        },
      }
      responseHeaders = new Headers({
        'content-type': 'application/json',
        'default-header-1': 'defaultHeader',
        'x-custom-header-1': 'customHeader1',
      })
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: responseHeaders,
        json: jest.fn(async () => ({ some: 'response' })),
      })

      // When
      actual = await fetchJson(reqInfo, reqInit)
    })

    it('encapsulates call to fetch', () => {
      // Then
      expect(fetch).toHaveBeenCalledWith(reqInfo, reqInit)
    })

    it('returns response json', async () => {
      // Then
      expect(actual).toEqual({
        content: { some: 'response' },
        headers: responseHeaders,
      })
    })

    describe('when response has no content', () => {
      it('returns nothing ', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: true,
          headers: new Headers(),
          json: jest.fn().mockRejectedValue(new Error('Error parsing Json')),
        })

        // When
        actual = await fetchJson(reqInfo, reqInit)

        // Then
        expect(actual).toEqual({ content: undefined, headers: new Headers() })
      })
    })

    describe('when call fails', () => {
      it('throws an UnexpectedError', async () => {
        // Given
        ;(fetch as jest.Mock).mockRejectedValue(
          new Error("J'ai perdu internet")
        )

        // When
        let error
        try {
          await fetchJson('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new UnexpectedError("J'ai perdu internet"))
      })
    })

    describe('when response is a request error', () => {
      it('throws a ApiError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: jest.fn(async () => ({
            statusCode: 403,
            message: "La ressource ConseillerForJeune n'est pas autorisée",
            error: 'Forbidden',
          })),
        })

        // When
        let error
        try {
          await fetchJson('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(
          new ApiError(
            403,
            "La ressource ConseillerForJeune n'est pas autorisée"
          )
        )
      })
    })

    describe('when response is a server error', () => {
      it('throws a ApiError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal server error',
          json: jest.fn(async () => ({
            statusCode: 500,
            message: 'Internal server error',
          })),
        })

        // When
        let error
        try {
          await fetchJson('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new ApiError(500, 'Internal server error'))
      })
    })

    describe('when authorization is expired', () => {
      it('forces reauthentication', async () => {
        // TODO
      })
    })

    describe('logs ECS', () => {
      let rootLogger: { info: jest.Mock; error: jest.Mock }

      beforeEach(() => {
        rootLogger = require('utils/monitoring/logger').rootLogger
        jest.clearAllMocks()
      })

      it('émet external_api_call outcome:success sur 200', async () => {
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: jest.fn(async () => ({})),
        })

        await fetchJson('https://api.pass-emploi.beta.gouv.fr/jeunes', {
          method: 'GET',
        })

        expect(rootLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              action: 'external_api_call',
              outcome: 'success',
            }),
            'log.logger': 'ApiClient',
            http: expect.objectContaining({
              request: { method: 'GET' },
              response: { status_code: 200 },
            }),
            url: expect.objectContaining({
              domain: 'api.pass-emploi.beta.gouv.fr',
              path: '/jeunes',
            }),
          }),
          'external_api_call'
        )
      })

      it('émet external_api_call level:info outcome:failure sur 403', async () => {
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 403,
          json: jest.fn(async () => ({ message: 'Interdit' })),
        })

        try {
          await fetchJson('https://api.pass-emploi.beta.gouv.fr/jeunes')
        } catch {
          // expected throw
        }

        expect(rootLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              action: 'external_api_call',
              outcome: 'failure',
            }),
            http: expect.objectContaining({
              response: { status_code: 403 },
            }),
          }),
          'external_api_call'
        )
        expect(rootLogger.error).not.toHaveBeenCalled()
      })

      it('émet external_api_call level:error outcome:failure sur 500', async () => {
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500,
          json: jest.fn(async () => ({ message: 'Internal Server Error' })),
        })

        try {
          await fetchJson('https://api.pass-emploi.beta.gouv.fr/jeunes')
        } catch {
          // expected throw
        }

        expect(rootLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              action: 'external_api_call',
              outcome: 'failure',
            }),
            http: expect.objectContaining({
              response: { status_code: 500 },
            }),
          }),
          'external_api_call'
        )
      })

      it('émet external_api_call level:error sur exception réseau', async () => {
        ;(fetch as jest.Mock).mockRejectedValue(new Error('réseau coupé'))

        try {
          await fetchJson('https://api.pass-emploi.beta.gouv.fr/jeunes')
        } catch {
          // expected throw
        }

        expect(rootLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({
              action: 'external_api_call',
              outcome: 'failure',
            }),
          }),
          'external_api_call'
        )
      })
    })
  })

  describe('fetchNoContent', () => {
    let reqInfo: string
    let reqInit: RequestInit
    let actual: any
    beforeEach(async () => {
      // Given
      reqInfo = '/api/path/whatever'
      reqInit = {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: {
          Authorization: `Bearer accessToken`,
        },
      }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: jest.fn(async () => ({ some: 'response' })),
      })

      // When
      actual = await fetchNoContent(reqInfo, reqInit)
    })

    it('encapsulates call to fetch', () => {
      // Then
      expect(fetch).toHaveBeenCalledWith(reqInfo, reqInit)
    })

    it('returns nothing', async () => {
      // Then
      expect(actual).toBeUndefined()
    })

    describe('when call fails', () => {
      it('throws an UnexpectedError', async () => {
        // Given
        ;(fetch as jest.Mock).mockRejectedValue(
          new Error("J'ai perdu internet")
        )

        // When
        let error
        try {
          await fetchNoContent('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new UnexpectedError("J'ai perdu internet"))
      })
    })

    describe('when response is a request error', () => {
      it('throws a ApiError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: jest.fn(async () => ({
            statusCode: 403,
            message: "La ressource ConseillerForJeune n'est pas autorisée",
            error: 'Forbidden',
          })),
        })

        // When
        let error
        try {
          await fetchNoContent('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(
          new ApiError(
            403,
            "La ressource ConseillerForJeune n'est pas autorisée"
          )
        )
      })
    })

    describe('when response is a server error', () => {
      it('throws a ApiError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal server error',
          json: jest.fn(async () => ({
            statusCode: 500,
            message: 'Internal server error',
          })),
        })

        // When
        let error
        try {
          await fetchNoContent('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new ApiError(500, 'Internal server error'))
      })
    })

    describe('when authorization is expired', () => {
      it('forces reauthentication', async () => {
        // TODO
      })
    })
  })
})
