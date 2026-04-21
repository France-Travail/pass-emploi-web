import { render, screen } from '@testing-library/react'

import TagAccessibleHandicap from 'components/offres/TagAccessibleHandicap'
import { ImmersionAccessibleTravailleurHandicape } from 'interfaces/offre'

describe('TagAccessibleHandicap', () => {
  it("n'affiche rien si la prop est absente", () => {
    const { container } = render(<TagAccessibleHandicap />)
    expect(container).toBeEmptyDOMElement()
  })

  it("n'affiche rien si la valeur est NO", () => {
    const { container } = render(
      <TagAccessibleHandicap
        accessibleTravailleurHandicape={
          ImmersionAccessibleTravailleurHandicape.NO
        }
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('affiche le tag pour YES_FT_CERTIFIED', () => {
    render(
      <TagAccessibleHandicap
        accessibleTravailleurHandicape={
          ImmersionAccessibleTravailleurHandicape.YES_FT_CERTIFIED
        }
      />
    )
    expect(
      screen.getByText('Personnes en situation de handicap bienvenues')
    ).toBeInTheDocument()
  })

  it('affiche le tag pour YES_DECLARED_ONLY', () => {
    render(
      <TagAccessibleHandicap
        accessibleTravailleurHandicape={
          ImmersionAccessibleTravailleurHandicape.YES_DECLARED_ONLY
        }
      />
    )
    expect(
      screen.getByText('Personnes en situation de handicap bienvenues')
    ).toBeInTheDocument()
  })

  it('applique la className passée en prop', () => {
    const { container } = render(
      <TagAccessibleHandicap
        accessibleTravailleurHandicape={
          ImmersionAccessibleTravailleurHandicape.YES_FT_CERTIFIED
        }
        className='mb-4'
      />
    )
    expect(container.firstChild).toHaveClass('mb-4')
  })
})
