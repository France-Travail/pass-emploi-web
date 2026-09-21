import { render } from '@testing-library/react'
import { DateTime } from 'luxon'
import { redirect } from 'next/navigation'

import HomePage from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage'
import Home from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/page'
import { unConseiller } from 'fixtures/conseiller'
import { unProfilFT } from 'fixtures/profil'
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
jest.mock('app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage')
jest.mock('services/conseiller.service')
jest.mock('services/referentiel.service')

describe('HomePage server side', () => {
  describe('si le conseiller a renseigné son agence et son mail', () => {
    beforeEach(() => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller-1' },
        accessToken: 'accessToken',
      })

      const conseillerAvecAgence: Conseiller = unConseiller({
        structureMilo: { nom: 'MLS3F SAINT-LOUIS', id: 'id-agence' },
        email: 'pass.emploi@beta.gouv.fr',
        structure: structureMilo,
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        conseillerAvecAgence
      )
    })

    it('redirige vers le portefeuille', async () => {
      // When
      const promise = Home({})

      //Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })

    it('redirige vers l’url renseignée', async () => {
      // When
      const promise = Home({
        searchParams: Promise.resolve({ redirectUrl: '/agenda' }),
      })

      //Then
      await expect(promise).rejects.toEqual(new Error('NEXT_REDIRECT /agenda'))
      expect(redirect).toHaveBeenCalledWith('/agenda')
    })
  })

  describe('si le conseiller Milo n’a pas renseigné sa structure', () => {
    it('prépare la page pour renseigner sa structure', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller = unConseiller({
        structure: structureMilo,
        email: 'pass.emploi@beta.gouv.fr',
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: true,
          afficherModaleDispositif: false,
          afficherModaleConfirmationDispositif: false,
          afficherModaleEmail: false,
          afficherModaleOnboarding: false,
          redirectUrl: '/mes-jeunes',
        },
        undefined
      )
    })
  })

  describe('si le conseiller France Travail n’a pas renseigné son agence', () => {
    it('prépare la page pour renseigner son agence', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller = unConseiller({
        structure: structureFTCej,
        email: 'pass.emploi@beta.gouv.fr',
        dateMajDispositif: DateTime.now().minus({ months: 1 }),
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesFranceTravail()
      )

      // When
      render(
        await Home({
          searchParams: Promise.resolve({ redirectUrl: '/agenda' }),
        })
      )

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: true,
          afficherModaleDispositif: false,
          afficherModaleConfirmationDispositif: false,
          afficherModaleEmail: false,
          afficherModaleOnboarding: false,
          redirectUrl: '/agenda',
          referentielAgences: uneListeDAgencesFranceTravail(),
        },
        undefined
      )
    })
  })

  describe('si le conseiller n’a pas renseigné son adresse email', () => {
    it('prépare la page pour renseigner son adresse email', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller = unConseiller({
        agence: { nom: 'MLS3F SAINT-LOUIS', id: 'id-agence' },
        structureMilo: {
          nom: 'Mission Locale Aubenas',
          id: 'id-test',
        },
        structure: structureMilo,
        email: undefined,
      })

      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: false,
          afficherModaleDispositif: false,
          afficherModaleConfirmationDispositif: false,
          afficherModaleEmail: true,
          afficherModaleOnboarding: false,
          redirectUrl: '/mes-jeunes',
          referentielAgences: undefined,
        },
        undefined
      )
    })
  })

  describe('si c’est un nouveau conseiller', () => {
    it('prépare la page avec l’onboarding', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: structureFTCej,
          dateMajDispositif: DateTime.now().minus({ months: 1 }),
        })
      )
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesFranceTravail()
      )

      // When
      render(
        await Home({
          searchParams: Promise.resolve({
            onboarding: true,
            redirectUrl: '/agenda',
          }),
        })
      )

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: true,
          afficherModaleDispositif: false,
          afficherModaleConfirmationDispositif: false,
          afficherModaleEmail: false,
          afficherModaleOnboarding: true,
          redirectUrl: '/agenda',
          referentielAgences: uneListeDAgencesFranceTravail(),
        },
        undefined
      )
    })
  })

  describe('si le conseiller France Travail n’a pas choisi son dispositif', () => {
    it('prépare la page pour choisir son dispositif', async () => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller = unConseiller({
        structure: structureFTCej,
        profil: unProfilFT(null),
        agence: { nom: 'Agence France Travail THIERS', id: 'id-agence' },
        dateMajAgence: DateTime.now().minus({ months: 1 }),
        email: 'pass.emploi@beta.gouv.fr',
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesFranceTravail()
      )

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: false,
          afficherModaleDispositif: true,
          afficherModaleConfirmationDispositif: false,
          afficherModaleEmail: false,
          afficherModaleOnboarding: false,
          redirectUrl: '/mes-jeunes',
          referentielAgences: uneListeDAgencesFranceTravail(),
        },
        undefined
      )
    })
  })

  describe('si le conseiller France Travail doit confirmer son agence', () => {
    beforeEach(() => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesFranceTravail()
      )
    })

    it('impose la modale quand l’agence a été saisie à la main', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: structureFTCej,
          agence: { nom: 'Agence saisie à la main' },
          email: 'pass.emploi@beta.gouv.fr',
        })
      )

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        expect.objectContaining({ afficherModaleAgence: true }),
        undefined
      )
    })

    it('impose la modale quand l’agence a été confirmée il y a plus de 6 mois', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: structureFTCej,
          agence: { nom: 'Agence France Travail THIERS', id: 'id-agence' },
          dateMajAgence: DateTime.now().minus({ months: 6, days: 1 }),
          email: 'pass.emploi@beta.gouv.fr',
        })
      )

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        expect.objectContaining({ afficherModaleAgence: true }),
        undefined
      )
    })

    it('n’impose pas la modale quand l’agence a été confirmée il y a moins de 6 mois', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: structureFTCej,
          agence: { nom: 'Agence France Travail THIERS', id: 'id-agence' },
          dateMajAgence: DateTime.now().minus({ months: 5 }),
          dateMajDispositif: DateTime.now().minus({ months: 5 }),
          email: 'pass.emploi@beta.gouv.fr',
        })
      )

      // When
      const promise = Home({})

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /mes-jeunes')
      )
    })

    it('laisse le Conseil départemental sur sa règle historique', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: structureConseilDepartemental,
          agence: { nom: 'Agence saisie à la main' },
          email: 'pass.emploi@beta.gouv.fr',
        })
      )

      // When
      const promise = Home({})

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /mes-jeunes')
      )
    })
  })

  describe('si le conseiller France Travail doit confirmer son dispositif', () => {
    const conseillerFTAJour: Partial<Conseiller> = {
      structure: structureFTCej,
      agence: { nom: 'Agence France Travail THIERS', id: 'id-agence' },
      dateMajAgence: DateTime.now().minus({ months: 1 }),
      email: 'pass.emploi@beta.gouv.fr',
    }

    beforeEach(() => {
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesFranceTravail()
      )
    })

    it('impose la modale quand le dispositif n’a jamais été confirmé', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller(conseillerFTAJour)
      )

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        {
          afficherModaleAgence: false,
          afficherModaleDispositif: false,
          afficherModaleConfirmationDispositif: true,
          afficherModaleEmail: false,
          afficherModaleOnboarding: false,
          redirectUrl: '/mes-jeunes',
          referentielAgences: uneListeDAgencesFranceTravail(),
        },
        undefined
      )
    })

    it('impose la modale quand le dispositif a été confirmé il y a plus d’un an', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          ...conseillerFTAJour,
          dateMajDispositif: DateTime.now().minus({ years: 1, days: 1 }),
        })
      )

      // When
      render(await Home({}))

      // Then
      expect(HomePage).toHaveBeenCalledWith(
        expect.objectContaining({ afficherModaleConfirmationDispositif: true }),
        undefined
      )
    })

    it('n’impose pas la modale quand le dispositif a été confirmé il y a moins d’un an', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          ...conseillerFTAJour,
          dateMajDispositif: DateTime.now().minus({ months: 11 }),
        })
      )

      // When
      const promise = Home({})

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /mes-jeunes')
      )
    })
  })

  describe('si le conseiller doit signer la dernière version des CGU', () => {
    it('redirige vers la signature des CGUs', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({})

      const conseiller: Conseiller = unConseiller({
        dateSignatureCGU: '1970-01-01',
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesMILO()
      )

      // When
      const promise = Home({})

      //Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /consentement-cgu')
      )
      expect(redirect).toHaveBeenCalledWith('/consentement-cgu')
    })
  })
})
