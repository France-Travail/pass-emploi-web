'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import ErrorPageLayout from '../../components/layouts/ErrorPageLayout'
import IllustrationComponent, {
  IllustrationName,
} from '../../components/ui/IllustrationComponent'

function MigrationConseillerPage() {
  const titleId = 'error-title-conseiller'
  const titleText = 'Information importante'

  return (
    <ErrorPageLayout title={titleText} ariaLabelledBy={titleId}>
      <div className='hidden layout-xs:flex justify-center'>
        <IllustrationComponent
          name={IllustrationName.MigrationParcoursEmploiConseiller}
        />
      </div>
      <h1
        id={titleId}
        className='text-m-bold text-primary text-center mt-6 mb-8'
      >
        {titleText}
      </h1>
      <div className='text-center text-base-bold text-primary'>
        L&#39;accès à l&#39;application du CEJ n&#39;est plus disponible.
        <br />
        Pour échanger avec vos bénéficiaires, rendez-vous dans CVM - messagerie
        instantanée.
      </div>
      <div className='text-center text-base-bold text-primary mt-6'>
        Les demandeurs d&#39;emploi doivent désormais utiliser Parcours Emploi
        pour échanger avec vous.
      </div>
    </ErrorPageLayout>
  )
}

export default withTransaction(
  MigrationConseillerPage.name,
  'page'
)(MigrationConseillerPage)
