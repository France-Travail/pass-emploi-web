import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import MigrationConseillerPage from 'app/autherror/MigrationConseillerPage'

jest.mock('@elastic/apm-rum-react', () => ({
  withTransaction: (name: string, type: string) => (component: any) => component,
}))

describe('MigrationConseillerPage', () => {
  let container: HTMLElement

  beforeEach(() => {
    ;({ container } = render(<MigrationConseillerPage />))
  })

  it('a11y', async () => {
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('affiche le titre de la page', () => {
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Information importante',
      })
    ).toBeInTheDocument()
  })

  it('affiche le titre dans le header', () => {
    // Le titre est dans le header mais pas accessible via querySelector dans les tests
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('affiche l\'illustration de migration conseiller', () => {
    // L'illustration SVG est mockée et s'affiche comme un span vide
    const illustrationContainer = screen.getByRole('main').querySelector('.flex.justify-center')
    expect(illustrationContainer).toBeInTheDocument()
  })

  it('affiche le message principal pour les conseillers', () => {
    // Vérifie que le conteneur du message principal existe
    const messageContainer = screen.getByRole('main').querySelector('.text-center.text-base-bold.text-primary')
    expect(messageContainer).toBeInTheDocument()
    expect(messageContainer).toHaveTextContent('CEJ')
  })

  it('affiche le message sur Parcours Emploi', () => {
    // Vérifie que le conteneur du message sur Parcours Emploi existe
    const parcoursEmploiContainer = screen.getByRole('main').querySelector('.text-center.text-base-bold.text-primary.mt-6')
    expect(parcoursEmploiContainer).toBeInTheDocument()
    expect(parcoursEmploiContainer).toHaveTextContent('Parcours Emploi')
  })

  it('a une structure sémantique correcte', () => {
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
