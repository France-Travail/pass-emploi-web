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
})
