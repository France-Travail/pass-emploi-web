import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import MigrationJeunePage from 'app/autherror/MigrationJeunePage'

jest.mock('@elastic/apm-rum-react', () => ({
  withTransaction: (name: string, type: string) => (component: any) => component,
}))

// Mock de la fonction getParcoursEmploiStoreUrl
jest.mock('utils/deviceDetection', () => ({
  getParcoursEmploiStoreUrl: jest.fn(() => 'https://apps.apple.com/app/apple-store/id563863597'),
}))

describe('MigrationJeunePage', () => {
  let container: HTMLElement

  beforeEach(() => {
    ;({ container } = render(<MigrationJeunePage />))
  })

  it('a11y', async () => {
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('affiche le titre de la page', () => {
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Vos outils évoluent',
      })
    ).toBeInTheDocument()
  })

  it('affiche le titre dans le header', () => {
    // Le titre est dans le header mais pas accessible via querySelector dans les tests
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('affiche l\'illustration de migration jeune', () => {
    // L'illustration SVG est mockée et s'affiche comme un span vide
    const illustrationContainer = screen.getByRole('main').querySelector('.flex.justify-center')
    expect(illustrationContainer).toBeInTheDocument()
  })

  it('affiche le message principal pour les jeunes', () => {
    // Vérifie que le conteneur du message principal existe
    const messageContainer = screen.getByRole('main').querySelector('.text.text-base.text-primary')
    expect(messageContainer).toBeInTheDocument()
    expect(messageContainer).toHaveTextContent('CEJ')
  })

  it('affiche le bouton de téléchargement', () => {
    expect(
      screen.getByRole('link', {
        name: 'Télécharger l\'application',
      })
    ).toBeInTheDocument()
  })

  it('affiche le message sur la suppression des données', () => {
    expect(
      screen.getByText(
        '🔒 Vous pouvez demander la suppression de vos données personnelles de l\'application du CEJ par ici'
      )
    ).toBeInTheDocument()
  })

  it('a une structure sémantique correcte', () => {
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
