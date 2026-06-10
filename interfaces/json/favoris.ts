import { Offre } from 'interfaces/favoris'
import { rootLogger } from 'utils/monitoring/logger'

export type TypeOffreJson =
  | 'OFFRE_EMPLOI'
  | 'OFFRE_ALTERNANCE'
  | 'OFFRE_IMMERSION'
  | 'OFFRE_SERVICE_CIVIQUE'

function logMappingWarning(message: string): void {
  if (typeof window === 'undefined') {
    rootLogger.info(
      { event: { action: 'data_mapping_warning', outcome: 'failure' } },
      message
    )
  }
}

export interface OffreJson {
  idOffre: string
  titre: string
  type: TypeOffreJson
  dateCreation: string
  dateCandidature?: string
  organisation?: string
  localisation?: string
}

export function jsonToOffre(offreJson: OffreJson): Offre {
  const offre: Offre = {
    id: offreJson.idOffre,
    titre: offreJson.titre,
    type: jsonToLabelTypeOffre(offreJson.type),
    urlParam: jsonToUrlParam(offreJson.type),
    dateUpdate: offreJson.dateCandidature ?? offreJson.dateCreation,
    aPostule: Boolean(offreJson.dateCandidature),
  }

  if (offreJson.organisation) offre.organisation = offreJson.organisation
  if (offreJson.localisation) offre.localisation = offreJson.localisation

  return offre
}

export function jsonToLabelTypeOffre(type: TypeOffreJson): string {
  switch (type) {
    case 'OFFRE_EMPLOI':
      return 'Offre d’emploi'
    case 'OFFRE_ALTERNANCE':
      return 'Alternance'
    case 'OFFRE_IMMERSION':
      return 'Immersion'
    case 'OFFRE_SERVICE_CIVIQUE':
      return 'Service civique'
    default:
      logMappingWarning(`Type offre ${type} inconnu`)
      return ''
  }
}

export function jsonToUrlParam(type: TypeOffreJson): string {
  switch (type) {
    case 'OFFRE_EMPLOI':
      return 'emploi'
    case 'OFFRE_ALTERNANCE':
      return 'alternance'
    case 'OFFRE_IMMERSION':
      return 'immersion'
    case 'OFFRE_SERVICE_CIVIQUE':
      return 'service-civique'
  }
}
