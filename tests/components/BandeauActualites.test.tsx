import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import BandeauActualites from 'components/chat/BandeauActualites'
import { desActualitesMilo, uneActualiteMilo } from 'fixtures/actualiteMilo'
import { ActualiteMessage } from 'interfaces/actualiteMilo'
import {
  creerActualiteMissionLocaleClientSide,
  modifierActualiteMissionLocaleClientSide,
} from 'services/actualites.service'

jest.mock('services/actualites.service')

describe('BandeauActualites', () => {
  const onRetourMessagerie = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    const modalRoot = document.createElement('div')
    modalRoot.setAttribute('id', 'modal-root')
    document.body.appendChild(modalRoot)
  })

  afterEach(() => {
    const modalRoot = document.getElementById('modal-root')
    if (modalRoot) document.body.removeChild(modalRoot)
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
      expect(screen.getByText('Chargement en cours')).toBeInTheDocument()
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
        screen.getByRole('button', { name: /Diffuser une actualité/i })
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
      const actualites: ActualiteMessage[] = []

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
          "Elles seront visibles par l'ensemble des bénéficiaires de votre mission locale"
        )
      ).toBeInTheDocument()
    })

    it('affiche quand même le bouton créer une actualité', () => {
      // Given
      const actualites: ActualiteMessage[] = []

      // When
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Then
      expect(
        screen.getByRole('button', { name: /Diffuser une actualité/i })
      ).toBeInTheDocument()
    })

    it('passe le test a11y', async () => {
      // Given
      const actualites: ActualiteMessage[] = []

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

  describe('modification d une actualité', () => {
    it('ouvre la modal de modification avec le bon titre au clic sur Modifier', async () => {
      // Given
      const actualites = desActualitesMilo()
      render(
        <BandeauActualites
          actualites={actualites}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // When - clic sur le bouton "More" de la première actualité propriétaire
      await userEvent.click(
        screen.getAllByRole('button', {
          name: /Voir les actions possibles/i,
        })[0]
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Modifier l.actualité/i })
      )

      // Then
      expect(
        screen.getByRole('heading', { name: "Modifier l'actualité" })
      ).toBeInTheDocument()
    })

    it('pré-remplit le formulaire avec les données de l actualité', async () => {
      // Given
      const actualite = uneActualiteMilo({
        id: 'actualite-1',
        titre: 'Mon titre existant',
        contenu: 'Mon contenu existant',
        titreLien: 'Voir plus',
        lien: 'https://example.com',
        proprietaire: true,
      })
      render(
        <BandeauActualites
          actualites={[actualite]}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Voir les actions possibles/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Modifier l.actualité/i })
      )

      // Then
      expect(
        screen.getByPlaceholderText('Renseigner un titre pour votre actualité')
      ).toHaveValue('Mon titre existant')
      expect(
        screen.getByPlaceholderText(
          'Renseigner une description pour votre actualité'
        )
      ).toHaveValue('Mon contenu existant')
      expect(
        screen.getByPlaceholderText(
          "Nom du lien qui s'affichera auprès des bénéficiaires"
        )
      ).toHaveValue('Voir plus')
      expect(screen.getByPlaceholderText('https://exemple.fr')).toHaveValue(
        'https://example.com'
      )
    })

    it('appelle modifierActualiteMissionLocaleClientSide à la soumission', async () => {
      // Given
      ;(
        modifierActualiteMissionLocaleClientSide as jest.Mock
      ).mockResolvedValue(undefined)
      const onActualiteCreee = jest.fn()
      const actualite = uneActualiteMilo({
        id: 'actualite-42',
        titre: 'Titre original',
        contenu: 'Contenu original',
        titreLien: undefined,
        lien: undefined,
        proprietaire: true,
      })
      render(
        <BandeauActualites
          actualites={[actualite]}
          onRetourMessagerie={onRetourMessagerie}
          onActualiteCreee={onActualiteCreee}
        />
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Voir les actions possibles/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Modifier l.actualité/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/i })
      )

      // Then
      expect(modifierActualiteMissionLocaleClientSide).toHaveBeenCalledWith(
        'actualite-42',
        'Titre original',
        'Contenu original',
        undefined,
        undefined
      )
      expect(onActualiteCreee).toHaveBeenCalledTimes(1)
    })

    it('ferme la modal après modification réussie', async () => {
      // Given
      ;(
        modifierActualiteMissionLocaleClientSide as jest.Mock
      ).mockResolvedValue(undefined)
      const actualite = uneActualiteMilo({ proprietaire: true })
      render(
        <BandeauActualites
          actualites={[actualite]}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Voir les actions possibles/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Modifier l.actualité/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/i })
      )

      // Then
      expect(
        screen.queryByRole('heading', { name: "Modifier l'actualité" })
      ).not.toBeInTheDocument()
    })

    it('affiche un message d erreur si la modification échoue', async () => {
      // Given
      ;(
        modifierActualiteMissionLocaleClientSide as jest.Mock
      ).mockRejectedValue(new Error('Erreur réseau'))
      const actualite = uneActualiteMilo({ proprietaire: true })
      render(
        <BandeauActualites
          actualites={[actualite]}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Voir les actions possibles/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Modifier l.actualité/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/i })
      )

      // Then
      expect(
        screen.getByText(
          "Une erreur est survenue lors de la modification de l'actualité. Veuillez réessayer."
        )
      ).toBeInTheDocument()
    })

    it('ouvre en mode création (non pré-rempli) après une modification', async () => {
      // Given
      ;(
        modifierActualiteMissionLocaleClientSide as jest.Mock
      ).mockResolvedValue(undefined)
      const actualite = uneActualiteMilo({
        titre: 'Titre original',
        proprietaire: true,
      })
      render(
        <BandeauActualites
          actualites={[actualite]}
          onRetourMessagerie={onRetourMessagerie}
        />
      )

      // Ouvrir en mode modification puis fermer
      await userEvent.click(
        screen.getByRole('button', { name: /Voir les actions possibles/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Modifier l.actualité/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/i })
      )

      // When - ouvrir le formulaire de création
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser une actualité/i })
      )

      // Then - le titre de la modal est celui de la création, et le champ est vide
      expect(
        screen.getByRole('heading', {
          name: 'Partager ici une actualité de votre mission locale',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Renseigner un titre pour votre actualité')
      ).toHaveValue('')
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
        screen.getByRole('button', { name: /Diffuser une actualité/i })
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
        '.relative.h-full.overflow-y-auto.p-4'
      )
      expect(messageContainer).toBeInTheDocument()
    })
  })
})
