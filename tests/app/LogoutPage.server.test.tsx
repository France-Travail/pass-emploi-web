import { render } from '@testing-library/react'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import Logout from 'app/(connexion)/logout/page'

jest.mock('app/(connexion)/logout/LogoutPage')

describe('LogoutPage server side', () => {
  it('prepare la page', async () => {
    // When
    render(await Logout())

    // Then
    expect(LogoutPage).toHaveBeenCalledWith(
      { callbackUrl: '/login' },
      undefined
    )
  })
})
