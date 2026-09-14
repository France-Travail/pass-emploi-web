import { render } from '@testing-library/react'

import Profil from 'app/(connected)/(with-sidebar)/(with-chat)/profil/page'
import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { unConseiller } from 'fixtures/conseiller'
import {
  uneListeDAgencesFranceTravail,
  uneListeDAgencesMILO,
} from 'fixtures/referentiel'
import { Conseiller } from 'interfaces/conseiller'
import {
  structureConseilDepartemental,
  structureFTCej,
  structureMilo,
} from 'interfaces/structure'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage')
jest.mock('services/conseiller.service')
jest.mock('services/referentiel.service')

describe('ProfilPage server side', () => {
  describe('en tant que France Travail', () => {
    it('charge le référentiel des agences France Travail', async () => {
      // Given
      const conseiller = unConseiller({
        structure: structureFTCej,
        agence: { nom: 'Agence France Travail THIERS', id: 'id-agence' },
      })

      // When
      await renderPageForConseiller(conseiller, uneListeDAgencesFranceTravail())

      // Then
      expect(getAgencesServerSide).toHaveBeenCalledWith(
        'FRANCE_TRAVAIL',
        'accessToken'
      )
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielAgences: uneListeDAgencesFranceTravail() },
        undefined
      )
    })
  })

  describe('en tant que Conseil départemental', () => {
    it('charge la page sans référentiel d’agences', async () => {
      // Given
      const conseiller = unConseiller({
        structure: structureConseilDepartemental,
      })

      // When
      await renderPageForConseiller(conseiller, uneListeDAgencesMILO())

      // Then
      expect(getAgencesServerSide).not.toHaveBeenCalled()
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielAgences: [] },
        undefined
      )
    })
  })

  describe('en tant que Mission Locale avec une agence déjà renseignée ', () => {
    it('charge la page avec les bonnes props sans le référentiel d’agences', async () => {
      // Given
      const conseiller = unConseiller({
        structure: structureMilo,
        agence: { nom: 'MLS3F SAINT-LOUIS' },
      })

      // When
      await renderPageForConseiller(conseiller, uneListeDAgencesMILO())

      // Then
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielAgences: [] },
        undefined
      )
    })
  })

  describe('en tant que Mission Locale sans agence déjà renseignée ', () => {
    it('charge la page avec les bonnes props avec le référentiel d’agences', async () => {
      // Given
      const conseiller = unConseiller({ structure: structureMilo })

      // When
      await renderPageForConseiller(conseiller, uneListeDAgencesMILO())

      // Then
      expect(ProfilPage).toHaveBeenCalledWith(
        { referentielAgences: uneListeDAgencesMILO() },
        undefined
      )
    })
  })

  async function renderPageForConseiller(
    conseiller: Conseiller,
    referentiel: Awaited<ReturnType<typeof getAgencesServerSide>>
  ) {
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      accessToken: 'accessToken',
      user: { id: 'id-conseiller-1', structure: conseiller.structure },
    })
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
    ;(getAgencesServerSide as jest.Mock).mockResolvedValue(referentiel)

    render(await Profil())
  }
})
