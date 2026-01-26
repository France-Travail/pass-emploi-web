import { DateTime } from 'luxon'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import { DossierMilo, IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { Conseiller, SimpleConseiller } from 'interfaces/conseiller'
import { BeneficiaireMiloFormData } from 'interfaces/json/beneficiaire'
import {
  ConseillerJson,
  jsonToConseiller,
  jsonToSimpleConseiller,
  SimpleConseillerJson,
} from 'interfaces/json/conseiller'

export async function getConseillerServerSide(
  user: Session.HydratedUser,
  accessToken: string
): Promise<Conseiller> {
  const { content: conseillerJson } = await apiGet<ConseillerJson>(
    `/conseillers/${user.id}`,
    accessToken
  )
  return jsonToConseiller(conseillerJson, user)
}

export async function getConseillers(
  recherche: string
): Promise<SimpleConseiller[]> {
  const session = await getSession()
  const { content } = await apiGet<SimpleConseillerJson[]>(
    `/conseillers?q=${recherche}`,
    session!.accessToken
  )
  return content.map(jsonToSimpleConseiller)
}

export async function modifierAgence({
  id,
  nom,
}: {
  id?: string
  nom: string
}): Promise<void> {
  const session = await getSession()
  const agence = id ? { id } : { nom }
  return apiPut(
    `/conseillers/${session!.user.id}`,
    { agence },
    session!.accessToken
  )
}

export async function modifierDateSignatureCGU(date: DateTime): Promise<void> {
  const session = await getSession()
  return apiPut(
    `/conseillers/${session!.user.id}`,
    { dateSignatureCGU: date },
    session!.accessToken
  )
}

export async function modifierDateVisionnageActus(
  date: DateTime
): Promise<void> {
  const session = await getSession()
  return apiPut(
    `/conseillers/${session!.user.id}`,
    { dateVisionnageActus: date },
    session!.accessToken
  )
}

export async function modifierNotificationsSonores(
  idConseiller: string,
  hasNotificationsSonores: boolean
): Promise<void> {
  const session = await getSession()
  return apiPut(
    `/conseillers/${idConseiller}`,
    { notificationsSonores: hasNotificationsSonores },
    session!.accessToken
  )
}

export async function getDossierJeune(
  idDossier: string
): Promise<DossierMilo | undefined> {
  const session = await getSession()
  const { content: dossier } = await apiGet<DossierMilo | undefined>(
    `/conseillers/milo/dossiers/${idDossier}`,
    session!.accessToken
  )
  return dossier
}

export async function createCompteJeuneMilo(
  newJeune: BeneficiaireMiloFormData,
  options?: { surcharge?: boolean }
): Promise<IdentiteBeneficiaire> {
  const session = await getSession()
  const surcharge = options?.surcharge

  const { content } = await apiPost<IdentiteBeneficiaire>(
    `/conseillers/milo/jeunes`,
    {
      ...newJeune,
      idConseiller: session!.user.id,
      surcharge,
    },
    session!.accessToken
  )
  return content
}

export async function recupererBeneficiaires(): Promise<void> {
  const session = await getSession()
  await apiPost(
    `/conseillers/${session!.user.id}/recuperer-mes-jeunes`,
    {},
    session!.accessToken
  )
}

export async function supprimerConseiller(idConseiller: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/conseillers/${idConseiller}`, session!.accessToken)
}
