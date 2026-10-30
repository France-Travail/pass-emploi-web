import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import OffrePage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import TitrePage from 'components/TitrePage'
import { DetailOffre } from 'interfaces/offre'
import { getImmersionServerSide } from 'services/immersions.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

type OffreParams = Promise<{ typeOffre: string; idOffre: string }>

export const metadata: Metadata = {
  title: 'Détail de l’offre - Recherche d’offres',
}

export default async function Offre({ params }: { params: OffreParams }) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { offre, header } = await fetchOffre(params, accessToken)

  return (
    <>
      <TitrePage
        titre={`Détail de l’offre ${offre.titre} - Recherche d’offres`}
        structure={user.structure}
      />
      <PageFilArianePortal />
      <PageHeaderPortal header={header} />

      <OffrePage offre={offre} />
    </>
  )
}

async function fetchOffre(
  params: OffreParams,
  accessToken: string
): Promise<{ offre: DetailOffre; header: string }> {
  const { idOffre, typeOffre } = await params

  let offre: DetailOffre | undefined
  let header: string
  switch (typeOffre) {
    case 'emploi':
      offre = await getOffreEmploiServerSide(idOffre, accessToken)
      header = 'Offre d’emploi'
      break
    case 'alternance':
      offre = await getOffreEmploiServerSide(idOffre, accessToken)
      header = 'Offre d’alternance'
      break
    case 'service-civique':
      offre = await getServiceCiviqueServerSide(idOffre, accessToken)
      header = 'Offre de service civique'
      break
    case 'immersion':
      offre = await getImmersionServerSide(idOffre, accessToken)
      header = 'Offre d’immersion'
      break
    default:
      notFound()
  }

  if (!offre) notFound()
  return { offre, header }
}
