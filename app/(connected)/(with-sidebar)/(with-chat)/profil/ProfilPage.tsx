'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { RenseignementMissionLocaleForm } from 'components/RenseignementMissionLocaleForm'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Switch } from 'components/ui/Form/Switch'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Dispositif } from 'interfaces/beneficiaire'
import { Agence } from 'interfaces/referentiel'
import {
  estFranceTravail,
  estMilo,
  getUrlFormulaireSupport,
  labelStructure,
  structureMilo,
} from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent, trackPage } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ConfirmationDeleteConseillerModal = dynamic(
  () => import('components/ConfirmationDeleteConseillerModal')
)
const RenseignementDispositifModal = dynamic(
  () => import('components/RenseignementDispositifModal')
)
const RenseignementAgenceModal = dynamic(
  () => import('components/RenseignementAgenceModal')
)
const ConfirmationSuppressionCompteConseillerModal = dynamic(
  () => import('components/ConfirmationSuppressionCompteConseillerModal')
)

type ProfilProps = {
  referentielAgences: Agence[]
}

function ProfilPage({ referentielAgences }: ProfilProps) {
  const router = useRouter()
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const conseillerEstMilo = estMilo(conseiller.structure)
  const [showModaleSuppressionCompte, setShowModaleSuppressionCompte] =
    useState(false)
  const [
    showModaleConfirmationSuppression,
    setShowModaleConfirmationSuppression,
  ] = useState(false)
  const [portefeuilleAvecBeneficiaires, setPortefeuilleAvecBeneficiaires] =
    useState<boolean>(false)

  const [showInformationEmailManquant, setShowInformationEmailManquant] =
    useState<boolean>(Boolean(conseillerEstMilo && !conseiller.email))
  const [showModaleDispositif, setShowModaleDispositif] =
    useState<boolean>(false)
  const [showModaleAgence, setShowModaleAgence] = useState<boolean>(false)
  const [_, setAlerte] = useAlerte()

  const labelAgence = conseillerEstMilo ? 'Mission Locale' : 'agence'
  const [trackingLabel, setTrackingLabel] = useState<string>('Profil')
  const aDesBeneficiaires = portefeuille.length > 0

  async function toggleNotificationsSonores() {
    const conseillerMisAJour = {
      ...conseiller,
      notificationsSonores: !conseiller.notificationsSonores,
    }

    const { modifierNotificationsSonores } =
      await import('services/conseiller.service')
    await modifierNotificationsSonores(
      conseiller.id,
      conseillerMisAJour.notificationsSonores
    )
    setConseiller(conseillerMisAJour)
  }

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel('Profil - Succès ajout agence')
  }

  async function modifierAgenceFT(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    // Refléter l'estampille posée par l'API, sinon la modale bloquante revient.
    setConseiller({ ...conseiller, agence, dateMajAgence: DateTime.now() })
    setShowModaleAgence(false)
    setAlerte(AlerteParam.modificationAgence)
    setTrackingLabel('Profil - Succès modification agence')
  }

  async function modifierDispositif(dispositif: Dispositif): Promise<void> {
    const { modifierDispositif: modifierDispositifDuConseiller } =
      await import('services/conseiller.service')
    await modifierDispositifDuConseiller(dispositif)
    setTrackingLabel('Profil - Succès modification dispositif')
    router.push('/api/auth/federated-logout')
  }

  async function openDeleteConseillerModal(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    setShowModaleSuppressionCompte(true)
    if (conseiller) {
      const { getBeneficiairesDuConseillerClientSide } =
        await import('services/beneficiaires.service')
      const beneficiaires = await getBeneficiairesDuConseillerClientSide()
      setPortefeuilleAvecBeneficiaires(beneficiaires.length > 0)
    }
  }

  async function supprimerCompteConseiller(): Promise<void> {
    try {
      const { supprimerConseiller } =
        await import('services/conseiller.service')
      await supprimerConseiller(conseiller.id)
      setShowModaleSuppressionCompte(false)
      setTimeout(async () => setShowModaleConfirmationSuppression(true), 10)
      setTimeout(async () => router.push('/api/auth/federated-logout'), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  function trackContacterSupportClick() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Profil',
      nom: '',
      aDesBeneficiaires,
    })
  }

  function trackAccederAIMilo() {
    trackPage({
      customTitle: 'Accès i-milo',
      structure: structureMilo,
      aDesBeneficiaires,
    })
  }

  useMatomo(trackingLabel, aDesBeneficiaires)

  return (
    <>
      {showInformationEmailManquant && (
        <div className='mb-6'>
          <InformationMessage
            label='Votre adresse mail n’est pas renseignée'
            onAcknowledge={() => setShowInformationEmailManquant(false)}
          >
            <div className='flex flex-col'>
              Renseignez votre adresse e-mail dans l’encart ”Contacts
              personnels” de votre profil i-milo.
              <ExternalLink
                href={process.env.NEXT_PUBLIC_IMILO_COORDONNEES_URL as string}
                label='Accéder à i-milo'
                onClick={trackAccederAIMilo}
              />
            </div>
          </InformationMessage>
        </div>
      )}

      <section className='border border-solid rounded-base w-full p-4 border-grey-100 mb-8'>
        <h2 className='text-m-bold text-grey-800 mb-4'>Informations</h2>

        <h3 className='text-base-bold'>
          {conseiller.firstName} {conseiller.lastName}
        </h3>
        <dl className='mt-3'>
          {conseiller.email && (
            <div>
              <dt className='mt-2 inline text-base-regular'>Votre e-mail :</dt>
              <dd className='ml-2 inline'>
                <Email email={conseiller.email} />
              </dd>
            </div>
          )}

          {conseiller.agence && (
            <div className='mt-2 flex items-center flex-wrap gap-2'>
              <dt className='text-base-regular'>Votre {labelAgence} :</dt>
              <dd className='flex items-center gap-2 text-base-bold'>
                {conseiller.agence.nom}
                {estFranceTravail(conseiller.structure) && (
                  <button
                    type='button'
                    className='inline-flex items-center text-s-regular text-content-color underline hover:text-primary'
                    aria-label='Modifier votre agence'
                    onClick={() => setShowModaleAgence(true)}
                  >
                    <IconComponent
                      name={IconName.Edit}
                      aria-hidden={true}
                      focusable={false}
                      className='w-4 h-4 mr-1 fill-current'
                    />
                    Modifier
                  </button>
                )}
              </dd>
            </div>
          )}

          {estFranceTravail(conseiller.structure) && (
            <div className='mt-2 flex items-center flex-wrap gap-2'>
              <dt className='text-base-regular'>Votre dispositif :</dt>
              <dd className='flex items-center gap-2'>
                <TagMetier
                  label={labelStructure(conseiller.structure)}
                  className='text-primary bg-primary-lighten'
                />
                <button
                  type='button'
                  className='inline-flex items-center text-s-regular text-content-color underline hover:text-primary'
                  aria-label='Modifier votre dispositif'
                  onClick={() => setShowModaleDispositif(true)}
                >
                  <IconComponent
                    name={IconName.Edit}
                    aria-hidden={true}
                    focusable={false}
                    className='w-4 h-4 mr-1 fill-current'
                  />
                  Modifier
                </button>
              </dd>
            </div>
          )}
        </dl>

        {showModaleAgence && (
          <RenseignementAgenceModal
            referentielAgences={referentielAgences}
            onAgenceChoisie={modifierAgenceFT}
            avecSaisieLibre={false}
            agenceActuelle={conseiller.agence}
            onClose={() => setShowModaleAgence(false)}
          />
        )}

        {showModaleDispositif && (
          <RenseignementDispositifModal
            dispositifActuel={conseiller.profil.dispositif as Dispositif}
            onDispositifChoisi={modifierDispositif}
            onClose={() => setShowModaleDispositif(false)}
          />
        )}

        <Button
          className='mt-4'
          onClick={openDeleteConseillerModal}
          style={ButtonStyle.TERTIARY}
        >
          <IconComponent
            name={IconName.Delete}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-4 h-4'
          />
          Supprimer mon compte
        </Button>

        {showModaleSuppressionCompte && (
          <ConfirmationDeleteConseillerModal
            conseiller={conseiller}
            onConfirmation={supprimerCompteConseiller}
            onCancel={() => setShowModaleSuppressionCompte(false)}
            portefeuilleAvecBeneficiaires={portefeuilleAvecBeneficiaires}
          />
        )}

        {showModaleConfirmationSuppression && (
          <ConfirmationSuppressionCompteConseillerModal />
        )}

        {conseillerEstMilo && (
          <>
            {conseiller.agence && (
              <div className='mt-4'>
                <p>
                  Vous avez besoin de modifier votre Mission Locale de référence
                  ?
                </p>

                <p className='flex'>
                  Pour ce faire merci de&nbsp;
                  <span className={'text-primary-darken hover:text-primary'}>
                    <ExternalLink
                      href={getUrlFormulaireSupport(conseiller.structure)}
                      label='contacter le support'
                      iconName={IconName.OutgoingMail}
                      onClick={trackContacterSupportClick}
                    />
                  </span>
                </p>
              </div>
            )}

            {!conseiller.agence && (
              <RenseignementMissionLocaleForm
                referentielMissionsLocales={referentielAgences}
                onMissionLocaleChoisie={selectAgence}
                onContacterSupport={trackContacterSupportClick}
              />
            )}
          </>
        )}
      </section>

      <section className='border border-solid rounded-base w-full p-4 border-grey-100 mb-8'>
        <h2 className='text-m-bold text-grey-800 mb-4'>Notifications</h2>
        <div className='flex items-center flex-wrap layout-m:flex-nowrap'>
          <label htmlFor='notificationSonore' className='mr-4'>
            Recevoir des notifications sonores pour la réception de nouveaux
            messages
          </label>
          <Switch
            id='notificationSonore'
            checkedLabel='Activé'
            uncheckedLabel='Désactivé'
            checked={conseiller.notificationsSonores}
            onChange={toggleNotificationsSonores}
          />
        </div>
      </section>
    </>
  )
}

function Email(props: { email: string }) {
  return (
    <span className='text-primary'>
      <IconComponent
        name={IconName.OutgoingMail}
        aria-hidden={true}
        focusable={false}
        className='inline w-4 h-4 mr-2 fill-primary'
      />
      {props.email}
    </span>
  )
}

export default withTransaction(ProfilPage.name, 'page')(ProfilPage)
