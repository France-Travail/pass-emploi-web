import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauActionsAQualifier from 'components/pilotage/TableauActionsAQualifier'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import Pagination from 'components/ui/Table/Pagination'
import { ActionPilotage, SituationNonProfessionnelle } from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { TriActionsAQualifier } from 'services/actions.service'
import { MetadonneesPagination } from 'types/pagination'
import { useAlerte } from 'utils/alerteContext'
import { ApiError } from 'utils/httpClient'

interface OngletActionsPilotageProps {
  categories: SituationNonProfessionnelle[]
  actionsInitiales: ActionPilotage[]
  metadonneesInitiales: MetadonneesPagination
  getActions: (options: {
    page: number
    tri?: TriActionsAQualifier
    filtres?: string[]
  }) => Promise<{
    actions: ActionPilotage[]
    metadonnees: MetadonneesPagination
  }>
  onLienExterne: (label: string) => void
}

export default function OngletActionsPilotage({
  categories,
  actionsInitiales,
  metadonneesInitiales,
  getActions,
  onLienExterne,
}: OngletActionsPilotageProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [actions, setActions] = useState<ActionPilotage[]>(actionsInitiales)
  const [metadonnees, setMetadonnees] =
    useState<MetadonneesPagination>(metadonneesInitiales)

  const [page, setPage] = useState<number>(1)
  const [tri, setTri] = useState<TriActionsAQualifier>(
    'REALISATION_CHRONOLOGIQUE'
  )
  const [filtres, setFiltres] = useState<string[]>([])
  const [erreurQualification, setErreurQualification] = useState<
    string | undefined
  >()

  const aucuneActionAQualifier =
    filtres.length === 0 && metadonnees.nombreTotal === 0

  async function rafraichirActions(options: {
    page: number
    tri: TriActionsAQualifier
    filtres: string[]
  }) {
    const update = await getActions(options)

    // Le total peut chuter sous la page courante (ex : qualification des
    // dernières actions d'une page). Tant qu'il reste des pages, on se
    // resynchronise sur la dernière page valide pour éviter d'afficher une
    // page vide avec un indicateur de page incohérent. S'il n'y a plus rien
    // à qualifier (nombrePages 0), on laisse passer pour afficher l'état vide.
    const { nombrePages } = update.metadonnees
    if (nombrePages >= 1 && options.page > nombrePages) {
      setPage(nombrePages)
      return rafraichirActions({ ...options, page: nombrePages })
    }

    setActions(update.actions)
    setMetadonnees(update.metadonnees)
  }

  async function trierActions(nouveauTri: TriActionsAQualifier) {
    setTri(nouveauTri)
    await rafraichirActions({ page, tri: nouveauTri, filtres })
  }

  async function filtrerActions(categoriesSelectionnees: string[]) {
    setPage(1)
    setFiltres(categoriesSelectionnees)
    await rafraichirActions({ page: 1, tri, filtres: categoriesSelectionnees })
  }

  async function changerPage(nouvellePage: number) {
    if (nouvellePage < 1 || nouvellePage > metadonnees.nombrePages) return
    setPage(nouvellePage)
    await rafraichirActions({ page: nouvellePage, tri, filtres })
  }

  async function qualifierActions(
    qualificationSNP: boolean,
    actionsSelectionnees: Array<{ idAction: string; codeQualification: string }>
  ) {
    document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' })

    const { qualifierActions: _qualifierActions } =
      await import('services/actions.service')

    let actionsPayload = [...actionsSelectionnees]
    if (!qualificationSNP) {
      actionsPayload = actionsPayload.map((a) => ({
        ...a,
        codeQualification: CODE_QUALIFICATION_NON_SNP,
      }))
    }
    setErreurQualification(undefined)
    try {
      const { idsActionsEnErreur } = await _qualifierActions(
        actionsPayload,
        qualificationSNP
      )

      if (idsActionsEnErreur.length) {
        setErreurQualification(
          'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
        )
      } else
        setAlerte(
          qualificationSNP
            ? AlerteParam.multiQualificationSNP
            : AlerteParam.multiQualificationNonSNP
        )

      await rafraichirActions({ page, tri, filtres })

      router.refresh()
    } catch (error) {
      setErreurQualification(
        error instanceof ApiError && error.statusCode !== 500
          ? error.message
          : 'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
      )
      document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {erreurQualification && (
        <FailureAlert
          label={erreurQualification}
          onAcknowledge={() => setErreurQualification(undefined)}
        />
      )}

      {aucuneActionAQualifier && (
        <EmptyState
          illustrationName={IllustrationName.Event}
          titre='Vous n’avez pas d’action à qualifier.'
        />
      )}

      {!aucuneActionAQualifier && (
        <>
          <TableauActionsAQualifier
            categories={categories}
            actionsFiltrees={actions}
            tri={tri}
            onTri={trierActions}
            onFiltres={filtrerActions}
            onLienExterne={onLienExterne}
            onQualification={qualifierActions}
          />
          {metadonnees.nombrePages > 1 && (
            <div className='mt-6'>
              <Pagination
                nomListe='actions'
                nombreDePages={metadonnees.nombrePages}
                pageCourante={page}
                allerALaPage={changerPage}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}
