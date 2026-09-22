import { DateTime } from 'luxon'

import { unConseiller } from 'fixtures/conseiller'
import { unProfilFT } from 'fixtures/profil'
import {
  doitConfirmerSonDispositif,
  doitRenseignerSonAgence,
} from 'interfaces/conseiller'
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

describe('doitConfirmerSonDispositif', () => {
  it('est vrai pour un conseiller France Travail qui n’a jamais confirmé son dispositif', () => {
    const conseiller = unConseiller({ structure: structureFTCej })

    expect(doitConfirmerSonDispositif(conseiller)).toEqual(true)
  })

  it('est vrai pour un conseiller France Travail confirmé il y a plus d’un an', () => {
    const conseiller = unConseiller({
      structure: structureFTCej,
      dateMajDispositif: DateTime.now().minus({ years: 1, days: 1 }),
    })

    expect(doitConfirmerSonDispositif(conseiller)).toEqual(true)
  })

  it('est faux pour un conseiller France Travail confirmé il y a moins d’un an', () => {
    const conseiller = unConseiller({
      structure: structureFTCej,
      dateMajDispositif: DateTime.now().minus({ months: 11 }),
    })

    expect(doitConfirmerSonDispositif(conseiller)).toEqual(false)
  })

  it('est vrai pour un conseiller Avenir pro qui n’a jamais confirmé son dispositif', () => {
    const conseiller = unConseiller({ structure: structureAvenirPro })

    expect(doitConfirmerSonDispositif(conseiller)).toEqual(true)
  })

  it('est faux pour un conseiller France Travail sans dispositif, qui doit d’abord le choisir', () => {
    const conseiller = unConseiller({
      structure: structureFTCej,
      profil: unProfilFT(null),
    })

    expect(doitConfirmerSonDispositif(conseiller)).toEqual(false)
  })

  it('est faux pour un conseiller Mission Locale', () => {
    const conseiller = unConseiller({ structure: structureMilo })

    expect(doitConfirmerSonDispositif(conseiller)).toEqual(false)
  })

  it('est faux pour un conseiller Conseil départemental', () => {
    const conseiller = unConseiller({
      structure: structureConseilDepartemental,
    })

    expect(doitConfirmerSonDispositif(conseiller)).toEqual(false)
  })
})
