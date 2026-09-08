import { Metadata } from 'next'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { Liste } from 'interfaces/liste'
import {
  estAvenirPro,
  estFranceTravail,
  estMilo,
  labelStructure,
} from 'interfaces/structure'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getListesServerSide } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { toEcsError } from 'utils/monitoring/ecsHelpers'
import { rootLogger } from 'utils/monitoring/logger'

export const metadata: Metadata = {
  title: 'Créer compte bénéficiaire - Portefeuille',
}

export default async function CreationBeneficiaire() {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)

  const header =
    'Créer un compte bénéficiaire' +
    (estFranceTravail(conseiller.structure)
      ? ` ${labelStructure(conseiller.structure)}`
      : '')

  let listes: Liste[] | undefined = undefined
  if (estAvenirPro(conseiller.structure)) {
    try {
      listes = await getListesServerSide(user.id, accessToken)
    } catch (error) {
      rootLogger.error(
        {
          event: { action: 'request_failed', outcome: 'failure' },
          error: toEcsError(error),
        },
        'Erreur lors de la récupération des listes'
      )
    }
  }
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={header} />

      {estMilo(conseiller.structure) && <CreationBeneficiaireMiloPage />}
      {!estMilo(conseiller.structure) && (
        <CreationBeneficiaireFranceTravailPage listes={listes} />
      )}
    </>
  )
}
