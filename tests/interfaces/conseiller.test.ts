import { DateTime } from 'luxon'

import { unConseiller } from 'fixtures/conseiller'
import { doitRenseignerSonAgence } from 'interfaces/conseiller'
import {
  structureAvenirPro,
  structureConseilDepartemental,
  structureFTCej,
  structureMilo,
} from 'interfaces/structure'

describe('doitRenseignerSonAgence', () => {
  it('est vrai pour un conseiller France Travail sans agence', () => {
    const conseiller = unConseiller({ structure: structureFTCej })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(true)
  })

  it('est vrai pour un conseiller France Travail dont l’agence est saisie à la main', () => {
    const conseiller = unConseiller({
      structure: structureFTCej,
      agence: { nom: 'Agence saisie à la main' },
    })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(true)
  })

  it('est vrai pour un conseiller France Travail dont l’agence n’a jamais été confirmée', () => {
    const conseiller = unConseiller({
      structure: structureFTCej,
      agence: { id: 'id-agence', nom: 'Agence du référentiel' },
    })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(true)
  })

  it('est vrai pour un conseiller France Travail confirmé il y a plus de 6 mois', () => {
    const conseiller = unConseiller({
      structure: structureFTCej,
      agence: { id: 'id-agence', nom: 'Agence du référentiel' },
      dateMajAgence: DateTime.now().minus({ months: 6, days: 1 }),
    })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(true)
  })

  it('est faux pour un conseiller France Travail confirmé il y a moins de 6 mois', () => {
    const conseiller = unConseiller({
      structure: structureFTCej,
      agence: { id: 'id-agence', nom: 'Agence du référentiel' },
      dateMajAgence: DateTime.now().minus({ months: 5 }),
    })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(false)
  })

  it('est vrai pour un conseiller Avenir pro sans agence confirmée', () => {
    const conseiller = unConseiller({ structure: structureAvenirPro })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(true)
  })

  it('est faux pour un conseiller Mission Locale', () => {
    const conseiller = unConseiller({ structure: structureMilo })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(false)
  })

  it('est faux pour un conseiller Conseil départemental', () => {
    const conseiller = unConseiller({
      structure: structureConseilDepartemental,
    })

    expect(doitRenseignerSonAgence(conseiller)).toEqual(false)
  })
})
