import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import { desListes } from 'fixtures/listes'
import {
  extractBeneficiaireWithActivity,
  Portefeuille,
} from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import { structureAvenirPro } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { createCompteJeuneFranceTravail } from 'services/beneficiaires.service'
import { ajouterBeneficiaireAListe } from 'services/listes.service'
import renderWithContexts from 'tests/renderWithContexts'

import { unItemBeneficiaire } from '../../fixtures/beneficiaire'

jest.mock('services/beneficiaires.service')
jest.mock('services/listes.service')

describe('CreationBeneficiaireFranceTravailPage client side', () => {
  let container: HTMLElement
  let submitButton: HTMLElement
  let boutonContinuer: HTMLElement
  const emailBeneficiairePortefeuillle = 'nadia.sanfamiye@mail.fr'

  const portefeuille: Portefeuille = [
    unItemBeneficiaire({
      id: 'id-beneficiaire-2',
      prenom: 'Nadia',
      nom: 'Sanfamiye',
      lastActivity: '2022-01-30T17:30:07.756Z',
      email: emailBeneficiairePortefeuillle,
    }),
    unItemBeneficiaire({
      id: 'id-beneficiaire-3',
      prenom: 'Maria',
      nom: "D'Aböville-Muñoz François",
      lastActivity: '2022-02-07T17:30:07.756Z',
      dateFinCEJ: '2022-06-11T00:00:00.000+00:00',
      email: 'maria.daboville-munoz-francois@example.com',
    }),
  ].map(extractBeneficiaireWithActivity)

  let push: () => void
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let portefeuilleSetter: (updatedBeneficiaires: Portefeuille) => void
  const emailLabel: string = '* E-mail (Obligatoire)'
  beforeEach(async () => {
    push = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push })
    alerteSetter = jest.fn()
    portefeuilleSetter = jest.fn()
  })

  describe("quand le conseiller n'est pas Avenir Pro", () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireFranceTravailPage />,
        {
          customAlerte: { setter: alerteSetter },
          customPortefeuille: {
            value: portefeuille,
            setter: portefeuilleSetter,
          },
        }
      ))

      boutonContinuer = screen.getByRole('button', {
        name: 'Continuer',
      })
    })

    describe('quand le formulaire est à la première étape (vérification du mail)', () => {
      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('devrait afficher le champ email', () => {
        // Then
        expect(
          screen.getByText("Renseignez l'adresse mail du bénéficiaire")
        ).toBeInTheDocument()
        expect(screen.getByLabelText(emailLabel)).toBeInTheDocument()
      })

      describe('quand on continue avec le champ email incorrect', () => {
        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
        })

        it("demande le remplissage de l'email", async () => {
          // Given
          const inputEmail = screen.getByLabelText(emailLabel)
          await userEvent.clear(inputEmail)

          // When
          await userEvent.click(boutonContinuer)

          // Then
          expect(
            screen.getByText("Veuillez renseigner l'e-mail du bénéficiaire")
          ).toBeInTheDocument()
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(0)
        })
      })

      describe('quand on continue avec un mail déjà existant dans le portefeuille', () => {
        it("demande le remplissage de l'email", async () => {
          // Given
          const inputEmail = screen.getByLabelText(emailLabel)
          await userEvent.clear(inputEmail)
          const emailExistant = portefeuille[0].email
          await userEvent.type(inputEmail, emailExistant!)

          // When
          await userEvent.click(boutonContinuer)

          // Then
          expect(
            screen.getByText(
              `Le compte associé à cette adresse e-mail ${emailExistant} est déjà présent dans votre portefeuille`
            )
          ).toBeInTheDocument()
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(0)
        })
      })
    })

    describe("quand le formulaire est à la deuxième étape (informations d'identité)", () => {
      beforeEach(async () => {
        const inputEmail = screen.getByLabelText(emailLabel)
        await userEvent.clear(inputEmail)
        await userEvent.type(inputEmail, 'ginette.claude@email.com')
        await userEvent.click(boutonContinuer)

        submitButton = await waitFor(() => {
          return screen.getByRole('button', {
            name: 'Créer le compte bénéficiaire',
          })
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it("devrait afficher les champs d'identité du bénéficiaire", () => {
        // Then
        expect(
          screen.getByText("Renseignez l'identité du bénéficiaire")
        ).toBeInTheDocument()
        expect(screen.getByLabelText('* Prénom')).toBeInTheDocument()
        expect(screen.getByLabelText('* Nom')).toBeInTheDocument()
      })

      describe('quand on soumet le formulaire avec un champ incorrect', () => {
        beforeEach(async () => {
          // Given
          const inputFirstname = screen.getByLabelText('* Prénom')
          await userEvent.type(inputFirstname, 'Ginette')
          const inputName = screen.getByLabelText('* Nom')
          await userEvent.type(inputName, 'Claude')
        })

        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
        })

        it('demande le remplissage du prénom', async () => {
          // Given
          const inputFirstname = screen.getByLabelText('* Prénom')
          await userEvent.clear(inputFirstname)

          // When
          await userEvent.click(submitButton)

          // Then
          expect(
            screen.getByText('Veuillez renseigner le prénom du bénéficiaire')
          ).toBeInTheDocument()
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(0)
        })

        it('demande le remplissage du nom', async () => {
          // Given
          const inputName = screen.getByLabelText('* Nom')
          await userEvent.clear(inputName)

          // When
          await userEvent.click(submitButton)

          // Then
          expect(
            screen.getByText('Veuillez renseigner le nom du bénéficiaire')
          ).toBeInTheDocument()
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(0)
        })
      })

      describe('quand on soumet le formulaire avec les champs corrects', () => {
        const now = DateTime.now()
        beforeEach(async () => {
          // Given
          jest.spyOn(DateTime, 'now').mockReturnValue(now)
          const inputFirstname = screen.getByLabelText('* Prénom')
          await userEvent.type(inputFirstname, 'Ginette')
          const inputName = screen.getByLabelText('* Nom')
          await userEvent.type(inputName, 'Claude')
        })

        it('devrait revenir sur la page des jeunes du conseiller', async () => {
          // Given
          ;(createCompteJeuneFranceTravail as jest.Mock).mockResolvedValue({
            id: 'id-beneficiaire-4',
            prenom: 'Ginette',
            nom: 'Claude',
          })

          // When
          await userEvent.click(submitButton)

          // Then
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledWith({
            firstName: 'Ginette',
            lastName: 'Claude',
            email: 'ginette.claude@email.com',
          })

          expect(portefeuilleSetter).toHaveBeenCalledWith([
            ...portefeuille,
            {
              id: 'id-beneficiaire-4',
              prenom: 'Ginette',
              nom: 'Claude',
              creationDate: now.toISO(),
              estAArchiver: false,
              email: 'ginette.claude@email.com',
            },
          ])
          expect(alerteSetter).toHaveBeenCalledWith(
            'creationBeneficiaire',
            'id-beneficiaire-4'
          )
          expect(push).toHaveBeenCalledWith('/mes-jeunes')
        })

        it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
          // Given
          ;(createCompteJeuneFranceTravail as jest.Mock).mockRejectedValue({
            message: "un message d'erreur",
          })

          // When
          await userEvent.click(submitButton)

          // Then
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
          await waitFor(() => {
            expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
          })
        })
      })

      describe("quand on revient à l'étape précédente", () => {
        it("devrait revenir sur l'étape de renseignement du mail", async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: "Retour à l'étape 1 : saisie de l'adresse email Retour",
            })
          )

          // Then
          expect(
            screen.getByText("Renseignez l'adresse mail du bénéficiaire")
          ).toBeInTheDocument()
        })
      })
    })
  })

  describe('quand le conseiller est Avenir Pro et le formulaire à la deuxième étape', () => {
    let listes: Liste[]
    beforeEach(async () => {
      listes = desListes()
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireFranceTravailPage listes={listes} />,
        {
          customAlerte: { setter: alerteSetter },
          customPortefeuille: {
            value: portefeuille,
            setter: portefeuilleSetter,
          },
          customConseiller: {
            structure: structureAvenirPro,
          },
        }
      ))

      boutonContinuer = screen.getByRole('button', {
        name: 'Continuer',
      })

      const inputEmail = screen.getByLabelText(emailLabel)
      await userEvent.clear(inputEmail)
      await userEvent.type(inputEmail, 'ginette.claude@email.com')
      await userEvent.click(boutonContinuer)

      submitButton = await waitFor(() => {
        return screen.getByRole('button', {
          name: 'Créer le compte bénéficiaire',
        })
      })
    })
    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche le champ de sélection de la liste', () => {
      // Then
      expect(
        screen.getByRole('combobox', {
          name: /Sélectionnez la liste du bénéficiaire/,
        })
      ).toBeInTheDocument()
      listes.forEach((l) => {
        expect(
          screen.getByRole('option', {
            name: l.titre,
          })
        ).toBeInTheDocument()
      })
    })

    it('affiche une checkbox pour valider l’âge du bénéficiaire', () => {
      // Then
      expect(
        screen.getByRole('checkbox', {
          name: 'Je certifie que le jeune renseigné est âgé de 15 ans ou plus à la date de création du compte.',
        })
      ).toBeInTheDocument()
    })

    describe('quand le formulaire a été soumis', () => {
      const now = DateTime.now()
      beforeEach(async () => {
        // Given
        jest.spyOn(DateTime, 'now').mockReturnValue(now)
        const inputFirstname = screen.getByLabelText('* Prénom')
        await userEvent.type(inputFirstname, 'Ginette')
        const inputName = screen.getByLabelText('* Nom')
        await userEvent.type(inputName, 'Claude')
        const selectListe = screen.getByLabelText(
          '* Sélectionnez la liste du bénéficiaire'
        )
        await userEvent.selectOptions(selectListe, listes[0].titre)
        const checkboxAge = screen.getByRole('checkbox', {
          name: 'Je certifie que le jeune renseigné est âgé de 15 ans ou plus à la date de création du compte.',
        })
        await userEvent.click(checkboxAge)
      })

      it('a11y', async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockResolvedValue(
          portefeuille
        )

        // When
        await userEvent.click(submitButton)

        //Then
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('devrait revenir sur la page des jeunes du conseiller', async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockResolvedValue({
          id: 'id-beneficiaire-4',
          prenom: 'Ginette',
          nom: 'Claude',
        })
        ;(ajouterBeneficiaireAListe as jest.Mock).mockResolvedValue({})

        // When
        await userEvent.click(submitButton)

        // Then
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledWith({
          firstName: 'Ginette',
          lastName: 'Claude',
          email: 'ginette.claude@email.com',
        })
        expect(ajouterBeneficiaireAListe).toHaveBeenCalledWith(
          listes[0].id,
          'id-beneficiaire-4',
          'id-conseiller-1'
        )

        expect(portefeuilleSetter).toHaveBeenCalledWith([
          ...portefeuille,
          {
            id: 'id-beneficiaire-4',
            prenom: 'Ginette',
            nom: 'Claude',
            creationDate: now.toISO(),
            estAArchiver: false,
            email: 'ginette.claude@email.com',
          },
        ])
        expect(alerteSetter).toHaveBeenCalledWith(
          'creationBeneficiaire',
          'id-beneficiaire-4'
        )
        expect(push).toHaveBeenCalledWith('/mes-jeunes')
      })

      it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockRejectedValue({
          message: "un message d'erreur",
        })

        // When
        await userEvent.click(submitButton)

        // Then
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
        await waitFor(() => {
          expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
        })
      })
    })
  })
})
