'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import ErrorPageLayout from 'components/layouts/ErrorPageLayout'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

function MigrationPassEmploiConseillerPage() {
  const titleId = 'error-title-conseiller'
  const titleText = 'Information importante'

  return (
    <ErrorPageLayout
      title={titleText}
      ariaLabelledBy={titleId}
      colorBackground='bg-primary-lighten'
    >
      <div className='hidden layout-xs:flex justify-center'>
        <IllustrationComponent
          name={IllustrationName.MigrationPassEmploiConseiller}
          focusable={false}
          aria-hidden={true}
        />
      </div>
      <h1
        id={titleId}
        className='text-m-bold text-primary text-center mt-6 mb-8'
      >
        {titleText}
      </h1>
      <p className='text-center text-base-bold text-primary'>
        L’accès à l’application pass emploi n’est plus disponible.
        <br /> Pour échanger avec vos bénéficiaires, rendez-vous dans CVM -
        messagerie instantanée.
      </p>
      <p className='text-center text-base-bold text-primary mt-6'>
        Les demandeurs d’emploi doivent désormais utiliser Parcours Emploi pour
        échanger avec vous.
      </p>
    </ErrorPageLayout>
  )
}

export default withTransaction(
  MigrationPassEmploiConseillerPage.name,
  'page'
)(MigrationPassEmploiConseillerPage)
