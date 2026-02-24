import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiGet, apiPost } from 'clients/api.client'
import { ActualitesRaw, ArticleJson, TagJson } from 'interfaces/actualites'
import { ActualiteJson } from 'interfaces/json/actualite'
import {
  structureAvenirPro,
  structureBrsa,
  structureConseilDepartemental,
  structureFTCej,
  structureMilo,
} from 'interfaces/structure'
import {
  creerActualiteMissionLocale,
  creerActualiteMissionLocaleClientSide,
  getActualites,
  getActualitesMissionLocale,
  getActualitesMissionLocaleClientSide,
} from 'services/actualites.service'
import { fetchJson } from 'utils/httpClient'

jest.mock('utils/httpClient')
jest.mock('clients/api.client')
jest.mock('next-auth/react')

describe('ActualitesService', () => {
  describe('.getActualites', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_MILO_LINK = 'http://milo.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_FT_CEJ_LINK = 'http://pe.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_CD_LINK = 'http://cd.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_AVENIR_PRO_LINK = 'http://ap.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_ACCOMPAGNEMENTS_INTENSIFS_LINK =
        'http://intensif.url'
    })

    it('récupère les actualites', async () => {
      //Given
      const tagsJson: TagJson[] = [
        { id: 7, name: 'Primaire', description: 'primary' },
        { id: 12, name: 'Secondaire', description: 'secondary' },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: tagsJson,
      })

      const articlesJson: ArticleJson[] = [
        {
          id: 1,
          modified: '2024-11-20T15:38:54',
          title: {
            rendered: 'Invitation à la journée présentiel du 31 octobre 2024',
          },
          tags: [7],
          content: {
            rendered: 'Cette journée aura lieu au 35 rue de la République.',
          },
          sticky: false,
        },
        {
          id: 2,
          modified: '2024-11-19T15:38:54',
          title: { rendered: 'Infolettre de novembre 2024' },
          tags: [],
          content: { rendered: 'Retrouvez notre dernière note sur le blog.' },
          sticky: true,
        },
        {
          id: 3,
          modified: '2024-12-03T16:38:54',
          title: { rendered: 'Ceci est un article de test' },
          tags: [],
          content: { rendered: 'Lorem ipsum dolor sit amet' },
          sticky: true,
        },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: articlesJson,
      })

      //When
      const output = await getActualites(structureMilo)

      //Then
      const actualites: ActualitesRaw = [
        {
          id: 3,
          titre: 'Ceci est un article de test',
          etiquettes: [],
          contenu: 'Lorem ipsum dolor sit amet',
          dateDerniereModification: '2024-12-03T16:38:54',
        },
        {
          id: 2,
          titre: 'Infolettre de novembre 2024',
          etiquettes: [],
          contenu: 'Retrouvez notre dernière note sur le blog.',
          dateDerniereModification: '2024-11-19T15:38:54',
        },
        {
          id: 1,
          titre: 'Invitation à la journée présentiel du 31 octobre 2024',
          etiquettes: [{ couleur: 'primary', id: 7, nom: 'Primaire' }],
          contenu: 'Cette journée aura lieu au 35 rue de la République.',
          dateDerniereModification: '2024-11-20T15:38:54',
        },
      ]

      expect(output).toEqual(actualites)
    })

    it('retourne undefined quand l URL des tags est absente', async () => {
      // Given
      delete process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS

      // When
      const output = await getActualites(structureMilo)

      // Then
      expect(output).toBeUndefined()
      expect(fetchJson).not.toHaveBeenCalled()
    })

    it('retourne undefined quand l URL des actualites est absente', async () => {
      // Given
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      delete process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_MILO_LINK

      // When
      const output = await getActualites(structureMilo)

      // Then
      expect(output).toBeUndefined()
      expect(fetchJson).not.toHaveBeenCalled()
    })

    it('retourne undefined quand il n y a pas d articles', async () => {
      // Given
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_MILO_LINK = 'http://actus.url'

      const tagsJson: TagJson[] = []
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: [] })

      // When
      const output = await getActualites(structureMilo)

      // Then
      expect(output).toBeUndefined()
    })

    it('gère correctement les articles sticky', async () => {
      // Given
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_MILO_LINK = 'http://actus.url'

      const tagsJson: TagJson[] = []
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })

      const articlesJson: ArticleJson[] = [
        {
          id: 1,
          modified: '2024-12-03T16:38:54',
          title: { rendered: 'Article normal récent' },
          tags: [],
          content: { rendered: 'Contenu 1' },
          sticky: false,
        },
        {
          id: 2,
          modified: '2024-11-01T10:00:00',
          title: { rendered: 'Article sticky ancien' },
          tags: [],
          content: { rendered: 'Contenu 2' },
          sticky: true,
        },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: articlesJson,
      })

      // When
      const output = await getActualites(structureMilo)

      // Then
      expect(output).toBeDefined()
      // Le sticky devrait être en premier
      expect(output![0].id).toBe(2)
      expect(output![1].id).toBe(1)
    })

    it('utilise la bonne URL pour Pole Emploi', async () => {
      // Given
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_FT_CEJ_LINK = 'http://pe.url'

      const tagsJson: TagJson[] = []
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: [] })

      // When
      await getActualites(structureFTCej)

      // Then
      expect(fetchJson).toHaveBeenCalledWith('http://pe.url')
    })

    it('utilise la bonne URL pour Conseil Departemental', async () => {
      // Given
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_CD_LINK = 'http://cd.url'

      const tagsJson: TagJson[] = []
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: [] })

      // When
      await getActualites(structureConseilDepartemental)

      // Then
      expect(fetchJson).toHaveBeenCalledWith('http://cd.url')
    })

    it('utilise la bonne URL pour Avenir Pro', async () => {
      // Given
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_AVENIR_PRO_LINK = 'http://ap.url'

      const tagsJson: TagJson[] = []
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: [] })

      // When
      await getActualites(structureAvenirPro)

      // Then
      expect(fetchJson).toHaveBeenCalledWith('http://ap.url')
    })

    it('utilise la bonne URL pour les accompagnements intensifs', async () => {
      // Given
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS = 'http://tags.url'
      process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_ACCOMPAGNEMENTS_INTENSIFS_LINK =
        'http://intensif.url'

      const tagsJson: TagJson[] = []
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: [] })

      // When
      await getActualites(structureBrsa)

      // Then
      expect(fetchJson).toHaveBeenCalledWith('http://intensif.url')
    })

    it('filtre les tags inconnus', async () => {
      // Given
      const tagsJson: TagJson[] = [{ id: 1, name: 'Tag1', description: '' }]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })

      const articlesJson: ArticleJson[] = [
        {
          id: 1,
          modified: '2024-12-03T16:38:54',
          title: { rendered: 'Article' },
          tags: [1, 999], // 999 n'existe pas
          content: { rendered: 'Contenu' },
          sticky: false,
        },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: articlesJson,
      })

      // When
      const output = await getActualites(structureMilo)

      // Then
      expect(output).toBeDefined()
      expect(output![0].etiquettes.length).toBe(1)
      expect(output![0].etiquettes[0].id).toBe(1)
    })

    it('assainit le contenu HTML', async () => {
      // Given
      const tagsJson: TagJson[] = []
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({ content: tagsJson })

      const articlesJson: ArticleJson[] = [
        {
          id: 1,
          modified: '2024-12-03T16:38:54',
          title: { rendered: 'Article' },
          tags: [],
          content: {
            rendered:
              '<p>Texte</p><img src="image.jpg" /><script>alert("bad")</script>',
          },
          sticky: false,
        },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: articlesJson,
      })

      // When
      const output = await getActualites(structureMilo)

      // Then
      expect(output).toBeDefined()
      // Le contenu devrait contenir le texte et l'image
      expect(output![0].contenu).toContain('Texte')
      expect(output![0].contenu).toContain('img')
      // Vérifie que le script est échappé et non exécutable
      expect(output![0].contenu).not.toContain('<script>')
      expect(output![0].contenu).toContain('&lt;script&gt;')
    })
  })

  describe('.getActualitesMissionLocaleClientSide', () => {
    it('récupère les actualités avec la session', async () => {
      // Given
      const mockSession = {
        user: { id: 'conseiller-123' },
        accessToken: 'token-abc',
      }
      ;(getSession as jest.Mock).mockResolvedValue(mockSession)

      const actualitesJson: ActualiteJson[] = [
        {
          id: 'actualite-1',
          titre: 'Titre',
          contenu: 'Contenu',
          dateCreation: '2024-01-15T10:00:00',
          titreLien: 'Lien',
          lien: 'http://example.com',
          proprietaire: true,
          prenomNomConseiller: 'Nils Tavernier',
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { actualites: actualitesJson },
      })

      // When
      const result = await getActualitesMissionLocaleClientSide()

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/conseiller-123/actualites',
        'token-abc'
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('actualite-1')
      expect(result[0].titre).toBe('Titre')
    })

    it('retourne un tableau vide si pas de session', async () => {
      // Given
      ;(getSession as jest.Mock).mockResolvedValue(null)

      // When
      const result = await getActualitesMissionLocaleClientSide()

      // Then
      expect(result).toEqual([])
      expect(apiGet).not.toHaveBeenCalled()
    })
  })

  describe('.getActualitesMissionLocale', () => {
    it('récupère les actualités avec les paramètres fournis', async () => {
      // Given
      const actualitesJson: ActualiteJson[] = [
        {
          id: 'actualite-1',
          titre: 'Titre',
          contenu: 'Contenu',
          dateCreation: '2024-01-15T10:00:00',
          titreLien: 'Lien',
          lien: 'http://example.com',
          proprietaire: true,
          prenomNomConseiller: 'Nils Tavernier',
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { actualites: actualitesJson },
      })

      // When
      const result = await getActualitesMissionLocale(
        'conseiller-123',
        'token-abc'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/conseiller-123/actualites',
        'token-abc'
      )
      expect(result).toHaveLength(1)
      expect(result[0].dateCreation).toBeInstanceOf(DateTime)
    })
  })

  describe('.creerActualiteMissionLocaleClientSide', () => {
    it('crée une actualité avec la session', async () => {
      // Given
      const mockSession = {
        user: { id: 'conseiller-123' },
        accessToken: 'token-abc',
      }
      ;(getSession as jest.Mock).mockResolvedValue(mockSession)

      const actualiteCreee: ActualiteJson = {
        id: 'nouvelle-actualite',
        titre: 'Actualité',
        contenu: 'Mon contenu',
        dateCreation: '2024-01-15T10:00:00',
        titreLien: '',
        lien: '',
        proprietaire: true,
        prenomNomConseiller: 'Nils Tavernier',
      }
      ;(apiPost as jest.Mock).mockResolvedValue({ content: actualiteCreee })

      // When
      const result = await creerActualiteMissionLocaleClientSide('Mon contenu')

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/conseiller-123/actualites',
        { titre: 'Actualité', contenu: 'Mon contenu' },
        'token-abc'
      )
      expect(result).toEqual(actualiteCreee)
    })
  })

  describe('.creerActualiteMissionLocale', () => {
    it('crée une actualité avec les paramètres fournis', async () => {
      // Given
      const actualiteCreee: ActualiteJson = {
        id: 'nouvelle-actualite',
        titre: 'Mon Titre',
        contenu: 'Mon contenu',
        dateCreation: '2024-01-15T10:00:00',
        titreLien: '',
        lien: '',
        proprietaire: true,
        prenomNomConseiller: 'Nils Tavernier',
      }
      ;(apiPost as jest.Mock).mockResolvedValue({ content: actualiteCreee })

      // When
      const result = await creerActualiteMissionLocale(
        'conseiller-123',
        'Mon Titre',
        'Mon contenu',
        'token-abc'
      )

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/conseiller-123/actualites',
        { titre: 'Mon Titre', contenu: 'Mon contenu' },
        'token-abc'
      )
      expect(result).toEqual(actualiteCreee)
    })
  })
})
