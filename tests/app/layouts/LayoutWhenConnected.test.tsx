import { render } from '@testing-library/react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LayoutWhenConnected, { generateMetadata } from 'app/(connected)/layout'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { unProfilFT } from 'fixtures/profil'
import {
  BeneficiaireFromListe,
  extractBeneficiaireWithActivity,
} from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { structureBrsa, structureFTCej } from 'interfaces/structure'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))

jest.mock('services/conseiller.service')
jest.mock('utils/conseiller/conseillerContext', () => ({
  ConseillerProvider: jest.fn(({ children }) => <>{children}</>),
}))

jest.mock('services/beneficiaires.service')
jest.mock('utils/portefeuilleContext')

describe('LayoutWhenConnected', () => {
  let conseiller: Conseiller
  let portefeuille: BeneficiaireFromListe[]

  it('assure que l’utilisateur est connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    // When
    const promise = LayoutWhenConnected({ children: <div /> })

    // Then
    await expect(promise).rejects.toEqual(new Error('NEXT_REDIRECT /login'))
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('assure que l’utilisateur est un conseiller', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { estConseiller: false },
    })

    // When
    const promise = LayoutWhenConnected({ children: <div /> })

    // Then
    await expect(promise).rejects.toEqual(
      new Error('NEXT_REDIRECT /api/auth/federated-logout')
    )
    expect(redirect).toHaveBeenCalledWith('/api/auth/federated-logout')
  })
  it('affiche favicon icon en tant que brsa conseiller connecté', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { estConseiller: true, id: 'user-id' },
      accessToken: 'accessToken',
    })
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
      unConseiller({ structure: structureBrsa })
    )

    const metadata = await generateMetadata()

    expect(metadata).toEqual({
      title: {
        template: '%s - Espace conseiller pass emploi',
        default: 'Espace conseiller pass emploi',
      },
      icons: {
        icon: '/pass-emploi-favicon.png',
        shortcut: '/pass-emploi-favicon.png',
        apple: '/pass-emploi-favicon.png',
      },
    })
  })

  describe('quand l’utilisateur est connecté en tant que conseiller', () => {
    beforeEach(async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { estConseiller: true, id: 'user-id' },
        accessToken: 'accessToken',
      })

      conseiller = unConseiller()
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)

      portefeuille = desItemsBeneficiaires()
      ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
        portefeuille
      )

      // When
      render(await LayoutWhenConnected({ children: <div /> }))
    })

    it('alimente le contexte avec le conseiller connecté', async () => {
      // Then
      expect(getConseillerServerSide).toHaveBeenCalledWith(
        { id: 'user-id', estConseiller: true },
        'accessToken'
      )
      expect(ConseillerProvider).toHaveBeenCalledWith(
        expect.objectContaining({ conseiller }),
        undefined
      )
    })

    it('alimente le contexte avec le portefeuille du conseiller', async () => {
      // Then
      expect(getBeneficiairesDuConseillerServerSide).toHaveBeenCalledWith(
        'user-id',
        'accessToken'
      )
      expect(PortefeuilleProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          portefeuille: [portefeuille[2], portefeuille[0], portefeuille[1]].map(
            extractBeneficiaireWithActivity
          ),
        }),
        undefined
      )
    })
  })

  describe('quand le conseiller France Travail n’a pas choisi son dispositif', () => {
    beforeEach(() => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { estConseiller: true, id: 'user-id' },
        accessToken: 'accessToken',
      })
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({ structure: structureFTCej, profil: unProfilFT(null) })
      )
      ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
        []
      )
    })

    it('renvoie vers l’accueil pour choisir le dispositif', async () => {
      // Given
      ;(headers as jest.Mock).mockResolvedValue({
        get: () => '/mes-jeunes',
      })

      // When
      const promise = LayoutWhenConnected({ children: <div /> })

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /?redirectUrl=%2Fmes-jeunes')
      )
    })

    it('laisse afficher l’accueil', async () => {
      // Given
      ;(headers as jest.Mock).mockResolvedValue({ get: () => '/' })

      // When
      render(await LayoutWhenConnected({ children: <div /> }))

      // Then
      expect(redirect).not.toHaveBeenCalled()
    })
  })
})
