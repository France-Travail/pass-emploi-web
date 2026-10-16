import { render } from '@testing-library/react'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import CreationBeneficiaire, {
  metadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/page'
import { unConseiller } from 'fixtures/conseiller'
import { desListes } from 'fixtures/listes'
import {
  structureAvenirPro,
  structureFTCej,
  structureMilo,
} from 'interfaces/structure'
import {
  getConseillerServerSide,
  getFonctionnalitesConseillerServerSide,
} from 'services/conseiller.service'
import { getListesServerSide } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
)
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
)
jest.mock('services/conseiller.service')
jest.mock('services/listes.service')

describe('CreationBeneficiaireFranceTravailPage client side', () => {
  it('prépare la page pour un conseiller Milo', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller', structure: structureMilo },
      accessToken: 'accessToken',
    })
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
      unConseiller({ structure: structureMilo })
    )
    ;(getFonctionnalitesConseillerServerSide as jest.Mock).mockResolvedValue([
      'DISPOSITIF_AUTRE',
    ])

    // When
    render(await CreationBeneficiaire())

    // Then
    expect(metadata).toEqual({
      title: 'Créer compte bénéficiaire - Portefeuille',
    })
    expect(getFonctionnalitesConseillerServerSide).toHaveBeenCalledWith(
      'id-conseiller',
      'accessToken'
    )
    expect(CreationBeneficiaireMiloPage).toHaveBeenCalledWith(
      { fonctionnalites: ['DISPOSITIF_AUTRE'] },
      undefined
    )
  })

  it('prépare la page pour un conseiller FT', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { structure: structureFTCej },
      accessToken: 'accessToken',
    })
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
      unConseiller({ structure: structureFTCej })
    )

    // When
    render(await CreationBeneficiaire())

    // Then
    expect(metadata).toEqual({
      title: 'Créer compte bénéficiaire - Portefeuille',
    })
    expect(getFonctionnalitesConseillerServerSide).not.toHaveBeenCalled()
    expect(CreationBeneficiaireFranceTravailPage).toHaveBeenCalledWith(
      {},
      undefined
    )
  })

  it('prépare la page pour un conseiller Avenir Pro', async () => {
    // Given
    const listes = desListes()
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { structure: structureAvenirPro },
      accessToken: 'accessToken',
    })
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
      unConseiller({ structure: structureAvenirPro })
    )
    ;(getListesServerSide as jest.Mock).mockResolvedValue(listes)

    // When
    render(await CreationBeneficiaire())

    // Then
    expect(metadata).toEqual({
      title: 'Créer compte bénéficiaire - Portefeuille',
    })
    expect(CreationBeneficiaireFranceTravailPage).toHaveBeenCalledWith(
      { listes },
      undefined
    )
  })
})
