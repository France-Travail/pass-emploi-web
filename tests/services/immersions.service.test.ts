import { apiGet } from 'clients/api.client'
import {
  listeBaseImmersions,
  searchImmersionsResultJson,
  unDetailImmersion,
  unDetailImmersionJson,
} from 'fixtures/offre'
import { uneCommune, unMetier } from 'fixtures/referentiel'
import {
  getImmersionServerSide,
  searchImmersions,
} from 'services/immersions.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('ImmersionsApiService', () => {
  describe('.getImmersionServerSide', () => {
    it("renvoie l'immersion si elle est trouvée en base", async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailImmersionJson(),
      })

      // When
      const actual = await getImmersionServerSide(
        '89081896600016~M1805~loc-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-immersion/v3/89081896600016/M1805/loc-1',
        'accessToken'
      )
      expect(actual).toStrictEqual(unDetailImmersion())
    })

    it("renvoie undefined si l'immersion n'est pas trouvée en base", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'immersion non trouvée')
      )

      // When
      const actual = await getImmersionServerSide(
        '89081896600016~M1805~loc-1',
        'accessToken'
      )

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })

  describe('.searchImmersions', () => {
    beforeEach(() => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: searchImmersionsResultJson({ page: 1 }),
      })
    })

    it('renvoie les immersions de la page demandée', async () => {
      // When
      const actual = await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 52,
        },
        1
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-immersion/v3?lat=48.830108&lon=2.323026&distance=52&rome=M1805&page=1&limit=10',
        'accessToken'
      )
      expect(actual).toEqual({
        offres: listeBaseImmersions({ page: 1 }),
        metadonnees: { nombreTotal: 15, nombrePages: 3 },
      })
    })

    it("passe le numéro de page à l'API", async () => {
      // When
      await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 52,
        },
        2
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-immersion/v3?lat=48.830108&lon=2.323026&distance=52&rome=M1805&page=2&limit=10',
        'accessToken'
      )
    })
  })
})
