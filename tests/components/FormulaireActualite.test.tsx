import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import FormulaireActualite from 'components/chat/FormulaireActualite'

describe('FormulaireActualite', () => {
  const onCreation = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('affichage initial', () => {
    it('affiche les champs obligatoires Titre et Contenu', () => {
      // When
      render(<FormulaireActualite onCreation={onCreation} />)

      // Then
      expect(screen.getByPlaceholderText('Renseigner un titre pour votre actualité')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Renseigner une description pour votre actualité')).toBeInTheDocument()
    })

    it('affiche les champs optionnels Titre du lien et Lien de redirection', () => {
      // When
      render(<FormulaireActualite onCreation={onCreation} />)

      // Then
      expect(screen.getByPlaceholderText("Nom du lien qui s'affichera auprès des bénéficiaires")).toBeInTheDocument()
      expect(screen.getByPlaceholderText('https://')).toBeInTheDocument()
    })

    it('affiche le bouton de soumission', () => {
      // When
      render(<FormulaireActualite onCreation={onCreation} />)

      // Then
      expect(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      ).toBeInTheDocument()
    })

    it('passe le test a11y', async () => {
      // When
      const { container } = render(
        <FormulaireActualite onCreation={onCreation} />
      )

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('validation à la soumission', () => {
    it('affiche une erreur si le titre est vide', async () => {
      // Given
      render(<FormulaireActualite onCreation={onCreation} />)

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )

      // Then
      expect(
        screen.getByText('Le champ "Titre" est obligatoire')
      ).toBeInTheDocument()
      expect(onCreation).not.toHaveBeenCalled()
    })

    it('affiche une erreur si le contenu est vide', async () => {
      // Given
      render(<FormulaireActualite onCreation={onCreation} />)
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'Mon titre')

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )

      // Then
      expect(
        screen.getByText('Le champ "Contenu" est obligatoire')
      ).toBeInTheDocument()
      expect(onCreation).not.toHaveBeenCalled()
    })

    it('affiche une erreur si le titre du lien est renseigné sans lien', async () => {
      // Given
      render(<FormulaireActualite onCreation={onCreation} />)
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'Mon titre')
      await userEvent.type(
        screen.getByPlaceholderText('Renseigner une description pour votre actualité'),
        'Mon contenu de test'
      )
      await userEvent.type(
        screen.getByPlaceholderText("Nom du lien qui s'affichera auprès des bénéficiaires"),
        'En savoir plus'
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )

      // Then
      expect(
        screen.getByText(
          'Si vous renseignez un titre de lien, le lien est obligatoire'
        )
      ).toBeInTheDocument()
      expect(onCreation).not.toHaveBeenCalled()
    })

    it('affiche une erreur si le lien a un format invalide', async () => {
      // Given
      render(<FormulaireActualite onCreation={onCreation} />)
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'Mon titre')
      await userEvent.type(
        screen.getByPlaceholderText('Renseigner une description pour votre actualité'),
        'Mon contenu de test'
      )
      await userEvent.type(
        screen.getByPlaceholderText('https://'),
        'pas-une-url-valide'
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )

      // Then
      expect(
        screen.getByText('Le lien doit commencer par http:// ou https://')
      ).toBeInTheDocument()
      expect(onCreation).not.toHaveBeenCalled()
    })

    it("efface l'erreur du titre quand l'utilisateur saisit", async () => {
      // Given
      render(<FormulaireActualite onCreation={onCreation} />)
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )
      expect(
        screen.getByText('Le champ "Titre" est obligatoire')
      ).toBeInTheDocument()

      // When
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'M')

      // Then
      expect(() =>
        screen.getByText('Le champ "Titre" est obligatoire')
      ).toThrow()
    })
  })

  describe('soumission valide', () => {
    it('appelle onCreation avec les valeurs saisies', async () => {
      // Given
      onCreation.mockResolvedValue(undefined)
      render(<FormulaireActualite onCreation={onCreation} />)
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'Mon titre')
      await userEvent.type(
        screen.getByPlaceholderText('Renseigner une description pour votre actualité'),
        'Mon contenu de test'
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )

      // Then
      expect(onCreation).toHaveBeenCalledWith(
        'Mon titre',
        'Mon contenu de test',
        undefined,
        undefined
      )
    })

    it('appelle onCreation avec le lien si renseigné', async () => {
      // Given
      onCreation.mockResolvedValue(undefined)
      render(<FormulaireActualite onCreation={onCreation} />)
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'Mon titre')
      await userEvent.type(
        screen.getByPlaceholderText('Renseigner une description pour votre actualité'),
        'Mon contenu de test'
      )
      await userEvent.type(
        screen.getByPlaceholderText("Nom du lien qui s'affichera auprès des bénéficiaires"),
        'En savoir plus'
      )
      await userEvent.type(
        screen.getByPlaceholderText('https://'),
        'https://example.com'
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )

      // Then
      expect(onCreation).toHaveBeenCalledWith(
        'Mon titre',
        'Mon contenu de test',
        'En savoir plus',
        'https://example.com'
      )
    })

    it('affiche un état de chargement pendant la soumission', async () => {
      // Given
      let resolve: () => void
      onCreation.mockReturnValue(
        new Promise<void>((res) => {
          resolve = res
        })
      )
      render(<FormulaireActualite onCreation={onCreation} />)
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'Mon titre')
      await userEvent.type(
        screen.getByPlaceholderText('Renseigner une description pour votre actualité'),
        'Mon contenu de test'
      )

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Diffuser mon actualité/ })
      )

      // Then
      expect(screen.getByText('Chargement en cours')).toBeInTheDocument()
      resolve!()
    })
  })

  describe('compteurs de caractères', () => {
    it('affiche le compteur du titre', () => {
      // When
      render(<FormulaireActualite onCreation={onCreation} />)

      // Then
      expect(screen.getByText('0 / 100')).toBeInTheDocument()
    })

    it('met à jour le compteur du titre à la saisie', async () => {
      // Given
      render(<FormulaireActualite onCreation={onCreation} />)

      // When
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), 'Bonjour')

      // Then
      expect(screen.getByText('7 / 100')).toBeInTheDocument()
    })

    it("n'accepte pas plus de 100 caractères pour le titre", async () => {
      // Given
      render(<FormulaireActualite onCreation={onCreation} />)
      const titre101Chars = 'a'.repeat(101)

      // When
      await userEvent.type(screen.getByPlaceholderText('Renseigner un titre pour votre actualité'), titre101Chars)

      // Then
      expect(screen.getByText('100 / 100')).toBeInTheDocument()
    })

    it('affiche le compteur du titre du lien', () => {
      // When
      render(<FormulaireActualite onCreation={onCreation} />)

      // Then
      expect(screen.getByText('0 / 50')).toBeInTheDocument()
    })
  })
})
