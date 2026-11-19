import React, { useState } from 'react'

import {
  LIBELLE_ERREUR_QUALIFICATION,
  libelleActionsEnErreur,
} from 'components/action/libellesQualification'
import TableauActionsBeneficiaire from 'components/action/TableauActionsBeneficiaire'
import EmptyState from 'components/EmptyState'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SpinningLoader from 'components/ui/SpinningLoader'
import {
  Action,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { DetailBeneficiaire, estCEJ } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { ApiError } from 'utils/httpClient'

interface OngletActionsProps {
  beneficiaire: DetailBeneficiaire
  categories: SituationNonProfessionnelle[]
  shouldFocus: boolean
  onLienExterne: (label: string) => void
  actions: Action[]
  updateActions: (actions: Action[]) => void
  rafraichirActions: () => Promise<void>
  labelSemaine: string
  isLoading: boolean
}

export default function OngletActions({
  categories,
  shouldFocus,
  beneficiaire,
  onLienExterne,
  actions,
  updateActions,
  rafraichirActions,
  labelSemaine,
  isLoading,
}: OngletActionsProps) {
  const [_, setAlerte] = useAlerte()
  const [conseiller] = useConseiller()
  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)

  const [erreurQualification, setErreurQualification] = useState<
    string | undefined
  >()
  const [idsActionsEnErreur, setIdsActionsEnErreur] = useState<string[]>([])

  async function qualifierActions(
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) {
    document.querySelector('header')?.scrollIntoView()

    setErreurQualification(undefined)
    setIdsActionsEnErreur([])
    const { qualifierActions: _qualifierActions } =
      await import('services/actions.service')

    let actionsPayload = [...actionsSelectionnees]
    if (!qualificationSNP) {
      actionsPayload = actionsPayload.map((a) => ({
        ...a,
        codeQualification: CODE_QUALIFICATION_NON_SNP,
      }))
    }

    let idsEnErreur: string[]
    try {
      const resultat = await _qualifierActions(actionsPayload, qualificationSNP)
      idsEnErreur = resultat.idsActionsEnErreur
    } catch (error) {
      setErreurQualification(
        error instanceof ApiError && error.statusCode !== 500
          ? error.message
          : LIBELLE_ERREUR_QUALIFICATION
      )
      await rafraichirActions().catch(() => {})
      return
    }

    let actionsQualifiees = actionsSelectionnees
    if (idsEnErreur.length) {
      setIdsActionsEnErreur(idsEnErreur)
      setErreurQualification(
        libelleActionsEnErreur(idsEnErreur.length, actionsSelectionnees.length)
      )
      actionsQualifiees = actionsSelectionnees.filter(
        (action) => !idsEnErreur.includes(action.idAction)
      )
    } else {
      setAlerte(
        qualificationSNP
          ? AlerteParam.multiQualificationSNP
          : AlerteParam.multiQualificationNonSNP
      )
    }

    updateActions(
      actions.map((affichee) =>
        updateSiQualifiee(affichee, actionsQualifiees, qualificationSNP)
      )
    )
  }

  return (
    <>
      {isLoading && <SpinningLoader />}

      {!isLoading && actions.length === 0 && !lectureSeule && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            shouldFocus={shouldFocus}
            illustrationName={IllustrationName.Checklist}
            titre={`Aucune action prévue pour ${beneficiaire.prenom} ${beneficiaire.nom}.`}
            lien={{
              href: `/mes-jeunes/${beneficiaire.id}/actions/nouvelle-action`,
              label: 'Créer une action',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {!isLoading && actions.length === 0 && lectureSeule && (
        <EmptyState
          shouldFocus={shouldFocus}
          illustrationName={IllustrationName.Checklist}
          titre={`Aucune action prévue pour ${beneficiaire.prenom} ${beneficiaire.nom}.`}
        />
      )}

      {erreurQualification && (
        <FailureAlert
          label={erreurQualification}
          onAcknowledge={() => setErreurQualification(undefined)}
        />
      )}

      {!isLoading && actions.length > 0 && (
        <TableauActionsBeneficiaire
          jeune={beneficiaire}
          categories={categories}
          actions={actions}
          shouldFocus={shouldFocus}
          labelSemaine={labelSemaine}
          avecQualification={
            estCEJ(beneficiaire)
              ? {
                  onLienExterne,
                  onQualification: qualifierActions,
                  idsActionsEnErreur,
                }
              : undefined
          }
        />
      )}
    </>
  )
}

function updateSiQualifiee(
  affichee: Action,
  actionsQualifiees: Array<{ idAction: string }>,
  qualificationSNP: boolean
) {
  const actionAEteQualifiee = actionsQualifiees.some(
    ({ idAction }) => idAction === affichee.id
  )
  if (!actionAEteQualifiee) return affichee

  return {
    ...affichee,
    status: StatutAction.TermineeQualifiee,
    qualification: qualificationSNP
      ? affichee.qualification
      : {
          code: CODE_QUALIFICATION_NON_SNP,
          isSituationNonProfessionnelle: false,
          libelle: 'Action non SNP',
        },
  }
}
