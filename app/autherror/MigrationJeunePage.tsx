'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import Link from 'next/link'

import ErrorPageLayout from '../../components/layouts/ErrorPageLayout'
import { ButtonStyle } from '../../components/ui/Button/Button'
import ButtonLink from '../../components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from '../../components/ui/IllustrationComponent'

import { useParcoursEmploiUrl } from './useParcoursEmploiUrl'

type MigrationJeunePageProps = {
  nom?: string
  prenom?: string
  email?: string
}

function MigrationJeunePage({
  nom = 'NOM',
  prenom = 'PRENOM',
  email = 'email@exemple.com',
}: Readonly<MigrationJeunePageProps>) {
  const urlParcoursEmploi = useParcoursEmploiUrl()
  const titleId = 'error-title-jeune'
  const titleText = 'Vos outils évoluent'

  return (
    <ErrorPageLayout
      title={titleText}
      ariaLabelledBy={titleId}
      className='bg-[#EEF1F8]'
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
      <p className='text mt-12 text-xs text-primary'>
        🔒 Vous pouvez demander la suppression de vos données personnelles de
        l&apos;application du CEJ par{' '}
        <Link
          href={`mailto:support@pass-emploi.beta.gouv.fr?subject=Demande%20de%20suppression%20des%20donn%C3%A9es%20personnelles%20%E2%80%93%20${nom}%20${prenom}&body=Bonjour%2C%0A%0AJe%20souhaite%20exercer%20mon%20droit%20%C3%A0%20la%20suppression%20de%20mes%20donn%C3%A9es%20personnelles%20conform%C3%A9ment%20%C3%A0%20l%E2%80%99article%2017.1%20du%20RGPD.%20Vous%20trouverez%20ci%E2%80%91dessous%20les%20informations%20me%20concernant%20afin%20que%20vous%20puissiez%20localiser%20rapidement%20mon%20dossier.%20%0A%0ANom%20%3A%20${nom}%0APr%C3%A9nom%20%3A%20${prenom}%0AAdresse%20e%E2%80%91mail%20utilis%C3%A9e%20dans%20l%E2%80%99application%20%3A%20${email}`}
          className='underline hover:text-primary'
          aria-label='Envoyer un email pour demander la suppression de vos données'
        >
          ici
        </Link>
      </p>
    </ErrorPageLayout>
  )
}

export default withTransaction(
  MigrationJeunePage.name,
  'page'
)(MigrationJeunePage)
