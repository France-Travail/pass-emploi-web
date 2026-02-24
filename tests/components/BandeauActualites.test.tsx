import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import BandeauActualites from 'components/chat/BandeauActualites'
import { desActualitesMilo } from 'fixtures/actualiteMilo'

describe('BandeauActualites', () => {
  const onRetourMessagerie = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('quand les actualités sont en cours de chargement', () => {
    it('affiche un spinner', () => {
      // When
      render(
        <BandeauActualites
          actualites={undefined}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('quand il y a des actualités', () => {
    it('affiche le bouton retour', () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      const boutonRetour = screen.getByRole('button', { name: 'Retour' })
      expect(boutonRetour).toBeInTheDocument()
    })

    it('appelle onRetourMessagerie au clic sur retour', async () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      const boutonRetour = screen.getByRole('button', { name: 'Retour' })
      await userEvent.click(boutonRetour)

      // Then
      expect(onRetourMessagerie).toHaveBeenCalledTimes(1)
    })

    it('affiche le titre', () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Actualités de ma mission locale',
        })
      ).toBeInTheDocument()
    })

    it('affiche le bouton pour créer une actualité', () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      expect(
        screen.getByRole('button', { name: /Créer une actualité/i })
      ).toBeInTheDocument()
    })

    it('passe le test a11y', async () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      const { container } = render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('quand il n y a pas d actualités', () => {
    it('affiche un message d information', () => {
      // Given
      const actualites: any[] = []

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      expect(
        screen.getByText(
          'Vous pouvez partager ici les actualités de votre mission locale'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Elles seront visibles par l\u2019ensemble des bénéficiaires de votre mission locale'
        )
      ).toBeInTheDocument()
    })

    it('affiche l icône de haut-parleur', () => {
      // Given
      const actualites: any[] = []

      // When
      const { container } = render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('w-32', 'h-32', 'fill-primary')
    })

    it('affiche quand même le bouton créer une actualité', () => {
      // Given
      const actualites: any[] = []

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      expect(
        screen.getByRole('button', { name: /Créer une actualité/i })
      ).toBeInTheDocument()
    })

    it('passe le test a11y', async () => {
      // Given
      const actualites: any[] = []

      // When
      const { container } = render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('structure du composant', () => {
    it('contient tous les éléments principaux', () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Créer une actualité/i })
      ).toBeInTheDocument()
    })

    it('applique les bonnes classes CSS au conteneur', () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      const { container } = render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      const messageContainer = container.querySelector(
        '.items-center.relative.h-full.overflow-y-auto.p-4'
      )
      expect(messageContainer).toBeInTheDocument()
    })
  })

  describe('bouton créer une actualité', () => {
    it('a l icône d ajout', () => {
      // Given
      const actualites = desActualitesMilo()

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      const button = screen.getByRole('button', {
        name: /Créer une actualité/i,
      })
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('w-4', 'h-4', 'mr-2')
    })
  })
})
