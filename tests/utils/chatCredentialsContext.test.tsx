import { act, render } from '@testing-library/react'

import { unConseiller } from 'fixtures/conseiller'
import { getChatCredentials, signIn } from 'services/messages.service'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

jest.mock('services/messages.service')

describe('ChatCredentialsProvider', () => {
  beforeEach(async () => {
    // When
    ;(getChatCredentials as jest.Mock).mockResolvedValue({
      token: 'tokenFirebase',
      cleChiffrement: 'cleChiffrement',
    })
    ;(signIn as jest.Mock).mockResolvedValue({})
  })

  it('se connecte à la messagerie', async () => {
    // When
    await act(async () =>
      render(
        <ConseillerProvider conseiller={unConseiller()}>
          <ChatCredentialsProvider>
            <div />
          </ChatCredentialsProvider>
        </ConseillerProvider>
      )
    )

    // Then
    expect(getChatCredentials).toHaveBeenCalledWith()
    expect(signIn).toHaveBeenCalledWith('tokenFirebase')
  })
})
