import { screen } from '@testing-library/react'

import { MODAL_ROOT_ID } from 'components/globals'
import OnboardingModal from 'components/onboarding/OnboardingModal'
import { unConseiller } from 'fixtures/conseiller'
import {
  structureAij,
  structureAvenirPro,
  structureBrsa,
  structureFTCej,
} from 'interfaces/structure'
import renderWithContexts from 'tests/renderWithContexts'

describe('OnboardingModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div')
    modalRoot.setAttribute('id', MODAL_ROOT_ID)
    document.body.appendChild(modalRoot)
  })

  afterEach(() => {
    document.getElementById(MODAL_ROOT_ID)?.remove()
  })

  it.each([structureFTCej, structureAij, structureAvenirPro] as const)(
    '%s : accueille dans l’espace conseiller 1jeune1solution',
    async (structure) => {
      await renderWithContexts(
        <OnboardingModal
          conseiller={unConseiller({ structure, firstName: 'Nils' })}
          onClose={jest.fn()}
        />
      )

      expect(
        await screen.findByRole('heading', {
          name: 'Bienvenue Nils dans votre espace conseiller 1jeune1solution',
        })
      ).toBeInTheDocument()
    }
  )

  it('POLE_EMPLOI_BRSA : accueille dans l’espace conseiller pass emploi', async () => {
    await renderWithContexts(
      <OnboardingModal
        conseiller={unConseiller({
          structure: structureBrsa,
          firstName: 'Nils',
        })}
        onClose={jest.fn()}
      />
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Bienvenue Nils dans votre espace conseiller pass emploi',
      })
    ).toBeInTheDocument()
  })
})
