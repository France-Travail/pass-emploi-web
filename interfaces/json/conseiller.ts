import { DateTime } from 'luxon'
import { Session } from 'next-auth'

import { ConseillerHistorique } from 'interfaces/beneficiaire'
import {
  Conseiller,
  MessageInformatif,
  SimpleConseiller,
} from 'interfaces/conseiller'
import { Profil, profilVersStructureLegacy } from 'interfaces/profil'

export interface ConseillerHistoriqueJson {
  id: string
  nom: string
  prenom: string
  date: string
}

export function toConseillerHistorique(
  conseiller: ConseillerHistoriqueJson
): ConseillerHistorique {
  return {
    id: conseiller.id,
    nom: conseiller.nom,
    prenom: conseiller.prenom,
    depuis: conseiller.date,
  }
}

export type SimpleConseillerJson = {
  id: string
  prenom: string
  nom: string
  email?: string
  idStructureMilo?: string
}

export interface ConseillerJson {
  id: string
  firstName: string
  lastName: string
  email?: string
  profil: Profil
  agence?: {
    id?: string
    nom: string
  }
  structureMilo?: {
    id: string
    nom: string
  }
  notificationsSonores: boolean
  aDesBeneficiairesARecuperer: boolean
  dateSignatureCGU?: string
  dateVisionnageActus?: string
  dateMajAgence?: string
}

export type CommunicationsConseillerJson = {
  messageInformatif?: MessageInformatif
}

export function jsonToSimpleConseiller(
  json: SimpleConseillerJson
): SimpleConseiller {
  const conseiller: SimpleConseiller = {
    id: json.id,
    firstName: json.prenom,
    lastName: json.nom,
  }

  if (json.email) conseiller.email = json.email
  if (json.idStructureMilo) conseiller.idStructureMilo = json.idStructureMilo
  return conseiller
}

// Le profil vient de l'API, pas de la session : le dispositif peut changer en cours de session.
export function jsonToConseiller(
  conseillerJson: ConseillerJson,
  { estSuperviseur }: Pick<Session.HydratedUser, 'estSuperviseur'>
): Conseiller {
  const {
    agence,
    dateSignatureCGU,
    dateVisionnageActus,
    dateMajAgence,
    profil,
    ...json
  } = conseillerJson
  const conseiller: Conseiller = {
    ...json,
    structure: profilVersStructureLegacy(profil),
    profil,
    estSuperviseur,
  }

  if (agence) {
    conseiller.agence = agence
  }

  if (dateSignatureCGU) {
    conseiller.dateSignatureCGU = dateSignatureCGU
  }

  if (dateVisionnageActus) {
    conseiller.dateVisionnageActus = dateVisionnageActus
  }

  if (dateMajAgence) {
    conseiller.dateMajAgence = DateTime.fromISO(dateMajAgence)
  }

  return conseiller
}
