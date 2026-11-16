/*** Constantes ***/

export const structureMilo = 'MILO'
export const structureFTCej = 'POLE_EMPLOI'
export const structureBrsa = 'POLE_EMPLOI_BRSA'
export const structureAvenirPro = 'AVENIR_PRO'
export const structureAij = 'POLE_EMPLOI_AIJ'
export const structureAccompagnementIntensif = 'FT_ACCOMPAGNEMENT_INTENSIF'
export const structureAccompagnementGlobal = 'FT_ACCOMPAGNEMENT_GLOBAL'
export const structureEquipEmploiRecrut = 'FT_EQUIP_EMPLOI_RECRUT'
export const structureConseilDepartemental = 'CONSEIL_DEPT'

const structures1j1s = [
  structureMilo,
  structureFTCej,
  structureAij,
  structureAvenirPro,
] as const

export const structuresFranceTravail = [
  structureFTCej,
  structureBrsa,
  structureAij,
  structureAccompagnementIntensif,
  structureAccompagnementGlobal,
  structureEquipEmploiRecrut,
  structureAvenirPro,
] as const

/*** Types ***/

type Structure1j1s = (typeof structures1j1s)[number]

type StructureFTConnect = (typeof structuresFranceTravail)[number]

export type Structure =
  | StructureFTConnect
  | typeof structureMilo
  | typeof structureConseilDepartemental

/*** Outils ***/

export function estStructure(structure: string): structure is Structure {
  return (
    estFranceTravail(structure) ||
    estMilo(structure) ||
    estConseilDepartemental(structure)
  )
}

export function estMilo(structure: string): structure is typeof structureMilo {
  return structure === structureMilo
}

export function estAvenirPro(
  structure: string
): structure is typeof structureAvenirPro {
  return structure === structureAvenirPro
}

export function estConseilDepartemental(
  structure: string
): structure is typeof structureConseilDepartemental {
  return structure === structureConseilDepartemental
}

export function estBRSA(structure: string): structure is typeof structureBrsa {
  return structure === structureBrsa
}

export function estPassEmploi(
  structure: string
): structure is Exclude<Structure, Structure1j1s> {
  return !([...structures1j1s] as string[]).includes(structure)
}

export function estFranceTravail(
  structure: string
): structure is StructureFTConnect {
  return ([...structuresFranceTravail] as string[]).includes(structure)
}

export function labelStructure(structure: string): string {
  switch (structure) {
    case structureFTCej:
      return 'CEJ'
    case structureBrsa:
      return 'RSA rénové'
    case structureAij:
      return 'AIJ'
    case structureAccompagnementIntensif:
      return 'REN-Intensif / FTT-FTX'
    case structureAccompagnementGlobal:
      return 'Accompagnement global'
    case structureEquipEmploiRecrut:
      return 'Equip’emploi / Equip’recrut'
    case structureAvenirPro:
      return 'Avenir pro'
    default:
      return structure
  }
}

export function getUrlSiteRessource(structure: Structure): string {
  switch (structure) {
    case 'MILO':
      return process.env.NEXT_PUBLIC_FAQ_MILO_EXTERNAL_LINK as string
    case 'POLE_EMPLOI':
    case 'POLE_EMPLOI_AIJ':
    case 'AVENIR_PRO':
      return process.env.NEXT_PUBLIC_FAQ_PE_EXTERNAL_LINK as string
    case 'POLE_EMPLOI_BRSA':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return process.env.NEXT_PUBLIC_FAQ_PASS_EMPLOI_EXTERNAL_LINK as string
    case 'CONSEIL_DEPT':
      return process.env.NEXT_PUBLIC_FAQ_CD_BRSA_EXTERNAL_LINK as string
  }
}

export function getUrlFormulaireSupport(structure: Structure): string {
  const urlSiteRessource = getUrlSiteRessource(structure)

  switch (structure) {
    case 'MILO':
    case 'POLE_EMPLOI_BRSA':
    case 'CONSEIL_DEPT':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return urlSiteRessource + 'assistance/'
    case 'POLE_EMPLOI':
    case 'POLE_EMPLOI_AIJ':
    case 'AVENIR_PRO':
      return urlSiteRessource + 'formuler-une-demande/'
  }
}
