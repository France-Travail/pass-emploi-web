'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'

import DossierBeneficiaireMilo from 'components/jeune/DossierBeneficiaireMilo'
import FormulaireRechercheDossier from 'components/jeune/FormulaireRechercheDossier'
import { DossierMilo } from 'interfaces/beneficiaire'
import { BeneficiaireMiloFormData } from 'interfaces/json/beneficiaire'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

import LabelDeuxEtapes from '../../../../../../components/ui/Form/LabelDeuxEtapes'
import AlertLink from '../../../../../../components/ui/Notifications/AlertLink'
import FailureAlert from '../../../../../../components/ui/Notifications/FailureAlert'

interface EmailExistantError {
  email?: string
  id: string | undefined
}

function CreationBeneficiaireMiloPage() {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const etapeRef = useRef<HTMLDivElement>(null)
  const [etape, setEtape] = useState<1 | 2>(1)
  const dossierBeneficiaireRef = useRef<{ focusRetour: () => void }>(null)

  const [dossier, setDossier] = useState<DossierMilo | undefined>()
  const [erreurDossier, setErreurDossier] = useState<string | undefined>()
  const [erreurCreation, setErreurCreation] = useState<string | undefined>()
  const [erreurEmailExistantPortefeuille, setErreurEmailExistantPortefeuille] =
    useState<EmailExistantError | undefined>()
  const [compteBeneficiaireExisteDeja, setCompteBeneficiaireExisteDeja] =
    useState<boolean>(false)

  async function rechercherDossier(id: string) {
    clearErreurs()

    const beneficiaire = portefeuille.find((b) => b.idPartenaire === id)
    if (beneficiaire) {
      setErreurEmailExistantPortefeuille({
        email: beneficiaire.email,
        id: beneficiaire.id,
      })
      return
    }

    try {
      const { getDossierJeune } = await import('services/conseiller.service')
      const dossierJeune = await getDossierJeune(id)
      setDossier(dossierJeune)
      setEtape(2)
      etapeRef.current!.focus()
    } catch (error) {
      setEtape(1)
      setErreurDossier(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
    }
  }

  async function creerCompteJeune(
    beneficiaireData: BeneficiaireMiloFormData,
    options?: { surcharge?: boolean }
  ) {
    const { surcharge = false } = options ?? {}

    setErreurCreation(undefined)
    setCompteBeneficiaireExisteDeja(false)

    try {
      const { createCompteJeuneMilo } =
        await import('services/conseiller.service')
      const beneficiaireCree = await createCompteJeuneMilo(beneficiaireData, {
        surcharge,
      })

      setPortefeuille(
        portefeuille.concat({
          ...beneficiaireCree,
          creationDate: DateTime.now().toISO(),
          estAArchiver: false,
          idPartenaire: dossier?.id,
          email: beneficiaireData.email,
        })
      )
      setAlerte(AlerteParam.creationBeneficiaire, beneficiaireCree.id)
      router.push('/mes-jeunes')
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 422) {
        setCompteBeneficiaireExisteDeja(true)
      } else {
        setErreurCreation(
          (error as Error).message || "Une erreur inconnue s'est produite"
        )
      }
    }
  }

  function clearErreurs() {
    setErreurDossier(undefined)
    setErreurCreation(undefined)
    setErreurEmailExistantPortefeuille(undefined)
    setCompteBeneficiaireExisteDeja(false)
  }

  useMatomo(
    erreurDossier
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune',
    portefeuille.length > 0
  )

  return (
    <>
      {erreurCreation && (
        <FailureAlert
          label={erreurCreation}
          onAcknowledge={() => setErreurCreation(undefined)}
        />
      )}

      {erreurDossier && (
        <FailureAlert
          label={erreurDossier}
          onAcknowledge={() => setErreurDossier(undefined)}
        />
      )}

      {erreurEmailExistantPortefeuille && (
        <FailureAlert
          label={`Le compte associé à cette adresse e-mail ${erreurEmailExistantPortefeuille.email} est déjà présent dans votre portefeuille`}
          onAcknowledge={() => setErreurEmailExistantPortefeuille(undefined)}
        >
          <AlertLink
            href={`/mes-jeunes/${erreurEmailExistantPortefeuille.id}`}
            label='Voir la fiche du bénéficiaire'
            type='warning'
          />
        </FailureAlert>
      )}

      <LabelDeuxEtapes etape={etape} ref={etapeRef} />

      {etape === 1 && (
        <div className='mt-4'>
          <FormulaireRechercheDossier
            onRechercheDossier={rechercherDossier}
            idDossier={dossier?.id}
          />
        </div>
      )}

      {etape === 2 && dossier && (
        <DossierBeneficiaireMilo
          ref={dossierBeneficiaireRef}
          dossier={dossier}
          onCreateCompte={creerCompteJeune}
          erreurMessageCreationCompte={erreurCreation}
          beneficiaireExisteDejaMilo={compteBeneficiaireExisteDeja}
          onRefresh={() => rechercherDossier(dossier.id)}
          onRetour={() => {
            clearErreurs()
            setEtape(1)
            etapeRef.current!.focus()
          }}
          onAnnulationCreerCompte={() => {
            setCompteBeneficiaireExisteDeja(false)
            dossierBeneficiaireRef.current!.focusRetour()
          }}
        />
      )}
    </>
  )
}

export default withTransaction(
  CreationBeneficiaireMiloPage.name,
  'page'
)(CreationBeneficiaireMiloPage)
