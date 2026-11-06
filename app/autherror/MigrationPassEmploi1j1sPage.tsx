'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import LienSuppressionDonnees from 'app/autherror/LienSuppressionDonnees'
import { URLS_1J1S } from 'app/autherror/urlsStores'
import { useMobileStoreUrl } from 'app/autherror/useParcoursEmploiUrl'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

type MigrationPassEmploi1j1sPageProps = {
  nom?: string
  prenom?: string
  email?: string
}

const TITRE = 'pass emploi devient 1jeune1solution'
const TITLE_ID = 'error-title-jeune'

function MigrationPassEmploi1j1sPage({
  nom,
  prenom,
  email,
}: Readonly<MigrationPassEmploi1j1sPageProps>) {
  const urlTelechargement = useMobileStoreUrl(URLS_1J1S)

  return (
    <>
      <title>{TITRE}</title>
      <main
        role='main'
        aria-labelledby={TITLE_ID}
        className='flex min-h-screen w-full bg-white p-4 layout-s:items-center layout-s:justify-center'
      >
        <div className='flex grow flex-col rounded-xl bg-primary-lighten px-4 py-10 layout-xs:px-8 layout-s:max-w-[480px]'>
          <div className='hidden layout-xs:flex justify-center'>
            <IllustrationComponent
              name={IllustrationName.MigrationPassEmploi1j1s}
              focusable={false}
              aria-hidden={true}
            />
          </div>
          <h1
            id={TITLE_ID}
            className='text-base-bold text-primary-darken text-center mt-8 mb-2'
          >
            {TITRE}
          </h1>
          <p className='text-base text-primary-darken'>
            Téléchargez la nouvelle application 1jeune1solution pour continuer à
            profiter de tous les services.
          </p>
          {urlTelechargement && (
            <ButtonLink
              href={urlTelechargement}
              style={ButtonStyle.PRIMARY_DARK}
              className='w-full mt-8'
            >
              <IconComponent
                name={IconName.Download}
                className='mr-2 w-4 h-4'
                focusable={false}
                aria-hidden={true}
              />
              Télécharger l’application
            </ButtonLink>
          )}
          <LienSuppressionDonnees
            nomApplication='pass emploi'
            nom={nom}
            prenom={prenom}
            email={email}
            className='mt-auto pt-12 text-primary-darken'
          />
        </div>
      </main>
    </>
  )
}

export default withTransaction(
  MigrationPassEmploi1j1sPage.name,
  'page'
)(MigrationPassEmploi1j1sPage)
