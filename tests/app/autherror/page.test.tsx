import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import AuthError from 'app/autherror/page'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('app/autherror/AuthErrorPage', () => {
  return function MockAuthErrorPage({ erreur, codeErreur }: any) {
    return (
      <div data-testid="auth-error-page">
        <div data-testid="erreur">{erreur}</div>
        <div data-testid="code-erreur">{codeErreur}</div>
      </div>
    )
  }
})

jest.mock('app/autherror/MigrationConseillerPage', () => {
  return function MockMigrationConseillerPage() {
    return <div data-testid="migration-conseiller-page">Migration Conseiller</div>
  }
})

jest.mock('app/autherror/MigrationJeunePage', () => {
  return function MockMigrationJeunePage() {
    return <div data-testid="migration-jeune-page">Migration Jeune</div>
  }
})

describe('AuthError page - Migration Parcours Emploi', () => {
  let container: HTMLElement

  describe('quand reason est MIGRATION_PARCOURS_EMPLOI', () => {
    describe('et typeUtilisateur est CONSEILLER', () => {
      beforeEach(async () => {
        const searchParams = Promise.resolve({
          reason: 'MIGRATION_PARCOURS_EMPLOI',
          typeUtilisateur: 'CONSEILLER',
        })

        ;({ container } = render(await AuthError({ searchParams })))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche la page MigrationConseillerPage', () => {
        expect(screen.getByTestId('migration-conseiller-page')).toBeInTheDocument()
        expect(screen.getByText('Migration Conseiller')).toBeInTheDocument()
      })
    })

    describe('et typeUtilisateur est JEUNE', () => {
      beforeEach(async () => {
        const searchParams = Promise.resolve({
          reason: 'MIGRATION_PARCOURS_EMPLOI',
          typeUtilisateur: 'JEUNE',
        })

        ;({ container } = render(await AuthError({ searchParams })))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche la page MigrationJeunePage', () => {
        expect(screen.getByTestId('migration-jeune-page')).toBeInTheDocument()
        expect(screen.getByText('Migration Jeune')).toBeInTheDocument()
      })
    })

    describe('et typeUtilisateur n\'est ni CONSEILLER ni JEUNE', () => {
      beforeEach(async () => {
        const searchParams = Promise.resolve({
          reason: 'MIGRATION_PARCOURS_EMPLOI',
          typeUtilisateur: 'AUTRE',
        })

        ;({ container } = render(await AuthError({ searchParams })))
      })

      it('affiche la page AuthErrorPage par défaut', () => {
        expect(screen.getByTestId('auth-error-page')).toBeInTheDocument()
        expect(screen.getByTestId('erreur')).toHaveTextContent(
          'Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.'
        )
        expect(screen.getByTestId('erreur')).toHaveTextContent(
          'Si le problème persiste, veuillez supprimer le cache de votre navigateur ou contacter votre conseiller.'
        )
        expect(screen.getByTestId('code-erreur')).toHaveTextContent('MIGRATION_PARCOURS_EMPLOI')
      })
    })
  })

  describe('quand reason n\'est pas MIGRATION_PARCOURS_EMPLOI', () => {
    describe('et typeUtilisateur est CONSEILLER', () => {
      beforeEach(async () => {
        const searchParams = Promise.resolve({
          reason: 'UTILISATEUR_INEXISTANT',
          typeUtilisateur: 'CONSEILLER',
          structureUtilisateur: 'MILO',
        })

        ;({ container } = render(await AuthError({ searchParams })))
      })

      it('affiche la page AuthErrorPage pour conseiller', () => {
        expect(screen.getByTestId('auth-error-page')).toBeInTheDocument()
        expect(screen.getByTestId('code-erreur')).toHaveTextContent('UTILISATEUR_INEXISTANT')
      })
    })

    describe('et typeUtilisateur n\'est pas CONSEILLER', () => {
      beforeEach(async () => {
        const searchParams = Promise.resolve({
          reason: 'UTILISATEUR_INEXISTANT',
          typeUtilisateur: 'JEUNE',
          structureUtilisateur: 'POLE_EMPLOI',
          email: 'test@example.com',
        })

        ;({ container } = render(await AuthError({ searchParams })))
      })

      it('affiche la page AuthErrorPage pour bénéficiaire', () => {
        expect(screen.getByTestId('auth-error-page')).toBeInTheDocument()
        expect(screen.getByTestId('erreur')).toHaveTextContent(
          'Votre compte n\'est pas enregistré sur l\'application, veuillez contacter votre conseiller.'
        )
        expect(screen.getByTestId('erreur')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('code-erreur')).toHaveTextContent('UTILISATEUR_INEXISTANT')
      })
    })
  })
})
