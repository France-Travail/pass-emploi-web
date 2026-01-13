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

import CreationDeuxEtapes from '../../../../../../components/ui/Form/CreationDeuxEtapes'

function CreationBeneficiaireMiloPage() {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const etapeRef = useRef<HTMLDivElement>(null)
  const dossierBeneficiaireRef = useRef<{ focusRetour: () => void }>(null)

  const [dossier, setDossier] = useState<DossierMilo | undefined>()
  const [erreurDossier, setErreurDossier] = useState<string | undefined>()
  const [erreurCreation, setErreurCreation] = useState<string | undefined>()
  const [compteBeneficiaireExisteDeja, setCompteBeneficiaireExisteDeja] =
    useState<boolean>(false)

  async function rechercherDossier(id: string) {
    clearDossier()

    try {
      const { getDossierJeune } = await import('services/conseiller.service')
      const dossierJeune = await getDossierJeune(id)
      setDossier(dossierJeune)
      etapeRef.current!.focus()
    } catch (error) {
      setErreurDossier(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
    }
  }

  async function creerCompteJeune(
    beneficiaireData: BeneficiaireMiloFormData,
    options: { surcharge: boolean } = { surcharge: false }
  ) {
    setErreurCreation(undefined)
    setCompteBeneficiaireExisteDeja(false)

    try {
      const { createCompteJeuneMilo } =
        await import('services/conseiller.service')
      const beneficiaireCree = await createCompteJeuneMilo(
        beneficiaireData,
        options
      )

      setPortefeuille(
        portefeuille.concat({
          ...beneficiaireCree,
          creationDate: DateTime.now().toISO(),
          estAArchiver: false,
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

  function clearDossier() {
    setErreurDossier(undefined)
    setDossier(undefined)
    setErreurCreation(undefined)
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
      <CreationDeuxEtapes etape={dossier ? 2 : 1} ref={etapeRef} />

      {!dossier && (
        <div className='mt-4'>
          <FormulaireRechercheDossier
            onRechercheDossier={rechercherDossier}
            errMessage={erreurDossier}
          />
        </div>
      )}

      {dossier && (
        <DossierBeneficiaireMilo
          ref={dossierBeneficiaireRef}
          dossier={dossier}
          onCreateCompte={creerCompteJeune}
          erreurMessageCreationCompte={erreurCreation}
          beneficiaireExisteDejaMilo={compteBeneficiaireExisteDeja}
          onRefresh={() => rechercherDossier(dossier.id)}
          onRetour={() => {
            clearDossier()
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
