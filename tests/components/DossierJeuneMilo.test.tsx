import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { MODAL_ROOT_ID } from 'components/globals'
import DossierBeneficiaireMilo from 'components/jeune/DossierBeneficiaireMilo'
import { unDossierMilo } from 'fixtures/milo'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DossierMilo', () => {
  describe("quand l'e-mail du bénéficiaire est renseigné", () => {
    beforeEach(async () => {
      //GIVEN
      const dossier = unDossierMilo()

      //WHEN
      await renderWithContexts(
        <DossierBeneficiaireMilo
          dossier={dossier}
          beneficiaireExisteDejaMilo={false}
          erreurMessageCreationCompte=''
          onCreateCompte={jest.fn()}
          onAnnulationCreerCompte={jest.fn()}
          onRefresh={jest.fn()}
          onRetour={jest.fn()}
        />
      )
    })

    it("affiche les informations d'un dossier bénéficiaire avec e-mail", () => {
      //THEN
      expect(getByDescriptionTerm('Prénom :')).toHaveTextContent('Kenji')
      expect(getByDescriptionTerm('Nom :')).toHaveTextContent('GIRAC')
      expect(getByDescriptionTerm('Date de naissance :')).toHaveTextContent(
        '1997-12-17'
      )
      expect(getByDescriptionTerm('Code postal :')).toHaveTextContent('13000')
      expect(getByDescriptionTerm('E-mail :')).toHaveTextContent(
        'kenji-faux-mail@mail.com'
      )
    })

    it("affiche le mode opératoire d'activation du compte", () => {
      // Then
      expect(
        screen.getByText(/lien d’activation valable 24h/)
      ).toBeInTheDocument()
    })
  })

  describe('comportement du toggle CEJ', () => {
    let onCreateCompte: jest.Mock

    beforeAll(() => {
      // Crée un conteneur pour les modales utilisé par ModalContainer
      if (!document.getElementById(MODAL_ROOT_ID)) {
        const modalRoot = document.createElement('div')
        modalRoot.setAttribute('id', MODAL_ROOT_ID)
        document.body.appendChild(modalRoot)
      }
    })

    afterAll(() => {
      const modalRoot = document.getElementById(MODAL_ROOT_ID)
      if (modalRoot && modalRoot.parentNode)
        modalRoot.parentNode.removeChild(modalRoot)
    })

    beforeEach(async () => {
      // GIVEN
      const dossier = unDossierMilo()
      onCreateCompte = jest.fn().mockResolvedValue(undefined)

      // WHEN
      await renderWithContexts(
        <DossierBeneficiaireMilo
          dossier={dossier}
          beneficiaireExisteDejaMilo={false}
          erreurMessageCreationCompte=''
          onCreateCompte={onCreateCompte}
          onAnnulationCreerCompte={jest.fn()}
          onRefresh={jest.fn()}
          onRetour={jest.fn()}
        />
      )
    })

    it('au clic sur le toggle puis confirmation, la payload contient peutVoirLeCompteurDesHeures à true', async () => {
      // WHEN - sélectionner CEJ pour afficher le toggle
      const cejRadio = screen.getByRole('radio', { name: /CEJ/ })
      await userEvent.click(cejRadio)

      // WHEN - activer le toggle -> ouverture de la pop-in
      const toggle = screen.getByRole('switch')
      await userEvent.click(toggle)

      // THEN - la pop-in s'affiche
      expect(
        screen.getByText('Information sur le comptage des heures')
      ).toBeInTheDocument()

      // WHEN - confirmation dans la pop-in
      await userEvent.click(
        screen.getByRole('button', { name: 'Activer le compteur d’heures' })
      )

      // THEN - le toggle est bien activé
      await waitFor(() => expect(toggle).toBeChecked())

      // WHEN - création du compte
      await userEvent.click(
        screen.getByRole('button', { name: 'Créer le compte' })
      )

      // THEN - la payload contient bien le flag à true
      await waitFor(() => expect(onCreateCompte).toHaveBeenCalled())
      const [payload] = onCreateCompte.mock.calls[0]
      expect(payload.dispositif).toBe('CEJ')
      expect(payload.peutVoirLeCompteurDesHeures).toBe(true)
    })

    it('par défault le toggle est à désactivé, et la payload contient peutVoirLeCompteurDesHeures à false', async () => {
      // WHEN
      const cejRadio = screen.getByRole('radio', { name: /CEJ/ })
      await userEvent.click(cejRadio)
      const toggle = screen.getByRole('switch')

      // THEN - le toggle est activé
      await waitFor(() => expect(toggle).not.toBeChecked())
      await userEvent.click(toggle)

      // THEN - la pop-in s'affiche
      expect(
        screen.getByText('Information sur le comptage des heures')
      ).toBeInTheDocument()

      // WHEN - confirmation dans la pop-in
      await userEvent.click(
        screen.getByRole('button', { name: 'Activer le compteur d’heures' })
      )
      await waitFor(() => expect(toggle).toBeChecked())

      // THEN - le toggle est désactivé
      await userEvent.click(toggle)
      await waitFor(() => expect(toggle).not.toBeChecked())

      // WHEN - création du compte
      await userEvent.click(
        screen.getByRole('button', { name: 'Créer le compte' })
      )

      // THEN - la payload contient bien le flag à true
      await waitFor(() => expect(onCreateCompte).toHaveBeenCalled())
      const [payload] = onCreateCompte.mock.calls[0]
      expect(payload.dispositif).toBe('CEJ')
      expect(payload.peutVoirLeCompteurDesHeures).toBe(false)
    })

    it('On active et désactive le toggle, donc la payload contient peutVoirLeCompteurDesHeures à false', async () => {
      // WHEN
      const cejRadio = screen.getByRole('radio', { name: /CEJ/ })
      await userEvent.click(cejRadio)
      const toggle = screen.getByRole('switch')

      // THEN - le toggle est bien désactivé
      await waitFor(() => expect(toggle).not.toBeChecked())

      // WHEN - création du compte
      await userEvent.click(
        screen.getByRole('button', { name: 'Créer le compte' })
      )

      // THEN - la payload contient bien le flag à true
      await waitFor(() => expect(onCreateCompte).toHaveBeenCalled())
      const [payload] = onCreateCompte.mock.calls[0]
      expect(payload.dispositif).toBe('CEJ')
      expect(payload.peutVoirLeCompteurDesHeures).toBe(false)
    })
  })

  describe('comportement du toggle PACEA', () => {
    let onCreateCompte: jest.Mock

    beforeEach(async () => {
      // GIVEN
      const dossier = unDossierMilo()
      onCreateCompte = jest.fn().mockResolvedValue(undefined)

      // WHEN
      await renderWithContexts(
        <DossierBeneficiaireMilo
          dossier={dossier}
          beneficiaireExisteDejaMilo={false}
          erreurMessageCreationCompte=''
          onCreateCompte={onCreateCompte}
          onAnnulationCreerCompte={jest.fn()}
          onRefresh={jest.fn()}
          onRetour={jest.fn()}
        />
      )
    })

    it("Lorsqu'on crée un bénéficiaire MILO avec dispositif PACEA, peutVoirLeCompteurDesHeures doit être à false", async () => {
      // WHEN
      const paceaRadio = screen.getByRole('radio', { name: /PACEA/ })
      await userEvent.click(paceaRadio)

      // WHEN - création du compte
      await userEvent.click(
        screen.getByRole('button', { name: 'Créer le compte' })
      )

      // THEN - la payload contient bien le flag à true
      await waitFor(() => expect(onCreateCompte).toHaveBeenCalled())
      const [payload] = onCreateCompte.mock.calls[0]
      expect(payload.dispositif).toBe('PACEA')
      expect(payload.peutVoirLeCompteurDesHeures).toBe(false)
    })
  })

  describe("quand l'e-mail du bénéficiaire n'est pas renseigné", () => {
    beforeEach(async () => {
      //GIVEN
      const dossier = unDossierMilo({ email: undefined })

      //WHEN
      await renderWithContexts(
        <DossierBeneficiaireMilo
          dossier={dossier}
          erreurMessageCreationCompte=''
          beneficiaireExisteDejaMilo={false}
          onCreateCompte={jest.fn()}
          onAnnulationCreerCompte={jest.fn()}
          onRefresh={jest.fn()}
          onRetour={jest.fn()}
        />
      )
    })

    it('le champ e-mail doit être vide', () => {
      //THEN
      expect(getByDescriptionTerm('E-mail :')).toBeEmptyDOMElement()
    })

    it("affiche un message d'erreur", () => {
      //THEN
      expect(
        screen.getByText(
          "L'e-mail du bénéficiaire n'est peut-être pas renseigné"
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "1. Renseignez l'e-mail du bénéficiaire sur son profil i-milo"
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          '2. Rafraîchissez ensuite cette page ou saisissez à nouveau le numéro de dossier du bénéficiaire pour créer le compte application CEJ'
        )
      ).toBeInTheDocument()
    })

    it("n'affiche pas le mode opératoire d'activation du compte", () => {
      // Then
      expect(() => screen.getByText(/lien d'activation valable 24h/)).toThrow()
    })
  })
})
