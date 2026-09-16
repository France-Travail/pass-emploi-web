import { Metadata } from 'next'
import React from 'react'

import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { Agence } from 'interfaces/referentiel'
import { estFranceTravail, estMilo, structureMilo } from 'interfaces/structure'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = { title: 'Mon profil' }

export default async function Profil() {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)

  let referentielAgences: Agence[] = []
  if (estFranceTravail(conseiller.structure)) {
    referentielAgences = await getAgencesServerSide(
      conseiller.profil.structure,
      accessToken
    )
  } else if (estMilo(conseiller.structure) && !conseiller.agence) {
    referentielAgences = await getAgencesServerSide(structureMilo, accessToken)
  }

  return (
    <>
      <PageHeaderPortal header='Profil' />

      <ProfilPage referentielAgences={referentielAgences} />
    </>
  )
}
