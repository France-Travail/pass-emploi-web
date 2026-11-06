'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import ErrorPageLayout from '../../components/layouts/ErrorPageLayout'
import { ButtonStyle } from '../../components/ui/Button/Button'
import ButtonLink from '../../components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from '../../components/ui/IllustrationComponent'

import LienSuppressionDonnees from './LienSuppressionDonnees'
import { useParcoursEmploiUrl } from './useParcoursEmploiUrl'

type MigrationJeunePageProps = {
  nom?: string
  prenom?: string
  email?: string
}

function MigrationJeunePage({
  nom,
  prenom,
  email,
}: Readonly<MigrationJeunePageProps>) {
  const urlParcoursEmploi = useParcoursEmploiUrl()
  const titleId = 'error-title-jeune'
  const titleText = 'Vos outils évoluent'

  return (
    <ErrorPageLayout
      title={titleText}
      ariaLabelledBy={titleId}
      colorBackground='bg-primary-lighten'
    >
      <div className='hidden layout-xs:flex justify-center'>
        <IllustrationComponent
          name={IllustrationName.MigrationParcoursEmploiJeune}
        />
      </div>
      <h1
        id={titleId}
        className='text-m-bold text-primary text-center mt-6 mb-8'
      >
        {titleText}
      </h1>
      <p className='text text-base text-primary'>
        L&apos;application du CEJ n&apos;est plus disponible. Vous devez
        désormais utiliser l&apos;application Parcours Emploi.
      </p>
      <ButtonLink
        href={urlParcoursEmploi}
        style={ButtonStyle.PRIMARY}
        className='mx-auto mt-10'
      >
        Télécharger l&apos;application
      </ButtonLink>
      <LienSuppressionDonnees
        nomApplication='du CEJ'
        nom={nom}
        prenom={prenom}
        email={email}
        className='mt-12 text-primary'
      />
    </ErrorPageLayout>
  )
}

export default withTransaction(
  MigrationJeunePage.name,
  'page'
)(MigrationJeunePage)
