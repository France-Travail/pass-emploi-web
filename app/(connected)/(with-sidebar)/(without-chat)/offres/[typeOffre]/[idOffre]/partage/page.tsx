import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PartageOffrePage from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/PartageOffrePage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { DetailOffre } from 'interfaces/offre'
import { getImmersionServerSide } from 'services/immersions.service'
import { getListesServerSide } from 'services/listes.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { redirectedFromHome } from 'utils/helpers'

type PartageOffreParams = Promise<{ typeOffre: string; idOffre: string }>

export async function generateMetadata({
  params,
}: {
  params: PartageOffreParams
}): Promise<Metadata> {
  const offre = await fetchOffre(params)
  return { title: `Partage de l’offre ${offre.titre} - Recherche d’offres` }
}

export default async function PartageOffre({
  params,
}: {
  params: PartageOffreParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const [offre, listes] = await Promise.all([
    fetchOffre(params, accessToken),
    getListesServerSide(user.id, accessToken),
  ])

  const referer = (await headers()).get('referer')
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/offres'

  return (
    <>
      <PageRetourPortal lien={redirectTo} />
      <PageHeaderPortal header='Partager une offre' />

      <PartageOffrePage offre={offre} listes={listes} returnTo={redirectTo} />
    </>
  )
}

async function fetchOffre(
  params: PartageOffreParams,
  accessToken?: string
): Promise<DetailOffre> {
  const token =
    accessToken ?? (await getMandatorySessionServerSide()).accessToken
  const { typeOffre, idOffre } = await params

  let offre: DetailOffre | undefined
  switch (typeOffre) {
    case 'emploi':
    case 'alternance':
      offre = await getOffreEmploiServerSide(idOffre, token)
      break
    case 'service-civique':
      offre = await getServiceCiviqueServerSide(idOffre, token)
      break
    case 'immersion':
      offre = await getImmersionServerSide(idOffre, token)
      break
    default:
      notFound()
  }

  if (!offre) notFound()
  return offre
}
