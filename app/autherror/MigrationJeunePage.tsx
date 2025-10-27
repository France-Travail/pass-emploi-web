'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import { ButtonStyle } from '../../components/ui/Button/Button'
import ButtonLink from '../../components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from '../../components/ui/IllustrationComponent'

import { useParcoursEmploiUrl } from './useParcoursEmploiUrl'

function MigrationJeunePage() {
  const urlParcoursEmploi = useParcoursEmploiUrl()

  return (
    <>
      <header>
        <title>Vos outils évoluent</title>
      </header>
      <main
        role='main'
        className='flex flex-col justify-center p-10 mt-32 w-screen'
      >
        <div className='shadow-m flex flex-col justify-center mx-auto p-8'>
          <div className='flex justify-center'>
            <IllustrationComponent
              name={IllustrationName.MigrationParcoursEmploiJeune}
            />
          </div>
          <h1 className='text-m-bold text-primary text-center mt-6 mb-8'>
            Vos outils évoluent
          </h1>
          <div className='text text-base text-primary'>
            L’application du CEJ n’est plus disponible. Vous devez désormais
            utiliser l’application Parcours Emploi.
          </div>
          <ButtonLink
            href={urlParcoursEmploi}
            style={ButtonStyle.PRIMARY}
            className='mx-auto mt-10'
          >
            Télécharger l&apos;application
          </ButtonLink>
          <div className='text mt-12 text-xs text-primary'>
            🔒 Vous pouvez demander la suppression de vos données personnelles
            de l&apos;application du CEJ par ici
          </div>
        </div>
      </main>
    </>
  )
}

export default withTransaction(
  MigrationJeunePage.name,
  'page'
)(MigrationJeunePage)
