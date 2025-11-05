import { render, screen, within } from '@testing-library/react'

import AuthError from '../../../app/autherror/page'

describe('AuthErrorPage', () => {
  describe('MigrationJeunePage', () => {
    it("affiche la page d'erreur Migration Jeune", async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_PARCOURS_EMPLOI',
        typeUtilisateur: 'JEUNE',
        nom: 'Eventreur',
        prenom: 'Jack',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      const mainContent = screen.getByRole('main', {
        name: 'Vos outils évoluent',
      })
      expect(mainContent).toBeInTheDocument()
      expect(
        within(mainContent).getByText(
          "L'application du CEJ n'est plus disponible. Vous devez désormais utiliser l'application Parcours Emploi."
        )
      ).toBeInTheDocument()
      expect(
        within(mainContent).getByRole('link', {
          name: "Télécharger l'application",
        })
      ).toBeInTheDocument()
      const lienMail = within(mainContent).getByRole('link', {
        name: 'Envoyer un email pour demander la suppression de vos données',
      })
      expect(lienMail).toBeInTheDocument()
      expect(lienMail).toHaveAttribute(
        'href',
        'mailto:support@pass-emploi.beta.gouv.fr?subject=Demande%20de%20suppression%20des%20donn%C3%A9es%20personnelles%20%E2%80%93%20Eventreur%20Jack&body=Bonjour%2C%0A%0AJe%20souhaite%20exercer%20mon%20droit%20%C3%A0%20la%20suppression%20de%20mes%20donn%C3%A9es%20personnelles%20conform%C3%A9ment%20%C3%A0%20l%E2%80%99article%2017.1%20du%20RGPD.%20Vous%20trouverez%20ci%E2%80%91dessous%20les%20informations%20me%20concernant%20afin%20que%20vous%20puissiez%20localiser%20rapidement%20mon%20dossier.%20%0A%0ANom%20%3A%20Eventreur%0APr%C3%A9nom%20%3A%20Jack%0AAdresse%20e%E2%80%91mail%20utilis%C3%A9e%20dans%20l%E2%80%99application%20%3A%20email@exemple.com'
      )
    })
  })
  describe('MigrationConseillerPage', () => {
    it("affiche la page d'erreur Migration Conseiller", async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_PARCOURS_EMPLOI',
        typeUtilisateur: 'CONSEILLER',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      const mainContent = screen.getByRole('main', {
        name: 'Information importante',
      })
      expect(mainContent).toBeInTheDocument()
      expect(
        within(mainContent).getByText(
          "Les demandeurs d'emploi doivent désormais utiliser Parcours Emploi pour échanger avec vous."
        )
      ).toBeInTheDocument()
    })
  })
})
