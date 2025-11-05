'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import IllustrationComponent, {
  IllustrationName,
} from '../../components/ui/IllustrationComponent'

function MigrationConseillerPage() {
  return (
    <>
      <header>
        <title>Information importante</title>
      </header>
      <main
        role='main'
        aria-labelledby='error_title'
        className='flex flex-col justify-center min-h-screen w-full py-10 px-4 sm:px-10'
      >
        <div className='shadow-m flex flex-col justify-center w-full max-w-[800px] mx-auto p-4 sm:p-8 box-border'>
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
            L’accès à l’application du CEJ n’est plus disponible.
            <br />
            Pour échanger avec vos bénéficiaires, rendez-vous dans CVM -
            messagerie instantanée.
          </div>
          <div className='text-center text-base-bold text-primary mt-6'>
            Les demandeurs d’emploi doivent désormais utiliser Parcours Emploi
            pour échanger avec vous.
          </div>
        </div>
      </main>
    </>
  )
}

export default withTransaction(
  MigrationConseillerPage.name,
  'page'
)(MigrationConseillerPage)
