import { act, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import React from 'react'

import DetailDemarchePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/demarches/[idDemarche]/DetailDemarchePage'
import propsStatutsDemarches from 'components/action/propsStatutsDemarches'
import { unDetailBeneficiaire, uneDemarche } from 'fixtures/beneficiaire'
import { StatutDemarche } from 'interfaces/json/beneficiaire'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { toLongMonthDate } from 'utils/date'

describe('DetailDemarchePage client side', () => {
  let container: HTMLElement

  beforeEach(() => {
    jest
      .spyOn(DateTime, 'now')
      .mockReturnValue(DateTime.fromISO('2024-09-25T12:00:00.000+02:00'))
  })

  describe('render', () => {
    const demarche = uneDemarche()
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <DetailDemarchePage
          demarche={demarche}
          beneficiaire={unDetailBeneficiaire()}
          isStale={false}
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it("affiche les information d'une démarche", async () => {
      expect(
        screen.getByText(propsStatutsDemarches[demarche.statut].label)
      ).toBeInTheDocument()

      expect(getByDescriptionTerm('Catégorie :')).toHaveTextContent(
        demarche.label
      )

      expect(getByDescriptionTerm('Titre de la démarche :')).toHaveTextContent(
        demarche.titre
      )

      expect(getByDescriptionTerm('Moyen :')).toHaveTextContent(
        demarche.sousTitre!
      )

      expect(getByDescriptionTerm('Date d’échéance :')).toHaveTextContent(
        toLongMonthDate(demarche.dateFin)
      )
    })
  })

  describe('si la démarche n’a pas de moyen', () => {
    const demarche = uneDemarche({ sousTitre: undefined })
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <DetailDemarchePage
          demarche={demarche}
          beneficiaire={unDetailBeneficiaire()}
          isStale={false}
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche information manquante', () => {
      expect(getByDescriptionTerm('Moyen :')).toHaveTextContent(
        '--information non disponible'
      )
    })
  })

  describe('si la démarche à faire a dépassé son échéance', () => {
    beforeEach(async () => {
      await renderWithContexts(
        <DetailDemarchePage
          demarche={uneDemarche({
            statut: StatutDemarche.A_FAIRE,
            dateFin: '2024-09-20T17:30:07.756Z',
          })}
          beneficiaire={unDetailBeneficiaire()}
          isStale={false}
        />
      )
    })

    it('affiche le statut En retard', () => {
      expect(screen.getByText('En retard')).toBeInTheDocument()
      expect(() => screen.getByText('À faire')).toThrow()
    })
  })
})
