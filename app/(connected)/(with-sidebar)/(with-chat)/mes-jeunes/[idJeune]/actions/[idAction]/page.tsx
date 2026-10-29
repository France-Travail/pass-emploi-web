import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Session } from 'next-auth'
import React from 'react'

import DetailActionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/actions/[idAction]/DetailActionPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import TitrePage from 'components/TitrePage'
import { Action } from 'interfaces/action'
import { estConseillerReferent } from 'interfaces/conseiller'
import { estMilo } from 'interfaces/structure'
import { getAction } from 'services/actions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

type DetailActionParams = Promise<{ idJeune: string; idAction: string }>

export const metadata: Metadata = {
  title: 'Détail de l’action - Actions',
}

export default async function DetailAction({
  params,
}: {
  params: DetailActionParams
}) {
  const { action, user } = await buildProps(params)

  const referer = (await headers()).get('referer')
  const from =
    referer && /\/pilotage$/.test(referer) ? 'pilotage' : 'beneficiaire'

  return (
    <>
      <TitrePage
        titre={`${action.titre} - Actions de ${action.beneficiaire.prenom} ${action.beneficiaire.nom} - ${
          estConseillerReferent(user, action.beneficiaire)
            ? 'Portefeuille'
            : 'Etablissement'
        }`}
        structure={user.structure}
      />
      <PageFilArianePortal />
      <PageHeaderPortal header='Détails de l’action' />

      <DetailActionPage from={from} action={action} />
    </>
  )
}

async function buildProps(
  params: DetailActionParams
): Promise<{ action: Action; user: Session.HydratedUser }> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()
  const { idJeune, idAction } = await params

  const action = await getAction(idAction, accessToken)
  if (!action) notFound()
  if (idJeune !== action.beneficiaire.id) notFound()

  return { action, user }
}
