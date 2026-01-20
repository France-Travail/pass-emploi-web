import { render } from '@testing-library/react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PartageOffre from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/page'
import PartageOffrePage from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/PartageOffrePage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { desListes } from 'fixtures/listes'
import {
  unDetailImmersion,
  unDetailOffreEmploi,
  unDetailServiceCivique,
} from 'fixtures/offre'
import { Liste } from 'interfaces/liste'
import {
  DetailImmersion,
  DetailOffreEmploi,
  DetailServiceCivique,
} from 'interfaces/offre'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getImmersionServerSide } from 'services/immersions.service'
import { getListesServerSide } from 'services/listes.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/PartageOffrePage'
)
jest.mock('services/offres-emploi.service')
jest.mock('services/services-civiques.service')
jest.mock('services/immersions.service')
jest.mock('services/beneficiaires.service')
jest.mock('services/listes.service')

describe('Page Partage Offre', () => {
  let offreEmploi: DetailOffreEmploi
  let serviceCivique: DetailServiceCivique
  let immersion: DetailImmersion
  let listes: Liste[]

  beforeEach(() => {
    // Given
    offreEmploi = unDetailOffreEmploi()
    serviceCivique = unDetailServiceCivique()
    immersion = unDetailImmersion()
    listes = desListes()
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller-1' },
      accessToken: 'accessToken',
    })
    ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(offreEmploi)
    ;(getServiceCiviqueServerSide as jest.Mock).mockResolvedValue(
      serviceCivique
    )
    ;(getImmersionServerSide as jest.Mock).mockResolvedValue(immersion)
    ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
      desItemsBeneficiaires()
    )
    ;(getListesServerSide as jest.Mock).mockResolvedValue(listes)
    ;(headers as jest.Mock).mockReturnValue(
      new Map([['referer', 'referer-url']])
    )
  })

  it('charge la page avec les détails de l’offre d’emploi', async () => {
    // When
    render(
      await PartageOffre({
        params: Promise.resolve({ typeOffre: 'emploi', idOffre: 'offre-id' }),
      })
    )

    // Then
    expect(getOffreEmploiServerSide).toHaveBeenCalledWith(
      'offre-id',
      'accessToken'
    )
    expect(PartageOffrePage).toHaveBeenCalledWith(
      {
        offre: offreEmploi,
        listes,
        returnTo: 'referer-url',
      },
      undefined
    )
  })

  it('charge la page avec les détails du service civique', async () => {
    // When
    render(
      await PartageOffre({
        params: Promise.resolve({
          typeOffre: 'service-civique',
          idOffre: 'offre-id',
        }),
      })
    )

    // Then
    expect(getServiceCiviqueServerSide).toHaveBeenCalledWith(
      'offre-id',
      'accessToken'
    )
    expect(PartageOffrePage).toHaveBeenCalledWith(
      {
        offre: serviceCivique,
        listes,
        returnTo: 'referer-url',
      },
      undefined
    )
  })

  it("charge la page avec les détails de l'immersion", async () => {
    // When
    render(
      await PartageOffre({
        params: Promise.resolve({
          typeOffre: 'immersion',
          idOffre: 'offre-id',
        }),
      })
    )

    // Then
    expect(getImmersionServerSide).toHaveBeenCalledWith(
      'offre-id',
      'accessToken'
    )
    expect(PartageOffrePage).toHaveBeenCalledWith(
      {
        offre: immersion,
        listes,
        returnTo: 'referer-url',
      },
      undefined
    )
  })

  it("renvoie une 404 si l'offre n'existe pas", async () => {
    // Given
    ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(undefined)

    // When
    const promise = PartageOffre({
      params: Promise.resolve({ typeOffre: 'emploi', idOffre: 'offre-id' }),
    })

    // Then
    await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
    expect(notFound).toHaveBeenCalledWith()
  })

  it('ignore le referer si besoin', async () => {
    // Given
    ;(headers as jest.Mock).mockReturnValue(
      new Map([
        [
          'referer',
          'http://localhost:3000/?redirectUrl=%2Foffres%2Femploi%2Foffre-id%2Fpartage',
        ],
      ])
    )

    // When
    render(
      await PartageOffre({
        params: Promise.resolve({ typeOffre: 'emploi', idOffre: 'offre-id' }),
      })
    )

    // Then
    expect(PartageOffrePage).toHaveBeenCalledWith(
      expect.objectContaining({
        listes,
        returnTo: '/offres',
      }),
      undefined
    )
  })
})
