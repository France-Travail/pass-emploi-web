import { Dispositif } from 'interfaces/beneficiaire'
import { Structure, structuresFranceTravail } from 'interfaces/structure'

// Profil (structure × dispositif) porté par le claim `userProfile` : la cible.
// Le vocabulaire legacy (`Structure`, 9 valeurs) reste celui du code web ; il
// se recalcule depuis le profil à la frontière (session).

export type StructureProfil =
  | 'MILO'
  | 'FRANCE_TRAVAIL'
  | 'CONSEIL_DEPARTEMENTAL'
  | 'INVITE'

export type DispositifProfil =
  | Dispositif
  | 'DEMANDEUR_D_EMPLOI'
  | 'ESPACE_CANDIDAT'

export type Profil = {
  structure: StructureProfil
  dispositif: DispositifProfil | null
}

const structuresProfil: ReadonlySet<string> = new Set<StructureProfil>([
  'MILO',
  'FRANCE_TRAVAIL',
  'CONSEIL_DEPARTEMENTAL',
  'INVITE',
])

export function estProfil(valeur: unknown): valeur is Profil {
  if (!valeur || typeof valeur !== 'object') return false
  const { structure, dispositif } = valeur as Record<string, unknown>
  return (
    typeof structure === 'string' &&
    structuresProfil.has(structure) &&
    (dispositif === null || typeof dispositif === 'string')
  )
}

export function structureLegacyVersProfil(structure: string): Profil {
  switch (structure) {
    case 'MILO':
      return { structure: 'MILO', dispositif: null }
    case 'CONSEIL_DEPT':
      return { structure: 'CONSEIL_DEPARTEMENTAL', dispositif: null }
    case 'INVITE':
      return { structure: 'INVITE', dispositif: null }
    case 'POLE_EMPLOI_BRSA':
      return { structure: 'FRANCE_TRAVAIL', dispositif: Dispositif.BRSA }
    case 'POLE_EMPLOI_AIJ':
      return { structure: 'FRANCE_TRAVAIL', dispositif: Dispositif.AIJ }
    case 'AVENIR_PRO':
      return { structure: 'FRANCE_TRAVAIL', dispositif: Dispositif.AVENIR_PRO }
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
      return {
        structure: 'FRANCE_TRAVAIL',
        dispositif: Dispositif.ACCOMPAGNEMENT_INTENSIF,
      }
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
      return {
        structure: 'FRANCE_TRAVAIL',
        dispositif: Dispositif.ACCOMPAGNEMENT_GLOBAL,
      }
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return {
        structure: 'FRANCE_TRAVAIL',
        dispositif: Dispositif.EQUIP_EMPLOI_RECRUT,
      }
    case 'FT_DEMANDEUR_D_EMPLOI':
      return { structure: 'FRANCE_TRAVAIL', dispositif: 'DEMANDEUR_D_EMPLOI' }
    case 'FT_ESPACE_CANDIDAT':
      return { structure: 'FRANCE_TRAVAIL', dispositif: 'ESPACE_CANDIDAT' }
    case 'POLE_EMPLOI':
    default:
      return { structure: 'FRANCE_TRAVAIL', dispositif: Dispositif.CEJ }
  }
}

// Une structure legacy France Travail porte un dispositif accompagné : le
// vocabulaire des listes de choix (libellés) reste celui des structures.
export function dispositifDeLaStructureFT(structure: Structure): Dispositif {
  return structureLegacyVersProfil(structure).dispositif as Dispositif
}

export function structureFTDuDispositif(
  dispositif: string
): Structure | undefined {
  return structuresFranceTravail.find(
    (structure) => dispositifDeLaStructureFT(structure) === dispositif
  )
}

export function profilVersStructureLegacy(profil: Profil): Structure {
  switch (profil.structure) {
    case 'MILO':
      return 'MILO'
    case 'CONSEIL_DEPARTEMENTAL':
      return 'CONSEIL_DEPT'
    case 'INVITE':
    case 'FRANCE_TRAVAIL':
      switch (profil.dispositif) {
        case Dispositif.BRSA:
          return 'POLE_EMPLOI_BRSA'
        case Dispositif.AIJ:
          return 'POLE_EMPLOI_AIJ'
        case Dispositif.AVENIR_PRO:
          return 'AVENIR_PRO'
        case Dispositif.ACCOMPAGNEMENT_INTENSIF:
          return 'FT_ACCOMPAGNEMENT_INTENSIF'
        case Dispositif.ACCOMPAGNEMENT_GLOBAL:
          return 'FT_ACCOMPAGNEMENT_GLOBAL'
        case Dispositif.EQUIP_EMPLOI_RECRUT:
          return 'FT_EQUIP_EMPLOI_RECRUT'
        default:
          return 'POLE_EMPLOI'
      }
  }
}
