'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import IllustrationComponent, {
  IllustrationName,
} from '../../components/ui/IllustrationComponent'

import ErrorPageLayout from './ErrorPageLayout'

function MigrationConseillerPage() {
  return (
    <ErrorPageLayout title='Information importante'>
      <div className='hidden md:flex justify-center'>
        <IllustrationComponent
          name={IllustrationName.MigrationParcoursEmploiConseiller}
        />
      </div>
      <h1
        id='error_title'
        className='text-m-bold text-primary text-center mt-6 mb-8'
      >
        Information importante
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
