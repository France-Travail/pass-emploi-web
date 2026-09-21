import { render } from '@testing-library/react'

import { unConseiller } from 'fixtures/conseiller'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { setRumUser } from 'utils/monitoring/elastic'

jest.mock('utils/monitoring/elastic', () => ({ setRumUser: jest.fn() }))

describe('ConseillerProvider', () => {
  it('identifie le conseiller dans le RUM', () => {
    const conseiller = unConseiller({ id: 'conseiller-1', structure: 'MILO' })

    render(
      <ConseillerProvider conseiller={conseiller}>
        <div />
      </ConseillerProvider>
    )

    expect(setRumUser).toHaveBeenCalledWith({
      id: 'conseiller-1',
      structure: 'MILO',
    })
  })
})
