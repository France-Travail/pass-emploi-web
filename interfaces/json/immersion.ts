import {
  DetailImmersion,
  ImmersionAccessibleTravailleurHandicape,
  ImmersionModeContact,
  ImmersionModeDistanciel,
  TypeOffre,
  buildImmersionId,
} from 'interfaces/offre'

export type SearchImmersionsResultJson = {
  offres: ImmersionItemJson[]
  nombrePages: number
  nombreTotal: number
}

export type ImmersionItemJson = {
  siret: string
  appellationCode: string
  locationId: string
  metier: string
  nomEtablissement: string
  secteurActivite: string
  ville: string
  accessibleTravailleurHandicape?: ImmersionAccessibleTravailleurHandicape
}

export type DetailImmersionJson = ImmersionItemJson & {
  adresse: string
  contact: ImmersionModeContact
  informationsComplementaires?: string
  siteWeb?: string
  modeDistanciel: ImmersionModeDistanciel
}

export function jsonToDetailImmersion(
  json: DetailImmersionJson
): DetailImmersion {
  return {
    type: TypeOffre.IMMERSION,
    id: buildImmersionId(json.siret, json.appellationCode, json.locationId),
    titre: json.metier,
    nomEtablissement: json.nomEtablissement,
    ville: json.ville,
    secteurActivite: json.secteurActivite,
    contact: { adresse: json.adresse, mode: json.contact },
    informationsComplementaires: json.informationsComplementaires,
    siteWeb: json.siteWeb,
    modeDistanciel: json.modeDistanciel,
    accessibleTravailleurHandicape: json.accessibleTravailleurHandicape,
  }
}
