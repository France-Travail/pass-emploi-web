import { render, screen, within } from '@testing-library/react'

import AuthError from '../../../app/autherror/page'

const USER_AGENT_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
const USER_AGENT_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0'

function simulerUserAgent(userAgent: string) {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent)
}

describe('AuthErrorPage', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

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
  describe('bénéficiaire France Travail', () => {
    it('explique une panne du système France Travail et invite à réessayer', async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'FRANCE_TRAVAIL_INDISPONIBLE',
        typeUtilisateur: 'JEUNE',
        structureUtilisateur: 'FRANCE_TRAVAIL',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      expect(
        screen.getByText(
          'Une erreur est survenue avec le système France Travail, votre compte n’a pas pu être créé.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('Veuillez réessayer plus tard.')
      ).toBeInTheDocument()
    })
  })

  describe('migration Pass Emploi vers Parcours Emploi', () => {
    it('affiche la page de migration conseiller', async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_PASS_EMPLOI_PARCOURS_EMPLOI',
        typeUtilisateur: 'CONSEILLER',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      const mainContent = screen.getByRole('main', {
        name: 'Information importante',
      })
      expect(
        within(mainContent).getByText(
          'L’accès à l’application pass emploi n’est plus disponible. Pour échanger avec vos bénéficiaires, rendez-vous dans CVM - messagerie instantanée.'
        )
      ).toBeInTheDocument()
      expect(
        within(mainContent).getByText(
          'Les demandeurs d’emploi doivent désormais utiliser Parcours Emploi pour échanger avec vous.'
        )
      ).toBeInTheDocument()
    })

    it('affiche la page de migration jeune', async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_PASS_EMPLOI_PARCOURS_EMPLOI',
        typeUtilisateur: 'JEUNE',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      const mainContent = screen.getByRole('main', {
        name: 'Vos outils évoluent',
      })
      expect(
        within(mainContent).getByText(
          'L’application pass emploi n’est plus disponible. Vous devez désormais utiliser l’application Parcours Emploi.'
        )
      ).toBeInTheDocument()
    })

    it.each([
      [
        'iOS',
        USER_AGENT_IOS,
        'https://apps.apple.com/app/apple-store/id563863597?pt=1432235&ct=migration-cej&mt=8',
      ],
      [
        'Android',
        USER_AGENT_ANDROID,
        'https://play.google.com/store/apps/details?id=com.poleemploi.pemobile&referrer=utm_source=cej&utm_medium=cta&utm_campaign=migration_cej',
      ],
    ])(
      'renvoie vers le store Parcours Emploi sur %s',
      async (_, userAgent, urlStore) => {
        // Given
        simulerUserAgent(userAgent)
        const searchParams = Promise.resolve({
          reason: 'MIGRATION_PASS_EMPLOI_PARCOURS_EMPLOI',
          typeUtilisateur: 'JEUNE',
        })

        // When
        render(await AuthError({ searchParams }))

        // Then
        expect(
          screen.getByRole('link', { name: 'Télécharger l’application' })
        ).toHaveAttribute('href', urlStore)
      }
    )

    it('n’affiche pas de bouton de téléchargement sur ordinateur', async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_PASS_EMPLOI_PARCOURS_EMPLOI',
        typeUtilisateur: 'JEUNE',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      expect(
        screen.queryByRole('link', { name: 'Télécharger l’application' })
      ).not.toBeInTheDocument()
    })
  })

  describe('migration Pass Emploi vers 1 jeune 1 solution', () => {
    it('affiche la page de migration jeune', async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_1J1S',
        typeUtilisateur: 'JEUNE',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      const mainContent = screen.getByRole('main', {
        name: 'pass emploi devient 1 jeune 1 solution',
      })
      expect(
        within(mainContent).getByText(
          'Téléchargez la nouvelle application 1 jeune 1 solution pour continuer à profiter de tous les services.'
        )
      ).toBeInTheDocument()
    })

    it.each([
      [
        'iOS',
        USER_AGENT_IOS,
        'https://apps.apple.com/app/apple-store/id1581603519',
      ],
      [
        'Android',
        USER_AGENT_ANDROID,
        'https://play.google.com/store/apps/details?id=fr.fabrique.social.gouv.passemploi',
      ],
    ])(
      'renvoie vers le store 1 jeune 1 solution sur %s',
      async (_, userAgent, urlStore) => {
        // Given
        simulerUserAgent(userAgent)
        const searchParams = Promise.resolve({
          reason: 'MIGRATION_1J1S',
          typeUtilisateur: 'JEUNE',
        })

        // When
        render(await AuthError({ searchParams }))

        // Then
        expect(
          screen.getByRole('link', { name: 'Télécharger l’application' })
        ).toHaveAttribute('href', urlStore)
      }
    )

    it('n’affiche pas de bouton de téléchargement sur ordinateur', async () => {
      // Given
      const searchParams = Promise.resolve({
        reason: 'MIGRATION_1J1S',
        typeUtilisateur: 'JEUNE',
      })

      // When
      render(await AuthError({ searchParams }))

      // Then
      expect(
        screen.queryByRole('link', { name: 'Télécharger l’application' })
      ).not.toBeInTheDocument()
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
