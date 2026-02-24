import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'

import MessageActualites from 'components/chat/MessageActualites'
import { desActualitesMilo, uneActualiteMilo } from 'fixtures/actualiteMilo'
import { ActualiteMessage } from 'interfaces/actualiteMilo'

describe('MessageActualites', () => {
  describe('quand il y a plusieurs messages', () => {
    it('affiche les messages groupés par date', () => {
      // Given
      const messages = desActualitesMilo()

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      expect(screen.getByText('Le 15/01/2024')).toBeInTheDocument()
      expect(screen.getByText('Le 16/01/2024')).toBeInTheDocument()
      expect(
        screen.getByText('Atelier découverte des métiers')
      ).toBeInTheDocument()
      expect(screen.getByText('Journée portes ouvertes')).toBeInTheDocument()
      expect(screen.getByText('Forum des entreprises')).toBeInTheDocument()
    })

    it('affiche les liens quand ils existent', () => {
      // Given
      const messages = desActualitesMilo()

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      const lienAtelier = screen.getByRole('link', { name: /S inscrire/i })
      expect(lienAtelier).toHaveAttribute('href', 'https://example.com/atelier')

      const lienPortesOuvertes = screen.getByRole('link', {
        name: /Plus d informations/i,
      })
      expect(lienPortesOuvertes).toHaveAttribute(
        'href',
        'https://example.com/portes-ouvertes'
      )
    })

    it('n affiche pas de lien quand il n y en a pas', () => {
      // Given
      const messages = [
        uneActualiteMilo({
          id: 'actualite-3',
          titre: 'Forum des entreprises',
          titreLien: '',
          lien: '',
        }),
      ]

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      expect(
        screen.queryByRole('link', { name: /En savoir plus/i })
      ).not.toBeInTheDocument()
    })

    it('affiche le nom du conseiller et l heure pour chaque message', () => {
      // Given
      const messages = desActualitesMilo()

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      expect(
        screen.getAllByText(/Posté par Nils Tavernier/).length
      ).toBeGreaterThan(0)
      expect(
        screen.getAllByText(/Posté par Laura Cadio/).length
      ).toBeGreaterThan(0)
      expect(screen.getByText(/10:00/)).toBeInTheDocument()
      expect(screen.getByText(/14:30/)).toBeInTheDocument()
    })

    it('a une structure sémantique correcte', () => {
      // Given
      const messages = desActualitesMilo()

      // When
      const { container } = render(<MessageActualites messages={messages} />)

      // Then
      const mainList = container.querySelector('ul')
      expect(mainList).toBeInTheDocument()

      const dateGroups = mainList?.querySelectorAll(':scope > li')
      expect(dateGroups?.length).toBe(2) // 2 dates différentes

      // Chaque groupe de date contient une liste imbriquée
      dateGroups?.forEach((dateGroup) => {
        const nestedList = dateGroup.querySelector('ul')
        expect(nestedList).toBeInTheDocument()
      })
    })

    it('met le focus sur la dernière actualité au chargement', () => {
      // Given
      const messages = desActualitesMilo()

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      const dernierMessageElement = screen
        .getByText('Forum des entreprises')
        .closest('li')
      // Le dernier message a l'id de l'actualité elle-même
      expect(dernierMessageElement).toHaveAttribute('id', 'actualite-3')
    })

    it('passe le test a11y', async () => {
      // Given
      const messages = desActualitesMilo()

      // When
      const { container } = render(<MessageActualites messages={messages} />)

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('quand il y a un seul message', () => {
    it('affiche le message', () => {
      // Given
      const messages = [uneActualiteMilo()]

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      expect(screen.getByText('Nouvelle actualité')).toBeInTheDocument()
      expect(
        screen.getByText('Voici le contenu de l actualité')
      ).toBeInTheDocument()
    })

    it('affiche "Aujourd hui" pour un message d aujourd hui', () => {
      // Given
      const messages = [
        uneActualiteMilo({
          dateCreation: DateTime.now(),
        }),
      ]

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
    })
  })

  describe('quand on clique sur un lien externe', () => {
    beforeEach(() => {
      global.confirm = jest.fn()
      global.open = jest.fn()
    })

    it('affiche une confirmation avant de rediriger', async () => {
      // Given
      const messages = [
        uneActualiteMilo({
          titreLien: 'Lien externe',
          lien: 'https://external.com',
        }),
      ]
      ;(global.confirm as jest.Mock).mockReturnValue(false)

      // When
      render(<MessageActualites messages={messages} />)
      const lien = screen.getByRole('link', { name: /Lien externe/i })
      await userEvent.click(lien)

      // Then
      expect(global.confirm).toHaveBeenCalledWith(
        'Vous allez quitter l\u2019espace conseiller'
      )
      expect(global.open).not.toHaveBeenCalled()
    })

    it('ouvre le lien si l utilisateur confirme', async () => {
      // Given
      const messages = [
        uneActualiteMilo({
          titreLien: 'Lien externe',
          lien: 'https://external.com',
        }),
      ]
      ;(global.confirm as jest.Mock).mockReturnValue(true)

      // When
      render(<MessageActualites messages={messages} />)
      const lien = screen.getByRole('link', { name: /Lien externe/i })
      await userEvent.click(lien)

      // Then
      expect(global.confirm).toHaveBeenCalledWith(
        'Vous allez quitter l\u2019espace conseiller'
      )
      expect(global.open).toHaveBeenCalledWith(
        'https://external.com',
        '_blank',
        'noopener, noreferrer'
      )
    })
  })

  describe('quand il n y a pas de message', () => {
    it('affiche une liste vide', () => {
      // Given
      const messages: ActualiteMessage[] = []

      // When
      const { container } = render(<MessageActualites messages={messages} />)

      // Then
      const mainList = container.querySelector('ul')
      expect(mainList).toBeInTheDocument()
      expect(mainList?.children.length).toBe(0)
    })
  })

  describe('quand plusieurs messages ont la même date', () => {
    it('les groupe sous une seule date', () => {
      // Given
      const dateCommune = DateTime.fromISO('2024-01-20T10:00:00')
      const messages = [
        uneActualiteMilo({
          id: 'msg-1',
          titre: 'Message 1',
          dateCreation: dateCommune,
        }),
        uneActualiteMilo({
          id: 'msg-2',
          titre: 'Message 2',
          dateCreation: dateCommune.plus({ hours: 2 }),
        }),
        uneActualiteMilo({
          id: 'msg-3',
          titre: 'Message 3',
          dateCreation: dateCommune.plus({ hours: 5 }),
        }),
      ]

      // When
      const { container } = render(<MessageActualites messages={messages} />)

      // Then
      const dateHeaders = screen.getAllByText('Le 20/01/2024')
      expect(dateHeaders.length).toBe(1)

      const mainList = container.querySelector('ul')
      const dateGroups = mainList?.querySelectorAll(':scope > li')
      expect(dateGroups?.length).toBe(1)

      const firstDateGroup = dateGroups?.[0]
      const messagesInGroup = firstDateGroup?.querySelectorAll('ul > li')
      expect(messagesInGroup?.length).toBe(3)
    })
  })

  describe('quand un message n a que le titre sans lien', () => {
    it('affiche le titre et le contenu', () => {
      // Given
      const messages = [
        uneActualiteMilo({
          titre: 'Info importante',
          contenu: 'Ceci est une information',
          titreLien: '',
          lien: '',
        }),
      ]

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      expect(screen.getByText('Info importante')).toBeInTheDocument()
      expect(screen.getByText('Ceci est une information')).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('quand un message a un lien mais pas de titre de lien', () => {
    it('n affiche pas le lien', () => {
      // Given
      const messages = [
        uneActualiteMilo({
          titre: 'Info importante',
          contenu: 'Ceci est une information',
          titreLien: '',
          lien: 'https://example.com',
        }),
      ]

      // When
      render(<MessageActualites messages={messages} />)

      // Then
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })
})
