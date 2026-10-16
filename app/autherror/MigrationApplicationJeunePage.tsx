'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import ErrorPageLayout from 'components/layouts/ErrorPageLayout'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

import { UrlsStoresMobile } from './urlsStores'
import { useMobileStoreUrl } from './useParcoursEmploiUrl'

type MigrationApplicationJeunePageProps = {
  titre: string
  texte: string
  illustration: IllustrationName
  urlsStores: UrlsStoresMobile
}

function MigrationApplicationJeunePage({
  titre,
  texte,
  illustration,
  urlsStores,
}: Readonly<MigrationApplicationJeunePageProps>) {
  const urlTelechargement = useMobileStoreUrl(urlsStores)
  const titleId = 'error-title-jeune'

  return (
    <ErrorPageLayout
      title={titre}
      ariaLabelledBy={titleId}
      colorBackground='bg-primary-lighten'
    >
      <div className='hidden layout-xs:flex justify-center'>
        <IllustrationComponent
          name={illustration}
          focusable={false}
          aria-hidden={true}
        />
      </div>
      <h1
        id={titleId}
        className='text-m-bold text-primary text-center mt-6 mb-8'
      >
        {titre}
      </h1>
      <p className='text-center text-base text-primary'>{texte}</p>
      {urlTelechargement && (
        <ButtonLink
          href={urlTelechargement}
          style={ButtonStyle.PRIMARY}
          className='mx-auto mt-10'
        >
          Télécharger l’application
        </ButtonLink>
      )}
    </ErrorPageLayout>
  )
}

export default withTransaction(
  MigrationApplicationJeunePage.name,
  'page'
)(MigrationApplicationJeunePage)
