import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginHubPage from 'app/(connexion)/login/LoginHubPage'
import { signin } from 'utils/auth/auth'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

jest.mock('utils/auth/auth', () => ({
  signin: jest.fn(),
}))

describe('LoginHubPage client side', () => {
  let container: HTMLElement
  beforeEach(async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => param,
    })
  })

  describe('render', () => {
    const setErrorMsg = jest.fn()
    beforeEach(async () => {
      ;({ container } = render(
        <LoginErrorMessageProvider state={[undefined, setErrorMsg]}>
          <LoginHubPage />
        </LoginErrorMessageProvider>
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche un titre de niveau 1', () => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Bienvenue sur le portail CEJ et Pass emploi',
        })
      ).toBeInTheDocument()
    })

    it('a 3 boutons de connexion', () => {
      expect(
        screen.getByRole('button', {
          name: 'Connexion Mission locale',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'Connexion France Travail',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'Connexion Conseil départemental',
        })
      ).toBeInTheDocument()
      expect(() => screen.getByRole('link')).toThrow()
    })

    it("permet de s'identifier directement en tant que conseiller FT, le dispositif se choisit ensuite", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Connexion France Travail' })
      )

      // Then
      expect(signin).toHaveBeenCalledWith(
        'ft-conseiller',
        setErrorMsg,
        'redirectUrl'
      )
    })
  })
})
