import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import { uneAction } from 'fixtures/action'
import { StatutAction } from 'interfaces/action'
import { structureMilo } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { deleteAction, modifierAction } from 'services/actions.service'
import { commenterAction } from 'services/messages.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { toLongMonthDate } from 'utils/date'

jest.mock('services/actions.service')
jest.mock('services/messages.service')
jest.mock('components/PageActionsPortal')

describe('ActionPage client side', () => {
  let container: HTMLElement
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let routerPush: () => void
  const action = uneAction()

  beforeEach(() => {
    alerteSetter = jest.fn()
    routerPush = jest.fn()
    ;(modifierAction as jest.Mock).mockImplementation(
      async (_, statut) => statut
    )
    ;(deleteAction as jest.Mock).mockResolvedValue(undefined)
    ;(useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <DetailActionPage action={action} from='beneficiaire' />,
        {
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it("affiche les information d'une action", async () => {
      expect(getByDescriptionTerm('Description :')).toHaveTextContent(
        action.comment
      )

      await userEvent.click(
        Array.from(container.querySelectorAll('details summary')).find((el) =>
          /Historique/.test(el.textContent!)
        )!
      )
      expect(getByDescriptionTerm('Date de création :')).toHaveTextContent(
        '15/02/2022'
      )
      expect(getByDescriptionTerm('Date d’actualisation :')).toHaveTextContent(
        '16/02/2022'
      )
      expect(getByDescriptionTerm("Créateur de l'action :")).toHaveTextContent(
        action.creator
      )
    })

    describe('Au clique sur un statut', () => {
      it("déclenche le changement de statut de l'action", async () => {
        // Given
        const statutRadio = screen.getByText('À faire')

        // When
        await userEvent.click(statutRadio)

        // Then
        expect(modifierAction).toHaveBeenCalledWith(action.id, {
          statut: StatutAction.AFaire,
        })
      })
    })

    describe('Quand l’action a le statut EnCours', () => {
      it('n’affiche pas la date de réalisation', async () => {
        // Given
        const statutRadio = screen.getByText('À faire')

        // When
        await userEvent.click(statutRadio)

        // Then
        expect(() => screen.getByText('Date de réalisation :')).toThrow()
      })
    })

    describe('Quand l’action passe en statut Terminée', () => {
      it('affiche la date de réalisation', async () => {
        // Given
        const statutRadio = screen.getByText('À qualifier')

        // When
        await userEvent.click(statutRadio)

        // Then
        expect(getByDescriptionTerm('Date de réalisation :')).toHaveTextContent(
          toLongMonthDate(DateTime.now())
        )
      })
    })

    describe('Partage action', () => {
      let group: HTMLDetailsElement
      let boutonVoir: HTMLElement
      beforeEach(async () => {
        group = Array.from(container.querySelectorAll('details')).find((el) =>
          /Commentaire/.test(el.textContent!)
        ) as HTMLDetailsElement

        boutonVoir = group.querySelector('summary') as HTMLElement
      })

      it('est caché par défaut', async () => {
        // Then
        expect(group).not.toHaveAttribute('open')
      })

      describe('quand on ouvre l’accordéon', () => {
        beforeEach(async () => {
          // When
          await userEvent.click(boutonVoir)
        })

        it('demande la saisi d’un message', async () => {
          expect(
            within(group).getByRole('textbox', {
              name: 'Demander plus d’information au bénéficiaire sur l’action',
            })
          ).toHaveValue(
            'Pouvez-vous compléter la description de cette action s’il vous plaît ?'
          )
        })

        it('envoie un message', async () => {
          //
          expect(group).toHaveAttribute('open')

          // Given
          // FIXME pourquoi ça marche pas avec userEvent.click ? 🤨
          fireEvent.change(
            within(group).getByRole('textbox', {
              name: 'Demander plus d’information au bénéficiaire sur l’action',
            }),
            {
              target: {
                value:
                  'Peux tu me détailler quelles recherches tu as fait stp ?',
              },
            }
          )

          // When
          await userEvent.click(
            within(group).getByRole('button', {
              name: 'Envoyer au bénéficiaire',
            })
          )

          // Then
          expect(commenterAction).toHaveBeenCalledWith({
            cleChiffrement: 'cleChiffrement',
            message: 'Peux tu me détailler quelles recherches tu as fait stp ?',
            action,
          })
          expect(document.activeElement).toHaveTextContent(
            'Votre message a bien été envoyé, retrouvez le dans votre conversation avec le bénéficiaire.'
          )
        })

        it('a11y', async () => {
          // When
          let results: AxeResults

          await act(async () => {
            results = await axe(container)
          })

          expect(results!).toHaveNoViolations()
        })
      })
    })
  })

  describe("quand le conseiller n'est pas le conseiller du jeune", () => {
    ;(modifierAction as jest.Mock).mockImplementation(
      async (_, statut) => statut
    )
    ;(deleteAction as jest.Mock).mockResolvedValue({})

    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <DetailActionPage action={action} from='beneficiaire' />,
        {
          customAlerte: { setter: alerteSetter },
          customConseiller: { id: 'fake-id' },
        }
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche un encart lecture seule si ce n‘est pas le conseiller du jeune', async () => {
      //Then
      expect(screen.getByText('Vous êtes en lecture seule')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Vous pouvez uniquement lire le détail de l’action de ce bénéficiaire car il ne fait pas partie de votre portefeuille.'
        )
      ).toBeInTheDocument()
    })

    it('désactive tous les boutons radio', async () => {
      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach((radioBtn) => {
        expect(radioBtn).toHaveAttribute('disabled')
      })
    })

    it("n'affiche pas l'encart de création de commentaire", async () => {
      expect(() =>
        screen.getByText('Commentaire à destination du jeune')
      ).toThrow()
      expect(() => screen.getByLabelText('Ajouter un commentaire')).toThrow()
      expect(() => screen.getByText('Ajouter un commentaire')).toThrow()
    })
  })

  describe("quand l'action est terminée et non qualifiée", () => {
    describe('quand le bénéficiaire est CEJ', () => {
      const actionAQualifier = uneAction({
        dateFinReelle: DateTime.now().toISO(),
        status: StatutAction.TermineeAQualifier,
      })

      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })
      })

      it('ne permet pas de supprimer l’action', async () => {
        //When
        await renderWithContexts(
          <DetailActionPage action={actionAQualifier} from='beneficiaire' />,
          { customAlerte: { setter: alerteSetter } }
        )

        //Then
        expect(() =>
          screen.getByRole('link', { name: 'Supprimer l’action' })
        ).toThrow()
      })

      it("affiche un lien pour qualifier l'action", async () => {
        //When
        await renderWithContexts(
          <DetailActionPage action={actionAQualifier} from='beneficiaire' />,
          { customAlerte: { setter: alerteSetter } }
        )

        //Then
        expect(
          screen
            .getByRole('link', { name: 'Qualifier l’action' })
            .getAttribute('href')
        ).toMatch(
          '/mes-jeunes/id-beneficiaire-1/actions/id-action-1/qualification?liste=beneficiaire'
        )
      })

      it('a11y', async () => {
        let results: AxeResults
        ;({ container } = await renderWithContexts(
          <DetailActionPage action={actionAQualifier} from='beneficiaire' />,
          { customAlerte: { setter: alerteSetter } }
        ))

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      describe('quand le conseiller vient de la page pilotage', () => {
        it('affiche un lien pour qualifier l’action qui retourne vers pilotage', async () => {
          //When
          await renderWithContexts(
            <DetailActionPage action={actionAQualifier} from='pilotage' />,
            { customAlerte: { setter: alerteSetter } }
          )

          //Then
          expect(
            screen
              .getByRole('link', { name: 'Qualifier l’action' })
              .getAttribute('href')
          ).toMatch(
            '/mes-jeunes/id-beneficiaire-1/actions/id-action-1/qualification?liste=pilotage'
          )
        })
      })
    })

    describe('quand le bénéficiaire n’est pas CEJ', () => {
      const actionTerminee = uneAction({
        dateFinReelle: DateTime.now().toISO(),
        status: StatutAction.Terminee,
      })
      actionTerminee.beneficiaire.dispositif = 'PACEA'

      beforeEach(async () => {
        await renderWithContexts(
          <DetailActionPage action={actionTerminee} from='beneficiaire' />
        )
      })

      it('ne permet pas de qualifier l’action', () => {
        expect(
          screen.queryByRole('button', { name: 'Qualifier l’action' })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe("quand l'action est qualifiée", () => {
    describe('qualifiée en SNP', () => {
      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

        const actionQualifiee = uneAction({
          dateFinReelle: DateTime.now().toISO(),
          status: StatutAction.TermineeQualifiee,
          qualification: {
            libelle: 'Emploi',
            code: 'EMPLOI',
            isSituationNonProfessionnelle: true,
          },
        })
        ;({ container } = await renderWithContexts(
          <DetailActionPage action={actionQualifiee} from='beneficiaire' />,
          {
            customConseiller: {
              structure: structureMilo,
            },
            customAlerte: { setter: alerteSetter },
          }
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('affiche un encart d’information de qualification en SNP', async () => {
        //Then
        expect(screen.getByText('Action qualifiée.')).toBeInTheDocument()
      })

      it('ne permet pas de modifier le statut de l’action', () => {
        expect(screen.getByLabelText('À faire')).toHaveAttribute('disabled')
        expect(screen.getByLabelText('Terminée')).toHaveAttribute('disabled')
      })
    })

    describe('non qualifiée en SNP', () => {
      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

        const actionQualifiee = uneAction({
          dateFinReelle: DateTime.now().toISO(),
          status: StatutAction.TermineeQualifiee,
          qualification: {
            libelle: 'Non SNP',
            code: 'NON_SNP',
            isSituationNonProfessionnelle: false,
          },
        })
        ;({ container } = await renderWithContexts(
          <DetailActionPage action={actionQualifiee} from='beneficiaire' />,
          {
            customConseiller: {
              structure: structureMilo,
            },
            customAlerte: { setter: alerteSetter },
          }
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('ne permet pas de modifier le statut de l’action', () => {
        expect(screen.getByLabelText('À faire')).toHaveAttribute('disabled')
        expect(screen.getByLabelText('Terminée')).toHaveAttribute('disabled')
      })

      it('affiche un encart d’information de qualification en SNP', async () => {
        //Then
        expect(
          screen.getByText(/Action qualifiée en non SNP/)
        ).toBeInTheDocument()
      })
    })
  })
})
