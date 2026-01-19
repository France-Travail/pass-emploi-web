import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import React from 'react'

import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'

describe('RecapitulatifErreursFormulaire', () => {
  describe("quand il n'y a pas d'erreurs", () => {
    it('affiche un div vide sans role alert', () => {
      // Given
      const erreurs: LigneErreur[] = []

      // When
      render(<RecapitulatifErreursFormulaire erreurs={erreurs} />)

      // Then
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('a11y', async () => {
      // Given
      const erreurs: LigneErreur[] = []

      // When
      const { container } = render(
        <RecapitulatifErreursFormulaire erreurs={erreurs} />
      )

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('quand il y a une erreur', () => {
    const uneErreur: LigneErreur = {
      ancre: '#email',
      label: 'Le champ Email est vide.',
      titreChamp: 'Email',
    }

    it('a11y', async () => {
      // Given
      const erreurs: LigneErreur[] = [uneErreur]

      // When
      const { container } = render(
        <RecapitulatifErreursFormulaire erreurs={erreurs} />
      )

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('quand il y a plusieurs erreurs', () => {
    const erreurs: LigneErreur[] = [
      {
        ancre: '#prenom',
        label: 'Le champ Prénom est vide.',
        titreChamp: 'Prénom',
      },
      {
        ancre: '#nom',
        label: 'Le champ Nom est vide.',
        titreChamp: 'Nom',
      },
      {
        ancre: '#email',
        label: 'Le champ Email est vide.',
        titreChamp: 'Email',
      },
    ]

    it('affiche le récapitulatif avec toutes les erreurs', () => {
      // Given & When
      render(<RecapitulatifErreursFormulaire erreurs={erreurs} />)

      // Then
      const alert = screen.getByRole('alert', {
        name: 'Le formulaire contient 3 erreur(s).',
      })
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Le champ Prénom est vide.')).toBeInTheDocument()
      expect(screen.getByText('Le champ Nom est vide.')).toBeInTheDocument()
      expect(screen.getByText('Le champ Email est vide.')).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Remplir le champ Prénom' })
      ).toHaveAttribute('href', '#prenom')
      expect(
        screen.getByRole('link', { name: 'Remplir le champ Nom' })
      ).toHaveAttribute('href', '#nom')
      expect(
        screen.getByRole('link', { name: 'Remplir le champ Email' })
      ).toHaveAttribute('href', '#email')
    })

    it('a11y', async () => {
      // Given
      const { container } = render(
        <RecapitulatifErreursFormulaire erreurs={erreurs} />
      )

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
