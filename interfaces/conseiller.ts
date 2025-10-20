import { DateTime } from 'luxon'

import { DetailBeneficiaire } from 'interfaces/beneficiaire'
import { MissionLocale } from 'interfaces/referentiel'
import { estMilo, estPassEmploi, Structure } from 'interfaces/structure'
import { dateIsFuture } from 'utils/date'

export enum UserType {
  CONSEILLER = 'CONSEILLER',
}

export enum UserRole {
  SUPERVISEUR = 'SUPERVISEUR',
}

export type BaseConseiller = {
  id: string
  firstName: string
  lastName: string
  email?: string
}

export type SimpleConseiller = BaseConseiller & {
  idStructureMilo?: string
}

export type Conseiller = BaseConseiller & {
  notificationsSonores: boolean
  aDesBeneficiairesARecuperer: boolean
  structure: Structure
  estSuperviseur: boolean
  agence?: { nom: string; id?: string }
  structureMilo?: MissionLocale
  dateSignatureCGU?: string
  dateVisionnageActus?: string
}

export function estSuperviseur(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseur
}

export function aEtablissement(conseiller: Conseiller): boolean {
  return estMilo(conseiller.structure)
    ? Boolean(conseiller.structureMilo)
    : Boolean(conseiller.agence)
}

export function peutAccederAuxSessions(conseiller: Conseiller): boolean {
  return estMilo(conseiller.structure) && Boolean(conseiller.structureMilo)
}

export function doitSignerLesCGU(conseiller: Conseiller): boolean {
  if (!conseiller.dateSignatureCGU) return true

  const dateUpdateCgu = estPassEmploi(conseiller.structure)
    ? DateTime.fromISO(process.env.VERSION_CGU_PASS_EMPLOI_COURANTE!)
    : DateTime.fromISO(process.env.VERSION_CGU_CEJ_COURANTE!)

  return (
    !dateIsFuture(dateUpdateCgu) &&
    DateTime.fromISO(conseiller.dateSignatureCGU) < dateUpdateCgu
  )
}

export function estConseillerReferent(
  conseiller: Pick<Conseiller, 'id'>,
  cible: Pick<DetailBeneficiaire, 'idConseiller'>
): boolean {
  return conseiller.id === cible.idConseiller
}
