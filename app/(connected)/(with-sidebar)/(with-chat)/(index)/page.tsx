import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import HomePage from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import {
  aEtablissement,
  doitChoisirSonDispositif,
  doitConfirmerSonDispositif,
  doitRenseignerSonAgence,
  doitSignerLesCGU,
} from 'interfaces/conseiller'
import { estFranceTravail, estMilo } from 'interfaces/structure'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = { title: 'Accueil' }

type HomeSearchParams = Promise<
  Partial<{
    redirectUrl: string
    source: string
    onboarding: boolean
  }>
>
export default async function Home({
  searchParams,
}: {
  searchParams?: HomeSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)
  if (doitSignerLesCGU(conseiller)) redirect('/consentement-cgu')

  const { source, redirectUrl, onboarding } = (await searchParams) ?? {}
  const sourceQueryParam = source
    ? '?' + new URLSearchParams({ source }).toString()
    : ''
  const targetPage =
    cheminInterne(redirectUrl) ?? '/mes-jeunes' + sourceQueryParam

  const afficherModaleOnboarding = Boolean(onboarding)
  const emailEstManquant = estMilo(conseiller.structure) && !conseiller.email
  const agenceEstManquante = estFranceTravail(conseiller.structure)
    ? doitRenseignerSonAgence(conseiller)
    : !aEtablissement(conseiller)
  const dispositifEstManquant = doitChoisirSonDispositif(conseiller)
  const dispositifEstAConfirmer = doitConfirmerSonDispositif(conseiller)
  if (
    !afficherModaleOnboarding &&
    !emailEstManquant &&
    !agenceEstManquante &&
    !dispositifEstManquant &&
    !dispositifEstAConfirmer
  )
    redirect(targetPage)

  let referentielAgences = undefined
  if (!estMilo(conseiller.structure)) {
    referentielAgences = await getAgencesServerSide(
      conseiller.profil.structure,
      accessToken
    )
  }

  return (
    <>
      <PageHeaderPortal header='Accueil' />

      <HomePage
        afficherModaleOnboarding={afficherModaleOnboarding}
        afficherModaleAgence={agenceEstManquante}
        afficherModaleDispositif={dispositifEstManquant}
        afficherModaleConfirmationDispositif={dispositifEstAConfirmer}
        afficherModaleEmail={emailEstManquant}
        redirectUrl={targetPage}
        referentielAgences={referentielAgences}
      />
    </>
  )
}

// « //hote » et « /\hote » sont lus comme des URL absolues par les navigateurs :
// on ne renvoie que vers un chemin du site.
function cheminInterne(url?: string): string | undefined {
  if (!url?.startsWith('/') || /^\/[\\/]/.test(url)) return undefined
  return url
}
