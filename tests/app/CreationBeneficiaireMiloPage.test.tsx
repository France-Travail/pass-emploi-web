import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import {
  desItemsBeneficiaires,
  uneBaseBeneficiaire,
} from 'fixtures/beneficiaire'
import { unDossierMilo } from 'fixtures/milo'
import {
  extractBeneficiaireWithActivity,
  Portefeuille,
} from 'interfaces/beneficiaire'
import {
  createCompteJeuneMilo,
  getDossierJeune,
} from 'services/conseiller.service'
import renderWithContexts from 'tests/renderWithContexts'
import { ApiError } from 'utils/httpClient'

jest.mock('services/conseiller.service')
jest.mock('components/ModalContainer')

describe('CreationBeneficiaireMiloPage client side', () => {
  let container: HTMLElement
  describe("quand le dossier n'a pas encore été saisi", () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireMiloPage />
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('devrait afficher le champ de recherche de dossier', () => {
      // Then
      expect(
        screen.getByText(
          'Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('textbox', {
          name: 'Numéro de dossier Exemple : 123456',
        })
      ).toBeInTheDocument()
    })

    it("quand on soumet la recherche avec une valeur vide, affiche un message d'erreur", async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Valider le numéro',
      })
      const inputSearch = screen.getByRole('textbox', {
        name: 'Numéro de dossier Exemple : 123456',
      })
      await userEvent.clear(inputSearch)

      // When
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText(
          'Le champ "Numéro de dossier" est vide. Renseigner un numéro. Exemple : 123456'
        )
      ).toBeInTheDocument()
    })
  })

  describe('quand le bénéficiaire recherché existe déjà dans le portefeuille', () => {
    const portefeuille = desItemsBeneficiaires().map(
      extractBeneficiaireWithActivity
    )

    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireMiloPage />,
        {
          customPortefeuille: { value: portefeuille },
        }
      ))
    })

    it("affiche une alerte quand l'idPartenaire existe déjà", async () => {
      // Given
      const beneficiaireExistant = portefeuille[0]

      // When
      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Numéro de dossier Exemple : 123456',
        }),
        beneficiaireExistant.idPartenaire!
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider le numéro' })
      )

      // Then
      expect(
        screen.getByText(
          `Le compte associé à cette adresse e-mail ${beneficiaireExistant.email} est déjà présent dans votre portefeuille`
        )
      ).toBeInTheDocument()
      expect(getDossierJeune).not.toHaveBeenCalled()
    })

    it("affiche un lien vers la fiche du bénéficiaire dans l'alerte", async () => {
      // Given
      const beneficiaireExistant = portefeuille[0]

      // When
      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Numéro de dossier Exemple : 123456',
        }),
        beneficiaireExistant.idPartenaire!
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider le numéro' })
      )

      // Then
      const lien = screen.getByRole('link', {
        name: 'Voir la fiche du bénéficiaire',
      })
      expect(lien).toBeInTheDocument()
      expect(lien).toHaveAttribute(
        'href',
        `/mes-jeunes/${beneficiaireExistant.id}`
      )
    })

    it("permet de fermer l'alerte", async () => {
      // Given
      const beneficiaireExistant = portefeuille[0]
      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Numéro de dossier Exemple : 123456',
        }),
        beneficiaireExistant.idPartenaire!
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider le numéro' })
      )

      // When
      await userEvent.click(screen.getByRole('button', { name: "J'ai compris" }))

      // Then
      expect(
        screen.queryByText(
          `Le compte associé à cette adresse e-mail ${beneficiaireExistant.email} est déjà présent dans votre portefeuille`
        )
      ).not.toBeInTheDocument()
    })
  })

  describe('quand la recherche de dossier échoue', () => {
    beforeEach(async () => {
      ;(getDossierJeune as jest.Mock).mockRejectedValue(
        new Error('Dossier non trouvé')
      )
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireMiloPage />
      ))
    })

    it(`affiche une alerte en cas d'erreur`, async () => {
      // When
      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Numéro de dossier Exemple : 123456',
        }),
        '999999'
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider le numéro' })
      )

      // Then
      expect(screen.getByText('Dossier non trouvé')).toBeInTheDocument()
    })

    it("permet de fermer l'alerte d'erreur", async () => {
      // Given
      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Numéro de dossier Exemple : 123456',
        }),
        '999999'
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider le numéro' })
      )
      expect(screen.getByText('Dossier non trouvé')).toBeInTheDocument()

      // When
      await userEvent.click(screen.getByRole('button', { name: "J'ai compris" }))

      // Then
      expect(screen.queryByText('Dossier non trouvé')).not.toBeInTheDocument()
    })
  })

  describe('quand on a recherché un dossier', () => {
    let push: () => void
    let refresh: () => void
    let setAlerte: () => void
    let setPortefeuille: (updatedBeneficiaires: Portefeuille) => void
    const dossier = unDossierMilo()
    const portefeuille = desItemsBeneficiaires().map(
      extractBeneficiaireWithActivity
    )
    const now = DateTime.now()
    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      ;(getDossierJeune as jest.Mock).mockResolvedValue(dossier)
      ;(createCompteJeuneMilo as jest.Mock).mockResolvedValue(
        uneBaseBeneficiaire()
      )

      push = jest.fn()
      refresh = jest.fn()
      setAlerte = jest.fn()
      setPortefeuille = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push, refresh })
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireMiloPage />,
        {
          customAlerte: { setter: setAlerte },
          customPortefeuille: { setter: setPortefeuille },
        }
      ))

      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Numéro de dossier Exemple : 123456',
        }),
        '123456'
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider le numéro' })
      )
    })

    it('a11y', async () => {
      //Given
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      //When
      await userEvent.click(createCompteButton)

      //Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('demande la sélection d’un dispositif', async () => {
      // Given
      const section = screen.getByRole('group', {
        name: 'Sélectionner le dispositif (champ obligatoire)',
      })

      // Then
      expect(
        within(section).getByRole('radio', { name: /CEJ/ })
      ).toBeInTheDocument()
      expect(
        within(section).getByRole('radio', { name: /PACEA/ })
      ).toBeInTheDocument()
    })

    it('devrait revenir sur la page des jeunes du conseiller', async () => {
      // Given
      await userEvent.click(screen.getByRole('radio', { name: /PACEA/ }))

      // When
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })
      await userEvent.click(createCompteButton)

      // Then
      expect(createCompteJeuneMilo).toHaveBeenCalledWith(
        {
          email: 'kenji-faux-mail@mail.com',
          idDossier: '1234',
          nom: 'GIRAC',
          prenom: 'Kenji',
          dispositif: 'PACEA',
          peutVoirLeCompteurDesHeures: false,
        },
        { surcharge: false }
      )

      expect(setPortefeuille).toHaveBeenCalledWith([
        ...portefeuille,
        {
          ...uneBaseBeneficiaire(),
          creationDate: now.toISO(),
          estAArchiver: false,
        },
      ])
      expect(setAlerte).toHaveBeenCalledWith(
        'creationBeneficiaire',
        'id-beneficiaire-1'
      )
      expect(push).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      // Given
      await userEvent.click(screen.getByRole('radio', { name: /PACEA/ }))
      ;(createCompteJeuneMilo as jest.Mock).mockRejectedValue({
        message: "un message d'erreur",
      })

      // When
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      await userEvent.click(createCompteButton)

      // Then
      expect(createCompteJeuneMilo).toHaveBeenCalledTimes(1)
      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })

    describe('quand le bénéficiaire est rattaché à une autre Mission Locale', () => {
      beforeEach(async () => {
        // Given
        await userEvent.click(screen.getByRole('radio', { name: /PACEA/ }))
        ;(createCompteJeuneMilo as jest.Mock).mockRejectedValue(
          new ApiError(
            422,
            'Un compte bénéficiaire avec l’adresse kenji-faux-mail@mail.com existe déjà dans i-milo'
          )
        )

        // When
        const createCompteButton = screen.getByRole('button', {
          name: 'Créer le compte',
        })

        await userEvent.click(createCompteButton)
      })

      it('devrait afficher une de confirmation de création de compte bénéficiaire', async () => {
        // Then
        expect(createCompteJeuneMilo).toHaveBeenCalledTimes(1)
        expect(
          screen.getByText(
            'Un compte bénéficiaire avec l’adresse kenji-faux-mail@mail.com existe déjà dans i-milo'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Confirmer la création de compte',
          })
        ).toBeInTheDocument()
      })

      describe('au clic sur le bouton de confirmation de la modale', () => {
        it(`appelle l'api avec la surcharge`, async () => {
          const boutonConfirmation = screen.getByRole('button', {
            name: 'Confirmer la création de compte',
          })

          await userEvent.click(boutonConfirmation)

          // Then
          expect(createCompteJeuneMilo).toHaveBeenCalledWith(
            {
              email: 'kenji-faux-mail@mail.com',
              idDossier: '1234',
              nom: 'GIRAC',
              prenom: 'Kenji',
              dispositif: 'PACEA',
              peutVoirLeCompteurDesHeures: false,
            },
            { surcharge: true }
          )
        })
      })

      describe(`au clic sur le bouton d'annulation de la modale`, () => {
        it('ferme la modale et remet le focus sur le bouton Retour', async () => {
          // When
          const boutonAnnulation = screen.getByRole('button', {
            name: 'Annuler',
          })
          await userEvent.click(boutonAnnulation)

          // Then
          expect(
            screen.queryByText(
              `Un compte bénéficiaire avec l'adresse kenji-faux-mail@mail.com existe déjà dans i-milo`
            )
          ).not.toBeInTheDocument()
          expect(
            screen.queryByRole('button', {
              name: 'Confirmer la création de compte',
            })
          ).not.toBeInTheDocument()
        })
      })
    })

    describe('au clic sur le bouton Retour', () => {
      it(`revient à l'étape de recherche et nettoie les états`, async () => {
        // When
        const boutonRetour = screen.getByRole('button', {
          name: /Retour/,
        })
        await userEvent.click(boutonRetour)

        // Then
        expect(
          screen.getByText(
            'Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un compte'
          )
        ).toBeInTheDocument()
        expect(
          screen.queryByRole('group', {
            name: 'Sélectionner le dispositif (champ obligatoire)',
          })
        ).not.toBeInTheDocument()
      })
    })

    describe("quand la création échoue avec une erreur autre que l'erreur 422", () => {
      it("affiche l'alerte d'erreur et permet de la fermer", async () => {
        // Given
        await userEvent.click(screen.getByRole('radio', { name: /PACEA/ }))
        ;(createCompteJeuneMilo as jest.Mock).mockRejectedValue(
          new Error('Erreur serveur')
        )

        // When
        const createCompteButton = screen.getByRole('button', {
          name: 'Créer le compte',
        })
        await userEvent.click(createCompteButton)

        // Then
        expect(screen.getByText('Erreur serveur')).toBeInTheDocument()

        // When - fermer l'alerte
        await userEvent.click(screen.getByRole('button', { name: "J'ai compris" }))

        // Then
        expect(screen.queryByText('Erreur serveur')).not.toBeInTheDocument()
      })
    })
  })
})
