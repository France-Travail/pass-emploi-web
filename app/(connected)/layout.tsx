import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'

import A11yPageTitle from 'components/A11yPageTitle'
import { MODAL_ROOT_ID } from 'components/globals'
import LiensEvitement from 'components/LiensEvitement'
import { titreSite } from 'components/TitrePage'
import {
  doitChoisirSonDispositif,
  doitConfirmerSonDispositif,
  doitRenseignerSonAgence,
} from 'interfaces/conseiller'
import { estPassEmploi } from 'interfaces/structure'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import AppContextProviders from 'utils/AppContextProviders'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

const PAGES_SANS_DISPOSITIF = new Set(['/', '/consentement-cgu'])

export async function generateMetadata(): Promise<Metadata> {
  const { user } = await getMandatorySessionServerSide()
  const estUserPassEmploi = estPassEmploi(user.structure)
  const siteTitle = titreSite(user.structure)
  const faviconPath = estUserPassEmploi
    ? '/pass-emploi-favicon.png'
    : '/cej-favicon.png'

  return {
    title: { template: '%s - ' + siteTitle, default: siteTitle },
    icons: {
      icon: faviconPath,
      shortcut: faviconPath,
      apple: faviconPath,
    },
  }
}

export default async function LayoutWhenConnected({
  children,
}: {
  children: ReactNode
}) {
  const { accessToken, user } = await getMandatorySessionServerSide()

  const [conseiller, portefeuille] = await Promise.all([
    getConseillerServerSide(user, accessToken),
    getBeneficiairesDuConseillerServerSide(user.id, accessToken),
  ])

  if (
    doitChoisirSonDispositif(conseiller) ||
    doitConfirmerSonDispositif(conseiller) ||
    doitRenseignerSonAgence(conseiller)
  ) {
    const cheminCourant = (await headers()).get('x-current-path') ?? '/'
    if (!PAGES_SANS_DISPOSITIF.has(cheminCourant))
      redirect(`/?${new URLSearchParams({ redirectUrl: cheminCourant })}`)
  }

  return (
    <>
      <AppContextProviders conseiller={conseiller} portefeuille={portefeuille}>
        <A11yPageTitle />
        <LiensEvitement />

        {children}
      </AppContextProviders>

      <div id={MODAL_ROOT_ID} />
    </>
  )
}
