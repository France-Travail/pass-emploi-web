import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { useLienExterne } from 'utils/hooks/useLienExterne'

jest.mock('components/ConfirmationRedirectionModal', () =>
  jest.fn(({ lien, onConfirmation, onCancel }) => (
    <div>
      <span data-testid='modal-lien'>{lien}</span>
      <button onClick={onConfirmation}>Confirmer</button>
      <button onClick={onCancel}>Annuler</button>
    </div>
  ))
)

function ComposantTest({ lien }: { lien: string }) {
  const { confirmer, modal } = useLienExterne()
  return (
    <>
      <a href={lien} onClick={(e) => confirmer(e, lien)} data-testid='lien'>
        Ouvrir
      </a>
      {modal}
    </>
  )
}

describe('useLienExterne', () => {
  beforeEach(() => {
    window.open = jest.fn()
  })

  it("n'affiche pas la modale par défaut", () => {
    render(<ComposantTest lien='https://example.com' />)
    expect(screen.queryByTestId('modal-lien')).not.toBeInTheDocument()
  })

  it('affiche la modale au clic sur le lien', async () => {
    render(<ComposantTest lien='https://example.com' />)

    await userEvent.click(screen.getByTestId('lien'))

    expect(screen.getByTestId('modal-lien')).toHaveTextContent(
      'https://example.com'
    )
  })

  it('ouvre le lien dans un nouvel onglet à la confirmation', async () => {
    render(<ComposantTest lien='https://example.com' />)

    await userEvent.click(screen.getByTestId('lien'))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

    expect(window.open).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer'
    )
    expect(screen.queryByTestId('modal-lien')).not.toBeInTheDocument()
  })

  it("ferme la modale sans ouvrir de lien à l'annulation", async () => {
    render(<ComposantTest lien='https://example.com' />)

    await userEvent.click(screen.getByTestId('lien'))
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))

    expect(window.open).not.toHaveBeenCalled()
    expect(screen.queryByTestId('modal-lien')).not.toBeInTheDocument()
  })
})
