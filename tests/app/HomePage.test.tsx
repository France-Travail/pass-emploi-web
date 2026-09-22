import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import HomePage from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage'
import { unProfilFT } from 'fixtures/profil'
import { uneListeDAgencesFranceTravail } from 'fixtures/referentiel'
import { Agence } from 'interfaces/referentiel'
import {
  labelStructure,
  structureConseilDepartemental,
  structureFTCej,
  structureMilo,
  structuresFranceTravail,
} from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  getImpactChangementDispositif,
  modifierAgence,
  modifierDispositif,
} from 'services/conseiller.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')
jest.mock('components/ModalContainer')

describe('HomePage client side', () => {
  let container: HTMLElement
  let replace: jest.Mock
  beforeEach(() => {
    // Given
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({ replace })
  })

  describe('quand le conseiller doit renseigner sa structure', () => {
    beforeEach(async () => {
      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={false}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: { structure: structureMilo },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('contient un message pour demander la structure du conseiller', () => {
      // Then
      expect(
        screen.getByText(/vous devez renseigner votre structure/)
      ).toBeInTheDocument()
    })

    it('affiche un lien pour contacter le support', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Contacter le support (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', 'http://perdu.com/assistance/')
    })

    it('affiche un lien vers i-milo', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Accéder à i-milo (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', 'https://portail.i-milo.fr/')
    })
  })

  describe('quand le conseiller Conseil départemental doit renseigner son agence', () => {
    let agences: Agence[]
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void

    beforeEach(async () => {
      // Given
      alerteSetter = jest.fn()
      agences = uneListeDAgencesFranceTravail()

      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={false}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          referentielAgences={agences}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: { structure: structureConseilDepartemental },
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("contient un message pour demander l'agence du conseiller", () => {
      // Then
      expect(
        screen.getByText(/La liste des agences a été mise à jour/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Une fois votre agence renseignée/)
      ).toBeInTheDocument()
    })

    it('contient un input pour choisir une agence', async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })

      // When
      await userEvent.type(searchAgence, 'Agence')

      // Then
      agences.forEach((agence) =>
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: `${agence.nom} (${agence.codeDepartement})`,
          })
        ).toBeInTheDocument()
      )
    })

    it("contient un bouton pour dire que l'agence n'est pas dans liste", () => {
      // Then
      expect(
        screen.getByRole('checkbox', { name: /Mon agence n’apparaît pas/ })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('textbox', { name: /Saisir le nom/ })
      ).toThrow()
    })

    it('contient un bouton pour annuler', async () => {
      // Given
      const annuler = screen.getByRole('button', { name: 'Annuler' })

      // When
      await userEvent.click(annuler)

      // Then
      expect(replace).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("modifie le conseiller avec l'agence choisie", async () => {
      // Given
      const agence = agences[2]
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })
      const submit = screen.getByRole('button', { name: 'Ajouter' })

      // When
      await userEvent.type(
        searchAgence,
        `${agence.nom} (${agence.codeDepartement})`
      )
      await userEvent.click(submit)

      // Then
      expect(modifierAgence).toHaveBeenCalledWith({
        id: agence.id,
        nom: 'Agence France Travail THIERS',
        codeDepartement: '3',
      })
      expect(alerteSetter).toHaveBeenCalledWith('choixAgence')
      expect(replace).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("prévient si l'agence n'est pas renseignée", async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })
      const submit = screen.getByRole('button', { name: 'Ajouter' })

      // When
      await userEvent.type(searchAgence, 'pouet')
      await userEvent.click(submit)

      // Then
      expect(
        screen.getByText('Sélectionner une agence dans la liste')
      ).toBeInTheDocument()
      expect(modifierAgence).not.toHaveBeenCalled()
      expect(replace).not.toHaveBeenCalled()
    })

    describe("quand l'agence n'est pas dans la liste", () => {
      let searchAgence: HTMLInputElement
      let agenceLibre: HTMLInputElement
      beforeEach(async () => {
        // Given
        searchAgence = screen.getByRole('combobox', {
          name: /rechercher votre agence/,
        })
        await userEvent.type(searchAgence, 'pouet')

        const checkAgenceNonTrouvee = screen.getByRole('checkbox', {
          name: /n’apparaît pas/,
        })
        await userEvent.click(checkAgenceNonTrouvee)

        agenceLibre = screen.getByRole('textbox', {
          name: /Saisir le nom de votre agence/,
        })
      })

      it('permet de renseigner une agence libre', async () => {
        // When
        await userEvent.type(agenceLibre, 'Agence libre')
        const submit = screen.getByRole('button', { name: 'Ajouter' })
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).toHaveBeenCalledWith({
          nom: 'Agence libre',
        })
      })

      it('bloque la sélection dans la liste', () => {
        // Then
        expect(searchAgence.value).toEqual('')
        expect(searchAgence).toHaveAttribute('disabled', '')
      })

      it("prévient si l'agence n'est pas renseignée", async () => {
        // When
        const submit = screen.getByRole('button', { name: 'Ajouter' })
        await userEvent.click(submit)

        // Then
        expect(screen.getByText('Saisir une agence')).toBeInTheDocument()
        expect(modifierAgence).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('quand le conseiller France Travail doit confirmer son agence', () => {
    let agences: Agence[]
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void

    beforeEach(async () => {
      // Given
      alerteSetter = jest.fn()
      agences = uneListeDAgencesFranceTravail()

      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={false}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          referentielAgences={agences}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: { structure: structureFTCej },
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('ne peut pas être fermée', () => {
      // Then
      expect(() =>
        screen.getByRole('button', { name: 'Fermer la fenêtre' })
      ).toThrow()
      expect(() => screen.getByRole('button', { name: 'Annuler' })).toThrow()
    })

    it('propose les agences du référentiel', async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })

      // When
      await userEvent.type(searchAgence, 'Agence')

      // Then
      agences.forEach((agence) =>
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: `${agence.nom} (${agence.codeDepartement})`,
          })
        ).toBeInTheDocument()
      )
    })

    it('n’autorise pas la saisie manuelle d’une agence', async () => {
      // Given
      const checkAgenceNonTrouvee = screen.getByRole('checkbox', {
        name: /Mon agence n’apparaît pas/,
      })

      // When
      await userEvent.click(checkAgenceNonTrouvee)

      // Then
      expect(() =>
        screen.getByRole('textbox', { name: /Saisir le nom/ })
      ).toThrow()
    })

    it('renvoie vers le support quand l’agence est absente de la liste', async () => {
      // Given
      const checkAgenceNonTrouvee = screen.getByRole('checkbox', {
        name: /Mon agence n’apparaît pas/,
      })

      // When
      await userEvent.click(checkAgenceNonTrouvee)

      // Then
      expect(
        screen.getByText(
          /veuillez contacter le support à cette adresse email : support@pass-emploi.beta.gouv.fr/
        )
      ).toBeInTheDocument()
    })

    it('n’affiche aucune suggestion en dessous de 3 caractères', async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })

      // When
      await userEvent.type(searchAgence, 'TH')

      // Then
      expect(() => screen.getAllByRole('option', { hidden: true })).toThrow()
    })

    it('affiche les suggestions à partir de 3 caractères', async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })

      // When
      await userEvent.type(searchAgence, 'THI')

      // Then
      expect(
        screen.getByRole('option', {
          hidden: true,
          name: 'Agence France Travail THIERS (3)',
        })
      ).toBeInTheDocument()
      expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(1)
    })

    it('suffixe chaque agence de son département', async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })

      // When
      await userEvent.type(searchAgence, 'CLERMONT')

      // Then
      expect(
        screen.getByRole('option', {
          hidden: true,
          name: 'Agence France Travail CLERMONT PRE LA REINE (1)',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', {
          hidden: true,
          name: 'Agence France Travail CLERMONT JOUHAUX (2)',
        })
      ).toBeInTheDocument()
    })

    it("modifie le conseiller avec l'agence choisie", async () => {
      // Given
      const agence = agences[2]
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })

      // When
      await userEvent.type(
        searchAgence,
        `${agence.nom} (${agence.codeDepartement})`
      )
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))

      // Then
      expect(modifierAgence).toHaveBeenCalledWith({
        id: agence.id,
        nom: 'Agence France Travail THIERS',
        codeDepartement: '3',
      })
      expect(alerteSetter).toHaveBeenCalledWith('choixAgence')
      expect(replace).toHaveBeenCalledWith('/mes-jeunes')
    })

    it('affiche la consigne de reconfirmation', () => {
      // Then
      expect(
        screen.getByText(/Elle vous sera redemandée tous les 6 mois/)
      ).toBeInTheDocument()
    })

    it('laisse le champ vide et le bouton « Ajouter »', () => {
      // Then
      expect(
        screen.getByRole('combobox', { name: /votre agence/ })
      ).toHaveValue('')
      expect(
        screen.getByRole('button', { name: 'Ajouter' })
      ).toBeInTheDocument()
    })

    it('refuse un texte hors liste', async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })

      // When
      await userEvent.type(searchAgence, 'pouet')
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))

      // Then
      expect(
        screen.getByText('Sélectionner une agence dans la liste')
      ).toBeInTheDocument()
      expect(modifierAgence).not.toHaveBeenCalled()
      expect(replace).not.toHaveBeenCalled()
    })
  })

  describe('quand le conseiller France Travail doit choisir son dispositif', () => {
    let push: jest.Mock

    beforeEach(async () => {
      // Given
      push = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ replace, push })
      ;(getImpactChangementDispositif as jest.Mock).mockResolvedValue({
        nbBeneficiairesConcernes: 3,
        nbBeneficiairesTransferesTemporairement: 1,
        nbBeneficiairesSuivisTemporairement: 2,
      })

      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={false}
          afficherModaleDispositif={true}
          afficherModaleConfirmationDispositif={false}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: {
            structure: structureFTCej,
            profil: unProfilFT(null),
          },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('contient un message pour demander le dispositif du conseiller', () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Choisissez votre dispositif',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Une fois votre dispositif renseigné/)
      ).toBeInTheDocument()
    })

    it('ne permet pas de fermer la modale', () => {
      // Then
      expect(() =>
        screen.getByRole('button', { name: 'Fermer la fenêtre' })
      ).toThrow()
      expect(() => screen.getByRole('button', { name: 'Annuler' })).toThrow()
    })

    it('contient la liste des dispositifs France Travail', () => {
      // Then
      const selectDispositif = screen.getByRole('combobox', {
        name: /Votre dispositif/,
      })
      expect(selectDispositif).toBeRequired()
      structuresFranceTravail.forEach((structure) =>
        expect(
          within(selectDispositif).getByRole('option', {
            name: labelStructure(structure),
          })
        ).toBeInTheDocument()
      )
    })

    describe('quand le conseiller a choisi un dispositif', () => {
      beforeEach(async () => {
        // When
        await userEvent.selectOptions(
          screen.getByRole('combobox', { name: /Votre dispositif/ }),
          'RSA rénové'
        )
        await userEvent.click(screen.getByRole('button', { name: 'Suivant' }))
      })

      it('demande confirmation en détaillant les bénéficiaires concernés', () => {
        // Then
        expect(getImpactChangementDispositif).toHaveBeenCalledWith(
          'id-conseiller-1'
        )
        expect(
          screen.getByText(
            'Confirmez-vous le passage au dispositif RSA rénové ?'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            '3 bénéficiaires de votre portefeuille passeront au dispositif RSA rénové. Dont 1 bénéficiaire actuellement suivi à titre temporaire par un autre conseiller.'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            '2 bénéficiaires garderont leur dispositif actuel car vous les suivez temporairement.'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(/Vous serez déconnecté après validation/)
        ).toBeInTheDocument()
        expect(modifierDispositif).not.toHaveBeenCalled()
      })

      it('permet de revenir au choix', async () => {
        // When
        await userEvent.click(screen.getByRole('button', { name: 'Retour' }))

        // Then
        expect(
          screen.getByRole('combobox', { name: /Votre dispositif/ })
        ).toHaveValue('POLE_EMPLOI_BRSA')
      })

      it('modifie le dispositif puis déconnecte le conseiller', async () => {
        // When
        await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

        // Then
        expect(modifierDispositif).toHaveBeenCalledWith('BRSA')
        expect(push).toHaveBeenCalledWith('/api/auth/federated-logout')
        expect(replace).not.toHaveBeenCalled()
      })
    })
  })

  describe('quand le conseiller France Travail doit confirmer son dispositif', () => {
    let push: jest.Mock
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void

    beforeEach(async () => {
      // Given
      push = jest.fn()
      alerteSetter = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ replace, push })
      ;(getImpactChangementDispositif as jest.Mock).mockResolvedValue({
        nbBeneficiairesConcernes: 40,
        nbBeneficiairesTransferesTemporairement: 0,
        nbBeneficiairesSuivisTemporairement: 1,
      })

      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={false}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={true}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: {
            structure: structureFTCej,
            profil: unProfilFT(),
          },
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('demande au conseiller d’indiquer son dispositif', () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Indiquer mon dispositif',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Vos bénéficiaires seront rattachés au dispositif sélectionné. Les réaffectations temporaires gardent leur dispositif actuel.'
        )
      ).toBeInTheDocument()
      expect(() =>
        screen.getByText(/Une fois votre dispositif renseigné/)
      ).toThrow()
    })

    it('ne permet pas de fermer la modale', () => {
      // Then
      expect(() =>
        screen.getByRole('button', { name: 'Fermer la fenêtre' })
      ).toThrow()
      expect(() => screen.getByRole('button', { name: 'Annuler' })).toThrow()
      expect(replace).not.toHaveBeenCalled()
    })

    it('propose tous les dispositifs France Travail, y compris l’actuel, sans présélection', () => {
      // Then
      const selectDispositif = screen.getByRole('combobox', {
        name: /Sélectionner le dispositif dans la liste suivante/,
      })
      expect(selectDispositif).toBeRequired()
      expect(selectDispositif).toHaveValue('')
      structuresFranceTravail.forEach((structure) =>
        expect(
          within(selectDispositif).getByRole('option', {
            name: labelStructure(structure),
          })
        ).toBeInTheDocument()
      )
      expect(screen.getByRole('button', { name: 'Confirmer' })).toBeDisabled()
    })

    it('renvoie vers le support quand le dispositif est absent de la liste', async () => {
      // Given
      expect(() => screen.getByText(/veuillez contacter le support/)).toThrow()

      // When
      await userEvent.click(
        screen.getByRole('checkbox', { name: /Mon dispositif n’apparaît pas/ })
      )

      // Then
      expect(
        screen.getByText(
          /Si vous avez un problème avec un dispositif, veuillez contacter le support à l’adresse suivante : support@pass-emploi.beta.gouv.fr/
        )
      ).toBeInTheDocument()
    })

    describe('quand le conseiller confirme son dispositif actuel', () => {
      beforeEach(async () => {
        // When
        await userEvent.selectOptions(
          screen.getByRole('combobox', { name: /Sélectionner le dispositif/ }),
          'CEJ'
        )
        await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))
      })

      it('enregistre la confirmation sans demander de validation', () => {
        // Then
        expect(modifierDispositif).toHaveBeenCalledWith('CEJ')
        expect(getImpactChangementDispositif).not.toHaveBeenCalled()
      })

      it('ferme la modale, affiche le succès et laisse le conseiller connecté', () => {
        // Then
        expect(() =>
          screen.getByRole('heading', { name: 'Indiquer mon dispositif' })
        ).toThrow()
        expect(alerteSetter).toHaveBeenCalledWith('confirmationDispositif')
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
        expect(push).not.toHaveBeenCalled()
      })
    })

    describe('quand le conseiller choisit un autre dispositif', () => {
      beforeEach(async () => {
        // When
        await userEvent.selectOptions(
          screen.getByRole('combobox', { name: /Sélectionner le dispositif/ }),
          'RSA rénové'
        )
        await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))
      })

      it('demande validation en détaillant les bénéficiaires concernés', () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Valider mon dispositif',
          })
        ).toBeInTheDocument()
        expect(getImpactChangementDispositif).toHaveBeenCalledWith(
          'id-conseiller-1'
        )
        expect(
          screen.getByText(
            'Confirmez-vous le passage au dispositif RSA rénové ?'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            '40 bénéficiaires de votre portefeuille passeront au dispositif RSA rénové.'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            '1 bénéficiaire gardera son dispositif actuel car vous le suivez temporairement.'
          )
        ).toBeInTheDocument()
        expect(modifierDispositif).not.toHaveBeenCalled()
      })

      it('ne permet toujours pas de fermer la modale', () => {
        // Then
        expect(() =>
          screen.getByRole('button', { name: 'Fermer la fenêtre' })
        ).toThrow()
        expect(() => screen.getByRole('button', { name: 'Annuler' })).toThrow()
      })

      it('permet de revenir au choix', async () => {
        // When
        await userEvent.click(screen.getByRole('button', { name: 'Retour' }))

        // Then
        expect(
          screen.getByRole('heading', { name: 'Indiquer mon dispositif' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('combobox', { name: /Sélectionner le dispositif/ })
        ).toHaveValue('POLE_EMPLOI_BRSA')
      })

      it('modifie le dispositif puis déconnecte le conseiller', async () => {
        // When
        await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

        // Then
        expect(modifierDispositif).toHaveBeenCalledWith('BRSA')
        expect(push).toHaveBeenCalledWith('/api/auth/federated-logout')
        expect(alerteSetter).not.toHaveBeenCalled()
        expect(replace).not.toHaveBeenCalled()
      })
    })
  })

  describe('quand le conseiller France Travail doit confirmer son agence puis son dispositif', () => {
    let push: jest.Mock
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    const agences = uneListeDAgencesFranceTravail()

    beforeEach(async () => {
      // Given
      push = jest.fn()
      alerteSetter = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ replace, push })
      ;(getImpactChangementDispositif as jest.Mock).mockResolvedValue({
        nbBeneficiairesConcernes: 2,
        nbBeneficiairesTransferesTemporairement: 0,
        nbBeneficiairesSuivisTemporairement: 0,
      })

      // When
      await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={true}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          referentielAgences={agences}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: {
            structure: structureFTCej,
            profil: unProfilFT(),
          },
          customAlerte: { setter: alerteSetter },
        }
      )
    })

    async function choisirUneAgence() {
      const agence = agences[2]
      await userEvent.type(
        screen.getByRole('combobox', { name: /votre agence/ }),
        `${agence.nom} (${agence.codeDepartement})`
      )
      await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    }

    it('commence par l’agence', () => {
      // Then
      expect(
        screen.getByRole('heading', { name: 'Confirmez votre agence' })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('heading', { name: 'Indiquer mon dispositif' })
      ).toThrow()
    })

    it('enchaîne sur le dispositif une fois l’agence choisie, sans quitter la page', async () => {
      // When
      await choisirUneAgence()

      // Then
      expect(modifierAgence).toHaveBeenCalledTimes(1)
      expect(
        screen.getByRole('heading', { name: 'Indiquer mon dispositif' })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('heading', { name: 'Confirmez votre agence' })
      ).toThrow()
      expect(replace).not.toHaveBeenCalled()
    })

    it('redirige avec le bandeau du dispositif une fois les deux confirmés', async () => {
      // When
      await choisirUneAgence()
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /Sélectionner le dispositif/ }),
        'CEJ'
      )
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

      // Then
      expect(modifierDispositif).toHaveBeenCalledWith('CEJ')
      expect(alerteSetter).toHaveBeenLastCalledWith('confirmationDispositif')
      expect(replace).toHaveBeenCalledWith('/mes-jeunes')
      expect(push).not.toHaveBeenCalled()
    })

    it('déconnecte en dernier quand le dispositif change', async () => {
      // When
      await choisirUneAgence()
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /Sélectionner le dispositif/ }),
        'RSA rénové'
      )
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

      // Then
      expect(modifierAgence).toHaveBeenCalledTimes(1)
      expect(modifierDispositif).toHaveBeenCalledWith('BRSA')
      expect(push).toHaveBeenCalledWith('/api/auth/federated-logout')
      expect(replace).not.toHaveBeenCalled()
    })
  })

  describe('quand plusieurs modales sont dues', () => {
    it('n’en affiche qu’une à la fois : la structure Mission Locale avant l’email', async () => {
      // Given
      await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={false}
          afficherModaleEmail={true}
          afficherModaleOnboarding={false}
          redirectUrl='/mes-jeunes'
        />,
        { customConseiller: { structure: structureMilo } }
      )
      expect(
        screen.getByText(/vous devez renseigner votre structure/)
      ).toBeInTheDocument()
      expect(() =>
        screen.getByText(/Votre adresse email n’est pas renseignée/)
      ).toThrow()

      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Fermer la fenêtre' })
      )

      // Then
      expect(
        screen.getByText(/Votre adresse email n’est pas renseignée/)
      ).toBeInTheDocument()
      expect(() =>
        screen.getByText(/vous devez renseigner votre structure/)
      ).toThrow()
      expect(replace).not.toHaveBeenCalled()

      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Fermer la fenêtre' })
      )

      // Then
      expect(replace).toHaveBeenCalledWith('/mes-jeunes')
    })

    it('affiche l’onboarding avant les modales obligatoires', async () => {
      // Given
      await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={false}
          afficherModaleEmail={false}
          afficherModaleOnboarding={true}
          referentielAgences={uneListeDAgencesFranceTravail()}
          redirectUrl='/mes-jeunes'
        />,
        { customConseiller: { structure: structureFTCej } }
      )
      expect(
        screen.getByRole('heading', {
          name: 'Bienvenue Nils dans votre espace conseiller CEJ',
        })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('heading', { name: 'Confirmez votre agence' })
      ).toThrow()

      // When
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))

      // Then
      expect(
        screen.getByRole('heading', { name: 'Confirmez votre agence' })
      ).toBeInTheDocument()
      expect(replace).not.toHaveBeenCalled()
    })
  })

  describe('quand le conseiller doit renseigner son adresse email', () => {
    beforeEach(async () => {
      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={false}
          afficherModaleDispositif={false}
          afficherModaleConfirmationDispositif={false}
          afficherModaleEmail={true}
          afficherModaleOnboarding={false}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: { structure: structureMilo },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('contient un message pour demander l’adresse email du conseiller', () => {
      // Then
      expect(
        screen.getByText(/Votre adresse email n’est pas renseignée/)
      ).toBeInTheDocument()
    })

    it('affiche un lien vers i-milo', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Accéder à i-milo (nouvelle fenêtre)',
        })
      ).toHaveAttribute(
        'href',
        'https://admin.i-milo.fr/moncompte/coordonnees/'
      )
    })
  })

  describe('quand c’est un nouveau conseiller', () => {
    describe('quand le conseiller est France Travail', () => {
      beforeEach(async () => {
        // When
        ;({ container } = await renderWithContexts(
          <HomePage
            afficherModaleAgence={false}
            afficherModaleDispositif={false}
            afficherModaleConfirmationDispositif={false}
            afficherModaleEmail={false}
            afficherModaleOnboarding={true}
            redirectUrl='/mes-jeunes'
          />,
          {
            customConseiller: { structure: structureFTCej },
          }
        ))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche l’onboarding', async () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Bienvenue Nils dans votre espace conseiller CEJ',
          })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Découvrez les principales fonctionnalités de l’outil',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', { level: 2, name: 'Le portefeuille' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', { level: 2, name: 'La messagerie' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', { level: 2, name: 'Les offres' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
        // Then
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
      })
    })

    describe('quand le conseiller est Milo', () => {
      beforeEach(async () => {
        // When
        ;({ container } = await renderWithContexts(
          <HomePage
            afficherModaleAgence={false}
            afficherModaleDispositif={false}
            afficherModaleConfirmationDispositif={false}
            afficherModaleEmail={false}
            afficherModaleOnboarding={true}
            redirectUrl='/mes-jeunes'
          />,
          {
            customConseiller: { structure: structureMilo },
          }
        ))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche l’onboarding', async () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Bienvenue Nils dans votre espace conseiller CEJ',
          })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Découvrez les principales fonctionnalités de l’outil',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Le portefeuille et l’agenda',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'La messagerie et le pilotage',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Les offres et la réaffectation',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
        // Then
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
      })
    })

    describe('quand le conseiller est pass emploi', () => {
      beforeEach(async () => {
        // When
        ;({ container } = await renderWithContexts(
          <HomePage
            afficherModaleAgence={false}
            afficherModaleDispositif={false}
            afficherModaleConfirmationDispositif={false}
            afficherModaleEmail={false}
            afficherModaleOnboarding={true}
            redirectUrl='/mes-jeunes'
          />,
          {
            customConseiller: {
              structure: 'POLE_EMPLOI_BRSA',
            },
          }
        ))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche l’onboarding', async () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Bienvenue Nils dans votre espace conseiller pass emploi',
          })
        ).toBeInTheDocument()

        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Découvrez les principales fonctionnalités de l’outil',
          })
        ).toBeInTheDocument()
      })
    })
  })
})
