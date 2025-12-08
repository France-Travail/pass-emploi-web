import { DateTime } from 'luxon'

import { getPreviousItemId } from 'interfaces/message'

describe('getPreviousIndices', () => {
  const date = DateTime.now()
  const idATrouver = 'idATrouver'

  it('renvoie undefined pour les contenus vides', async () => {
    expect(
      getPreviousItemId(idATrouver, { countMessagesFetched: 0, days: [] })
    ).toEqual(undefined)
  })

  it('renvoie undefined si l’élément n’existe pas', async () => {
    expect(
      getPreviousItemId(idATrouver, {
        countMessagesFetched: 1,
        days: [{ date, messages: [{ id: 'id2' }] }],
      })
    ).toEqual(undefined)
    expect(
      getPreviousItemId(idATrouver, {
        countMessagesFetched: 3,
        days: [
          { date, messages: [{ id: 'id2' }, { id: 'id3' }] },
          { date, messages: [] },
          { date, messages: [{ id: 'id4' }] },
        ],
      })
    ).toEqual(undefined)
  })

  it('renvoie l’élément précédent du même jour', async () => {
    expect(
      getPreviousItemId(idATrouver, {
        countMessagesFetched: 3,
        days: [
          {
            date,
            messages: [{ id: 'id2' }, { id: 'id3' }, { id: idATrouver }],
          },
        ],
      })
    ).toEqual('id3')
  })

  it('renvoie le dernier élément du jour précédent', async () => {
    expect(
      getPreviousItemId(idATrouver, {
        countMessagesFetched: 4,
        days: [
          { date, messages: [{ id: 'id2' }] },
          {
            date,
            messages: [{ id: idATrouver }, { id: 'id3' }, { id: 'id4' }],
          },
        ],
      })
    ).toEqual('id2')
  })

  it('renvoie le dernier élément du 1er jour précédent avec des éléments', async () => {
    expect(
      getPreviousItemId(idATrouver, {
        countMessagesFetched: 4,
        days: [
          { date, messages: [{ id: 'id2' }] },
          { date, messages: [] },
          { date, messages: [] },
          {
            date,
            messages: [{ id: idATrouver }, { id: 'id3' }, { id: 'id4' }],
          },
        ],
      })
    ).toEqual('id2')
  })

  it('renvoie undefined si pas d’élément précédent', async () => {
    expect(
      getPreviousItemId(idATrouver, {
        countMessagesFetched: 3,
        days: [
          { date, messages: [] },
          { date, messages: [] },
          {
            date,
            messages: [{ id: idATrouver }, { id: 'id3' }, { id: 'id4' }],
          },
        ],
      })
    ).toEqual(undefined)
  })
})
