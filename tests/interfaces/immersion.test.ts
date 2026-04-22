import { unDetailImmersionJson } from 'fixtures/offre'
import { jsonToDetailImmersion } from 'interfaces/json/immersion'
import {
  ImmersionAccessibleTravailleurHandicape,
  ImmersionModeContact,
  ImmersionModeDistanciel,
  TypeOffre,
  buildImmersionId,
  parseImmersionId,
} from 'interfaces/offre'

describe('buildImmersionId / parseImmersionId', () => {
  it('construit un id composite avec ~', () => {
    expect(buildImmersionId('12345', 'M1805', 'loc-1')).toBe(
      '12345~M1805~loc-1'
    )
  })

  it('parse un id composite en ses composantes', () => {
    expect(parseImmersionId('12345~M1805~loc-1')).toEqual({
      siret: '12345',
      appellationCode: 'M1805',
      locationId: 'loc-1',
    })
  })

  it('est symétrique : parse(build(x)) === x', () => {
    const siret = '89081896600016'
    const appellationCode = 'M1805'
    const locationId = 'loc-abc'
    expect(
      parseImmersionId(buildImmersionId(siret, appellationCode, locationId))
    ).toEqual({
      siret,
      appellationCode,
      locationId,
    })
  })
})

describe('jsonToDetailImmersion', () => {
  it('transforme un JSON minimal en DetailImmersion', () => {
    const json = unDetailImmersionJson()
    const result = jsonToDetailImmersion(json)

    expect(result.type).toBe(TypeOffre.IMMERSION)
    expect(result.id).toBe(
      buildImmersionId(json.siret, json.appellationCode, json.locationId)
    )
    expect(result.titre).toBe(json.metier)
    expect(result.nomEtablissement).toBe(json.nomEtablissement)
    expect(result.ville).toBe(json.ville)
    expect(result.secteurActivite).toBe(json.secteurActivite)
    expect(result.contact.adresse).toBe(json.adresse)
    expect(result.contact.mode).toBe(json.contact)
    expect(result.modeDistanciel).toBe(json.modeDistanciel)
  })

  it('mappe les champs optionnels quand présents', () => {
    const json = unDetailImmersionJson({
      informationsComplementaires: 'Venez avec votre CV.',
      siteWeb: 'https://mado-xr.com',
      accessibleTravailleurHandicape:
        ImmersionAccessibleTravailleurHandicape.YES_FT_CERTIFIED,
    })

    const result = jsonToDetailImmersion(json)

    expect(result.informationsComplementaires).toBe('Venez avec votre CV.')
    expect(result.siteWeb).toBe('https://mado-xr.com')
    expect(result.accessibleTravailleurHandicape).toBe(
      ImmersionAccessibleTravailleurHandicape.YES_FT_CERTIFIED
    )
  })

  it('laisse les champs optionnels à undefined quand absents', () => {
    const json = unDetailImmersionJson()
    const result = jsonToDetailImmersion(json)

    expect(result.informationsComplementaires).toBeUndefined()
    expect(result.siteWeb).toBeUndefined()
    expect(result.accessibleTravailleurHandicape).toBeUndefined()
  })

  it('mappe tous les modes de contact', () => {
    for (const mode of Object.values(ImmersionModeContact)) {
      const json = unDetailImmersionJson({ contact: mode })
      expect(jsonToDetailImmersion(json).contact.mode).toBe(mode)
    }
  })

  it('mappe tous les modes distanciel', () => {
    for (const mode of Object.values(ImmersionModeDistanciel)) {
      const json = unDetailImmersionJson({ modeDistanciel: mode })
      expect(jsonToDetailImmersion(json).modeDistanciel).toBe(mode)
    }
  })
})
