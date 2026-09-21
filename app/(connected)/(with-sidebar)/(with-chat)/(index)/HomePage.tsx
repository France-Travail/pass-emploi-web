'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Dispositif } from 'interfaces/beneficiaire'
import { Agence } from 'interfaces/referentiel'
import { estFranceTravail, estMilo, structureMilo } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent, trackPage } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type HomePageProps = {
  redirectUrl: string
  afficherModaleOnboarding: boolean
  afficherModaleAgence: boolean
  afficherModaleDispositif: boolean
  afficherModaleConfirmationDispositif: boolean
  afficherModaleEmail: boolean
  referentielAgences?: Agence[]
}

const RenseignementAgenceModal = dynamic(
  () => import('components/RenseignementAgenceModal')
)
const RenseignementDispositifModal = dynamic(
  () => import('components/RenseignementDispositifModal')
)
const RenseignementEmailModal = dynamic(
  () => import('components/RenseignementEmailModal')
)
const RenseignementStructureModal = dynamic(
  () => import('components/RenseignementStructureModal')
)
const OnboardingModal = dynamic(
  () => import('components/onboarding/OnboardingModal')
)

function HomePage({
  afficherModaleOnboarding,
  afficherModaleAgence,
  afficherModaleDispositif,
  afficherModaleConfirmationDispositif,
  afficherModaleEmail,
  redirectUrl,
  referentielAgences,
}: HomePageProps) {
  const router = useRouter()
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [_, setAlerte] = useAlerte()

  const [showModaleOnboarding, setShowModaleOnboarding] = useState<boolean>(
    afficherModaleOnboarding
  )
  const [showModaleEmail, setShowModaleEmail] =
    useState<boolean>(afficherModaleEmail)
  const [showModaleAgence, setShowModaleAgence] =
    useState<boolean>(afficherModaleAgence)
  const [
    showModaleConfirmationDispositif,
    setShowModaleConfirmationDispositif,
  ] = useState<boolean>(afficherModaleConfirmationDispositif)

  const [trackingLabel, setTrackingLabel] = useState<string>(
    labelPopInInitiale(
      afficherModaleDispositif,
      afficherModaleConfirmationDispositif
    )
  )
  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel('Succès ajout agence')
    setAlerte(AlerteParam.choixAgence)
    redirectToUrl()
  }

  // Le dispositif voyage dans le token : le conseiller se reconnecte pour le retrouver.
  async function selectDispositif(dispositif: Dispositif): Promise<void> {
    const { modifierDispositif } = await import('services/conseiller.service')
    await modifierDispositif(dispositif)
    setTrackingLabel('Succès ajout dispositif')
    router.push('/api/auth/federated-logout')
  }

  // Même dispositif : rien ne change dans le token, l'API note juste la date pour la relance annuelle.
  async function reconfirmerDispositif(dispositif: Dispositif): Promise<void> {
    const { modifierDispositif } = await import('services/conseiller.service')
    await modifierDispositif(dispositif)
    setConseiller({ ...conseiller, dateMajDispositif: DateTime.now() })
    setTrackingLabel('Succès confirmation dispositif')
    setAlerte(AlerteParam.confirmationDispositif)
    setShowModaleConfirmationDispositif(false)
  }

  // TODO rename
  function redirectToUrl() {
    router.replace(redirectUrl)
  }

  function trackContacterSupport() {
    trackEvent({
      structure: structureMilo,
      categorie: 'Contact Support',
      action: 'Pop-in sélection Mission Locale',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  function trackAccederImilo() {
    trackPage({
      structure: structureMilo,
      customTitle: 'Accès i-milo',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  useEffect(() => {
    if (
      !showModaleOnboarding &&
      !showModaleAgence &&
      !afficherModaleDispositif &&
      !showModaleConfirmationDispositif &&
      !showModaleEmail
    )
      redirectToUrl()
  }, [
    showModaleOnboarding,
    showModaleAgence,
    afficherModaleDispositif,
    showModaleConfirmationDispositif,
    showModaleEmail,
  ])

  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <>
      {afficherModaleDispositif && (
        <RenseignementDispositifModal onDispositifChoisi={selectDispositif} />
      )}

      {showModaleConfirmationDispositif && (
        <RenseignementDispositifModal
          dispositifActuel={conseiller.profil.dispositif as Dispositif}
          onDispositifChoisi={selectDispositif}
          onDispositifReconfirme={reconfirmerDispositif}
        />
      )}

      {showModaleEmail && (
        <RenseignementEmailModal
          onAccederImilo={trackAccederImilo}
          onClose={() => setShowModaleEmail(false)}
        />
      )}

      {showModaleAgence && estMilo(conseiller.structure) && (
        <RenseignementStructureModal
          onContacterSupport={trackContacterSupport}
          onAccederImilo={trackAccederImilo}
          onClose={() => setShowModaleAgence(false)}
        />
      )}

      {showModaleAgence &&
        !afficherModaleDispositif &&
        !showModaleConfirmationDispositif &&
        !estMilo(conseiller.structure) &&
        referentielAgences && (
          <RenseignementAgenceModal
            referentielAgences={referentielAgences}
            onAgenceChoisie={selectAgence}
            avecSaisieLibre={!estFranceTravail(conseiller.structure)}
            onClose={
              estFranceTravail(conseiller.structure)
                ? undefined
                : () => setShowModaleAgence(false)
            }
          />
        )}

      {showModaleOnboarding && (
        <OnboardingModal
          conseiller={conseiller}
          onClose={() => setShowModaleOnboarding(false)}
        />
      )}
    </>
  )
}

function labelPopInInitiale(
  afficherModaleDispositif: boolean,
  afficherModaleConfirmationDispositif: boolean
): string {
  if (afficherModaleDispositif) return 'Pop-in sélection dispositif'
  if (afficherModaleConfirmationDispositif)
    return 'Pop-in confirmation dispositif'
  return 'Pop-in sélection agence'
}

export default withTransaction(HomePage.name, 'page')(HomePage)
