export enum TypeOffre {
  EMPLOI = 'EMPLOI',
  SERVICE_CIVIQUE = 'SERVICE_CIVIQUE',
  IMMERSION = 'IMMERSION',
  ALTERNANCE = 'ALTERNANCE',
}
export type BaseOffre = BaseOffreEmploi | BaseServiceCivique | BaseImmersion
export type DetailOffre =
  | DetailOffreEmploi
  | DetailServiceCivique
  | DetailImmersion

export type BaseOffreEmploi = {
  type: TypeOffre.EMPLOI | TypeOffre.ALTERNANCE
  id: string
  titre: string
  typeContrat: string

  nomEntreprise?: string
  localisation?: string
  duree?: string
}

export type DetailOffreEmploi = BaseOffreEmploi & {
  competences: string[]
  competencesProfessionnelles: string[]
  dateActualisation: string
  formations: string[]
  langues: string[]
  permis: string[]
  typeContratLibelle: string

  origine?: { nom: string; logo?: string }
  description?: string
  experience?: DetailOffreEmploiExperience
  horaires?: string
  infoEntreprise?: DetailOffreEmploiInfoEntreprise
  urlPostulation?: string
  salaire?: string
}
export type DetailOffreEmploiExperience = { libelle: string; exigee?: boolean }

export type DetailOffreEmploiInfoEntreprise = {
  detail?: string
  lien?: string
  adaptee?: boolean
  accessibleTH?: boolean
}

export type BaseServiceCivique = {
  type: TypeOffre.SERVICE_CIVIQUE
  id: string
  titre: string
  domaine: string

  ville?: string
  organisation?: string
  dateDeDebut?: string
}

export type DetailServiceCivique = BaseServiceCivique & {
  dateDeFin?: string
  lienAnnonce?: string
  description?: string
  descriptionOrganisation?: string
  urlOrganisation?: string
  adresseMission?: string
  adresseOrganisation?: string
  codeDepartement?: string
  codePostal?: string
}

const IMMERSION_ID_SEPARATOR = '~'

export function buildImmersionId(
  siret: string,
  appellationCode: string,
  locationId: string
): string {
  return [siret, appellationCode, locationId].join(IMMERSION_ID_SEPARATOR)
}

export function parseImmersionId(id: string): {
  siret: string
  appellationCode: string
  locationId: string
} {
  const [siret, appellationCode, locationId] = id.split(IMMERSION_ID_SEPARATOR)
  return { siret, appellationCode, locationId }
}

export type BaseImmersion = {
  type: TypeOffre.IMMERSION
  id: string
  titre: string
  nomEtablissement: string
  secteurActivite: string
  ville: string
  accessibleTravailleurHandicape?: ImmersionAccessibleTravailleurHandicape
}

export type DetailImmersion = BaseImmersion & {
  contact: {
    adresse: string
    mode: ImmersionModeContact
  }
  informationsComplementaires?: string
  siteWeb?: string
  modeDistanciel: ImmersionModeDistanciel
}

export enum ImmersionModeContact {
  EMAIL = 'EMAIL',
  TELEPHONE = 'TELEPHONE',
  PRESENTIEL = 'PRESENTIEL',
}
export enum ImmersionModeDistanciel {
  FULL_REMOTE = 'FULL_REMOTE',
  HYBRID = 'HYBRID',
  ON_SITE = 'ON_SITE',
}
export enum ImmersionAccessibleTravailleurHandicape {
  YES_FT_CERTIFIED = 'yes-ft-certified',
  YES_DECLARED_ONLY = 'yes-declared-only',
  NO = 'no',
}
