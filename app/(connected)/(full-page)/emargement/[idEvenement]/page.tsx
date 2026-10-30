import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import EmargementRdvPage, {
  EmargementRdvPageProps,
} from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import TitrePage from 'components/TitrePage'
import { Evenement } from 'interfaces/evenement'
import { Session } from 'interfaces/session'
import { estMilo } from 'interfaces/structure'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getDetailsEvenement } from 'services/evenements.service'
import { getDetailsSession } from 'services/sessions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

type EmargementRdvParams = Promise<{ idEvenement: string }>
type EmargementRdvSearchParams = Promise<{ type: string }>
type RouteProps = {
  params: EmargementRdvParams
  searchParams?: EmargementRdvSearchParams
}

export const metadata: Metadata = {
  title: 'Émargement',
}

export default async function EmargementRdv(routeProps: RouteProps) {
  const { titre, structure, ...props } = await buildProps(routeProps)

  return (
    <>
      <TitrePage titre={titre} structure={structure} />
      <PageHeaderPortal header={titre} />

      <EmargementRdvPage {...props} />
    </>
  )
}

async function buildProps({
  params,
  searchParams,
}: {
  params: EmargementRdvParams
  searchParams?: EmargementRdvSearchParams
}): Promise<{ titre: string; structure: string } & EmargementRdvPageProps> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) redirect('/mes-jeunes')

  const { idEvenement } = await params
  const { type } = (await searchParams) ?? {}
  const isSession = type === 'session'

  const conseiller = await getConseillerServerSide(user, accessToken)

  const evenement = isSession
    ? await getDetailsSession(user.id, idEvenement, accessToken)
    : await getDetailsEvenement(idEvenement, accessToken)
  if (!evenement) notFound()
  const titreEvenement = isSession
    ? (evenement as Session).session.nom
    : (evenement as Evenement).titre

  return {
    titre: 'Emargement - ' + titreEvenement,
    structure: user.structure,
    evenement,
    agence: conseiller.structureMilo?.nom,
  }
}
