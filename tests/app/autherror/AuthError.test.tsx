import { render, screen, within } from '@testing-library/react'

import AuthError from '../../../app/autherror/page'

describe('AuthErrorPage', () => {
  describe('MigrationJeunePage', () => {
    it("affiche la page d'erreur Migration Jeune", async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_PARCOURS_EMPLOI',
        typeUtilisateur: 'JEUNE',
      })

      render(await AuthError({ searchParams }))

      // Then
      const mainContent = screen.getByRole('main', {
        name: 'Vos outils évoluent',
      })
      expect(mainContent).toBeInTheDocument()
      expect(
        within(mainContent).getByText(
          'L’application du CEJ n’est plus disponible. Vous devez désormais utiliser l’application Parcours Emploi.'
        )
      ).toBeInTheDocument()
      expect(
        within(mainContent).getByRole('link', {
          name: "Télécharger l'application",
        })
      ).toBeInTheDocument()
      expect(
        within(mainContent).getByRole('link', {
          name: "Télécharger l'application",
        })
      ).toBeInTheDocument()
    })
  })
})
