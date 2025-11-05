'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { Structure } from 'interfaces/structure'
import { trackEvent } from 'utils/analytics/matomo'

import ErrorPageLayout from '../../components/layouts/ErrorPageLayout'

type AuthErrorPageProps = {
  erreur: string
  codeErreur?: string
  withStructure?: {
    structure: Structure
    lienFormulaire?: string
    withTuto?: boolean
  }
}
function AuthErrorPage({
  erreur,
  codeErreur,
  withStructure,
}: Readonly<AuthErrorPageProps>) {
  function trackTutoSuppression() {
    trackEvent({
      structure: withStructure!.structure,
      categorie: 'Tutoriel',
      action: 'Suppression compte',
      nom: '',
      aDesBeneficiaires: null,
    })
  }

  function trackContactSupport() {
    trackEvent({
      structure: withStructure!.structure,
      categorie: 'Contact Support',
      action: 'Connexion',
      nom: '',
      aDesBeneficiaires: null,
    })
  }

  return (
    <ErrorPageLayout title='Portail de connexion'>
      <h1
        id='error_title'
        className='text-m-bold text-primary text-center mt-6 mb-8'
      >
        Portail de connexion
      </h1>
      <div className='text-center text-s'>
        {erreur.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
        {codeErreur && !codeErreur.includes('UTILISATEUR') && (
          <p className='text-xs mt-6'>code : {codeErreur}</p>
        )}

        {withStructure?.withTuto && (
          <div className='mt-4'>
            <ExternalLink
              href='https://doc.pass-emploi.beta.gouv.fr/suppression-de-compte/'
              label='Visionnez le tuto de suppression de compte'
              onClick={trackTutoSuppression}
            />
          </div>
        )}

        {withStructure?.lienFormulaire && (
          <ButtonLink
            href={withStructure.lienFormulaire}
            style={ButtonStyle.PRIMARY}
            externalIcon={IconName.OpenInNew}
            label='Contacter le support'
            className='m-auto w-fit mt-4'
            onClick={trackContactSupport}
          />
        )}
      </div>
    </ErrorPageLayout>
  )
}

export default withTransaction(AuthErrorPage.name, 'page')(AuthErrorPage)
