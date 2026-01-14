import { render, screen } from '@testing-library/react'
import React from 'react'

import ErrorPageLayout from 'components/layouts/ErrorPageLayout'

describe('ErrorPageLayout', () => {
  it('affiche le contenu avec le titre', () => {
    // GIVEN & WHEN
    render(
      <ErrorPageLayout title='Test Title' ariaLabelledBy='test-id'>
        <p>Contenu de test</p>
      </ErrorPageLayout>
    )

    // THEN
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Contenu de test')).toBeInTheDocument()
  })

  it('applique la className personnalisée au main', () => {
    // GIVEN & WHEN
    render(
      <ErrorPageLayout
        title='Test Title'
        ariaLabelledBy='test-id'
        className='bg-[#EEF1F8]'
      >
        <p>Contenu de test</p>
      </ErrorPageLayout>
    )

    // THEN
    const main = screen.getByRole('main')
    expect(main).toHaveClass('bg-[#EEF1F8]')
  })

  it('fonctionne sans className', () => {
    // GIVEN & WHEN
    render(
      <ErrorPageLayout title='Test Title'>
        <p>Contenu de test</p>
      </ErrorPageLayout>
    )

    // THEN
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex')
    expect(main).toHaveClass('flex-col')
    expect(main).toHaveClass('min-h-screen')
  })
})
