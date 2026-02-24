import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'

import DateMessage from 'components/chat/DateMessage'

describe('DateMessage', () => {
  describe('quand la date est aujourd hui', () => {
    it('affiche "Aujourd hui"', () => {
      // Given
      const dateAujourdhui = DateTime.now()

      // When
      render(<DateMessage date={dateAujourdhui} />)

      // Then
      expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
    })

    it('passe le test a11y', async () => {
      // Given
      const dateAujourdhui = DateTime.now()

      // When
      const { container } = render(<DateMessage date={dateAujourdhui} />)

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('quand la date est dans le passé', () => {
    it('affiche la date au format court', () => {
      // Given
      const datePassee = DateTime.fromISO('2024-01-15')

      // When
      render(<DateMessage date={datePassee} />)

      // Then
      expect(screen.getByText('Le 15/01/2024')).toBeInTheDocument()
    })
  })

  describe('quand la date est demain', () => {
    it('affiche la date au format court', () => {
      // Given
      const dateDemain = DateTime.now().plus({ days: 1 })

      // When
      render(<DateMessage date={dateDemain} />)

      // Then
      const expectedText = `Le ${dateDemain.toFormat('dd/MM/yyyy')}`
      expect(screen.getByText(expectedText)).toBeInTheDocument()
    })
  })

  describe('quand la date est dans le futur lointain', () => {
    it('affiche la date au format court', () => {
      // Given
      const dateFuture = DateTime.fromISO('2025-12-31')

      // When
      render(<DateMessage date={dateFuture} />)

      // Then
      expect(screen.getByText('Le 31/12/2025')).toBeInTheDocument()
    })
  })

  describe('structure du composant', () => {
    it('a la bonne structure HTML', () => {
      // Given
      const date = DateTime.fromISO('2024-01-15')

      // When
      const { container } = render(<DateMessage date={date} />)

      // Then
      const div = container.querySelector('div')
      expect(div).toHaveClass('text-s-regular', 'text-center', 'mb-3')

      const p = container.querySelector('p')
      expect(p).toBeInTheDocument()
      expect(p?.textContent).toBe('Le 15/01/2024')
    })
  })

  describe('cas limites', () => {
    it('gère les dates avec heure', () => {
      // Given
      const dateAvecHeure = DateTime.fromISO('2024-01-15T14:30:00')

      // When
      render(<DateMessage date={dateAvecHeure} />)

      // Then
      expect(screen.getByText('Le 15/01/2024')).toBeInTheDocument()
    })

    it('gère le début de l année', () => {
      // Given
      const debutAnnee = DateTime.fromISO('2024-01-01')

      // When
      render(<DateMessage date={debutAnnee} />)

      // Then
      expect(screen.getByText('Le 01/01/2024')).toBeInTheDocument()
    })

    it('gère la fin de l année', () => {
      // Given
      const finAnnee = DateTime.fromISO('2024-12-31')

      // When
      render(<DateMessage date={finAnnee} />)

      // Then
      expect(screen.getByText('Le 31/12/2024')).toBeInTheDocument()
    })
  })
})
