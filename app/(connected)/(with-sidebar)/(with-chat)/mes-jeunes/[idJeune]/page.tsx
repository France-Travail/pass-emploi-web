import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import {
  FicheMiloProps,
  FichePasMiloProps,
  Onglet,
  valeursOngletsMilo,
  valeursOngletsPasMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiaireProps'
import { PageFilArianePortal } from 'components/PageNavigationPortals'
import TitrePage from 'components/TitrePage'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { estConseilDepartemental, estMilo } from 'interfaces/structure'
import { getSituationsNonProfessionnelles } from 'services/actions.service'
import {
  getConseillersDuJeuneServerSide,
  getDemarchesBeneficiaire,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/beneficiaires.service'
import {
  getConseillerServerSide,
  getFonctionnalitesConseillerServerSide,
} from 'services/conseiller.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { getPeriodeComprenant, LUNDI } from 'utils/date'

type FicheBeneficiaireParams = Promise<{ idJeune: string }>
type FicheBeneficiaireSearchParams = Promise<{
  onglet?: string
  debut?: string
}>
type RouteProps = {
  params: FicheBeneficiaireParams
  searchParams?: FicheBeneficiaireSearchParams
}

export const metadata: Metadata = {
  title: 'Fiche bénéficiaire',
}

export default async function FicheBeneficiaire({
  params,
  searchParams,
}: RouteProps) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idJeune } = await params

  const [conseiller, beneficiaire, metadonneesFavoris, historiqueConseillers] =
    await Promise.all([
      getConseillerServerSide(user, accessToken),
      getJeuneDetails(idJeune, accessToken),
      getMetadonneesFavorisJeune(idJeune, accessToken),
      getConseillersDuJeuneServerSide(idJeune, accessToken),
    ])
  if (!beneficiaire) notFound()

  const { onglet, debut } = (await searchParams) ?? {}
  const ongletInitial = getOngletInitial(onglet, conseiller, metadonneesFavoris)
  let debutSemaineInitiale
  if (debut)
    try {
      const dateValid = DateTime.fromISO(debut)
      debutSemaineInitiale = dateValid.toISODate()
    } catch {}

  const props = {
    beneficiaire,
    ongletInitial,
    historiqueConseillers,
    metadonneesFavoris,
    debutSemaineInitiale,
  }

  return (
    <>
      <TitrePage
        titre={`${beneficiaire.idConseiller === user.id ? 'Portefeuille' : 'Établissement'} - ${beneficiaire.prenom} ${beneficiaire.nom}`}
        structure={user.structure}
      />
      <PageFilArianePortal />

      {estMilo(conseiller.structure) &&
        (await renderFicheMilo(user.id, accessToken, props))}

      {!estMilo(conseiller.structure) &&
        (await renderFichePasMilo(conseiller, accessToken, props))}
    </>
  )
}

function getOngletInitial(
  searchParam: string | undefined,
  conseiller: Conseiller,
  metadonneesFavoris?: MetadonneesFavoris
): Onglet {
  if (
    searchParam &&
    [...valeursOngletsMilo, ...valeursOngletsPasMilo].includes(searchParam)
  )
    return searchParam

  if (estMilo(conseiller.structure)) return 'actions'
  if (estConseilDepartemental(conseiller.structure)) return 'demarches'
  if (metadonneesFavoris?.autoriseLePartage) return 'offres'
  return 'favoris'
}

async function renderFicheMilo(
  idConseiller: string,
  accessToken: string,
  props: Pick<
    FicheMiloProps,
    | 'beneficiaire'
    | 'ongletInitial'
    | 'historiqueConseillers'
    | 'metadonneesFavoris'
    | 'favorisOffres'
    | 'debutSemaineInitiale'
  >
): Promise<ReactElement> {
  const [categoriesActions, fonctionnalites] = await Promise.all([
    getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
    getFonctionnalitesConseillerServerSide(idConseiller, accessToken),
  ])

  return (
    <FicheBeneficiairePage
      {...props}
      estMilo={true}
      categoriesActions={categoriesActions}
      fonctionnalites={fonctionnalites}
    />
  )
}

async function renderFichePasMilo(
  conseiller: Conseiller,
  accessToken: string,
  props: Pick<
    FichePasMiloProps,
    | 'beneficiaire'
    | 'ongletInitial'
    | 'historiqueConseillers'
    | 'metadonneesFavoris'
    | 'favorisOffres'
    | 'debutSemaineInitiale'
  >
): Promise<ReactElement> {
  // Les indicateurs de la fiche portent sur la semaine en cours, comme ceux
  // des actions MiLo : on récupère les démarches de cette semaine seulement.
  const semaineEnCours = getPeriodeComprenant(DateTime.now(), {
    jourSemaineReference: LUNDI,
  })
  const demarches = estConseilDepartemental(conseiller.structure)
    ? await getDemarchesBeneficiaire(
        props.beneficiaire.id,
        semaineEnCours,
        conseiller.id,
        accessToken
      )
    : undefined

  return (
    <FicheBeneficiairePage {...props} estMilo={false} demarches={demarches} />
  )
}
