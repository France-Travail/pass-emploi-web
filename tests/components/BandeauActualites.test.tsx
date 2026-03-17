import { DateTime } from 'luxon'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import BandeauActualites from 'components/chat/BandeauActualites'
import { desActualitesMilo, uneActualiteMilo } from 'fixtures/actualiteMilo'
import {
  getActualitesMissionLocaleClientSide,
  modifierActualiteMissionLocaleClientSide,
  supprimerActualiteMissionLocaleClientSide,
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
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockReturnValue(
        new Promise(() => {})
      )

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)

      // Then
      expect(screen.getByText('Chargement en cours')).toBeInTheDocument()
    })
  })

  describe('quand il y a des actualités', () => {
    it('affiche le bouton retour', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: 'Retour' })

      // Then
      expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument()
    })

    it('appelle onRetourMessagerie au clic sur retour', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: 'Retour' })
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))

      // Then
      expect(onRetourMessagerie).toHaveBeenCalledTimes(1)
    })

    it('affiche le titre', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('heading', {
        level: 2,
        name: 'Actualités de ma mission locale',
      })

      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Actualités de ma mission locale',
        })
      ).toBeInTheDocument()
    })

    it('affiche le bouton pour créer une actualité', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Diffuser une actualité/i })

      // Then
      expect(
        screen.getByRole('button', { name: /Diffuser une actualité/i })
      ).toBeInTheDocument()
    })

    it('passe le test a11y', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )

      // When
      const { container } = render(
        <BandeauActualites onRetourMessagerie={onRetourMessagerie} />
      )
      await screen.findByRole('button', { name: 'Retour' })

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('quand il n y a pas d actualités', () => {
    it('affiche un message d information', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([])

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByText(
        'Vous pouvez partager ici les actualités de votre mission locale'
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

    it('affiche quand même le bouton créer une actualité', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([])

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Diffuser une actualité/i })

      // Then
      expect(
        screen.getByRole('button', { name: /Diffuser une actualité/i })
      ).toBeInTheDocument()
    })

    it('passe le test a11y', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([])

      // When
      const { container } = render(
        <BandeauActualites onRetourMessagerie={onRetourMessagerie} />
      )
      await screen.findByRole('button', { name: /Diffuser une actualité/i })

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('modification d une actualité', () => {
    it('ouvre la modal de modification avec le bon titre au clic sur Modifier', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findAllByRole('button', {
        name: /Voir les actions possibles/i,
      })

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
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

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
      ).mockResolvedValue(uneActualiteMilo())
      const actualite = uneActualiteMilo({
        id: 'actualite-42',
        titre: 'Titre original',
        contenu: 'Contenu original',
        titreLien: undefined,
        lien: undefined,
        proprietaire: true,
      })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

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
    })

    it('ferme la modal après modification réussie', async () => {
      // Given
      ;(
        modifierActualiteMissionLocaleClientSide as jest.Mock
      ).mockResolvedValue(uneActualiteMilo())
      const actualite = uneActualiteMilo({ proprietaire: true })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

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
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

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
      ).mockResolvedValue(uneActualiteMilo())
      const actualite = uneActualiteMilo({
        titre: 'Titre original',
        proprietaire: true,
      })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

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

  describe('suppression d une actualité', () => {
    async function ouvrirModaleSuppression() {
      await userEvent.click(
        screen.getByRole('button', { name: /Voir les actions possibles/i })
      )
      await userEvent.click(
        screen.getByRole('button', { name: /Supprimer l.actualité/i })
      )
    }

    it('affiche la modale de confirmation au clic sur Supprimer', async () => {
      // Given
      const actualite = uneActualiteMilo({ proprietaire: true })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

      // When
      await ouvrirModaleSuppression()

      // Then
      expect(
        screen.getByRole('heading', {
          name: "Supprimer l'actualité dans le fil de votre mission locale",
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /Êtes-vous bien sûr de vouloir supprimer cette actualité/
        )
      ).toBeInTheDocument()
    })

    it('n appelle pas supprimerActualiteMissionLocaleClientSide si on annule', async () => {
      // Given
      const actualite = uneActualiteMilo({ proprietaire: true })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

      // When
      await ouvrirModaleSuppression()
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))

      // Then
      expect(supprimerActualiteMissionLocaleClientSide).not.toHaveBeenCalled()
      expect(
        screen.queryByRole('heading', {
          name: "Supprimer l'actualité dans le fil de votre mission locale",
        })
      ).not.toBeInTheDocument()
    })

    it('appelle supprimerActualiteMissionLocaleClientSide avec le bon id après confirmation', async () => {
      // Given
      ;(
        supprimerActualiteMissionLocaleClientSide as jest.Mock
      ).mockResolvedValue(undefined)
      const actualite = uneActualiteMilo({
        id: 'actualite-42',
        proprietaire: true,
      })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

      // When
      await ouvrirModaleSuppression()
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

      // Then
      expect(supprimerActualiteMissionLocaleClientSide).toHaveBeenCalledWith(
        'actualite-42'
      )
    })

    it('supprime l actualité de la liste après confirmation réussie', async () => {
      // Given
      ;(
        supprimerActualiteMissionLocaleClientSide as jest.Mock
      ).mockResolvedValue(DateTime.fromISO('2024-01-20T10:00:00'))
      const actualite = uneActualiteMilo({
        id: 'actualite-42',
        titre: 'Mon actualité',
        proprietaire: true,
      })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

      // When
      await ouvrirModaleSuppression()
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

      // Then
      expect(
        screen.queryByRole('button', { name: /Voir les actions possibles/i })
      ).not.toBeInTheDocument()
    })

    it('affiche un message d erreur si la suppression échoue', async () => {
      // Given
      ;(
        supprimerActualiteMissionLocaleClientSide as jest.Mock
      ).mockRejectedValue(new Error('Erreur réseau'))
      const actualite = uneActualiteMilo({ proprietaire: true })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

      // When
      await ouvrirModaleSuppression()
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

      // Then
      expect(
        screen.getByText(
          "Une erreur est survenue lors de la suppression de l'actualité. Veuillez réessayer."
        )
      ).toBeInTheDocument()
    })

    it('efface l erreur de suppression précédente lors d une nouvelle tentative', async () => {
      // Given
      ;(supprimerActualiteMissionLocaleClientSide as jest.Mock)
        .mockRejectedValueOnce(new Error('Erreur réseau'))
        .mockResolvedValueOnce(undefined)
      const actualite = uneActualiteMilo({ proprietaire: true })
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue([
        actualite,
      ])
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: /Voir les actions possibles/i })

      // Première tentative (échec)
      await ouvrirModaleSuppression()
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))
      expect(
        screen.getByText(/erreur est survenue lors de la suppression/)
      ).toBeInTheDocument()

      // When - deuxième tentative (succès)
      await ouvrirModaleSuppression()
      await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

      // Then
      expect(
        screen.queryByText(/erreur est survenue lors de la suppression/)
      ).not.toBeInTheDocument()
    })
  })

  describe('structure du composant', () => {
    it('contient tous les éléments principaux', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )

      // When
      render(<BandeauActualites onRetourMessagerie={onRetourMessagerie} />)
      await screen.findByRole('button', { name: 'Retour' })

      // Then
      expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Diffuser une actualité/i })
      ).toBeInTheDocument()
    })

    it('applique les bonnes classes CSS au conteneur', async () => {
      // Given
      ;(getActualitesMissionLocaleClientSide as jest.Mock).mockResolvedValue(
        desActualitesMilo()
      )

      // When
      const { container } = render(
        <BandeauActualites onRetourMessagerie={onRetourMessagerie} />
      )
      await screen.findByRole('button', { name: 'Retour' })

      // Then
      const messageContainer = container.querySelector(
        '.relative.h-full.overflow-y-auto.p-4'
      )
      expect(messageContainer).toBeInTheDocument()
    })
  })
})
