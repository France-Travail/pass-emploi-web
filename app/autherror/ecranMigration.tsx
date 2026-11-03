import { ReactElement } from 'react'

import MigrationApplicationJeunePage from 'app/autherror/MigrationApplicationJeunePage'
import MigrationConseillerPage from 'app/autherror/MigrationConseillerPage'
import MigrationJeunePage from 'app/autherror/MigrationJeunePage'
import MigrationPassEmploiConseillerPage from 'app/autherror/MigrationPassEmploiConseillerPage'
import { estPopulationDeMigrationPassEmploi } from 'app/autherror/populationsMigration'
import { URLS_PARCOURS_EMPLOI } from 'app/autherror/urlsStores'
import { IllustrationName } from 'components/ui/IllustrationComponent'

type ParametresMigration = {
  reason?: string
  typeUtilisateur?: string
  population?: string
  nom?: string
  prenom?: string
  email?: string
}

// Écran plein de migration, ou undefined si l'erreur n'en est pas une
export function ecranMigration({
  reason,
  typeUtilisateur,
  population,
  nom,
  prenom,
  email,
}: ParametresMigration): ReactElement | undefined {
  switch (reason) {
    case 'MIGRATION_AIJ_AVENIR_PRO':
      // TODO textes, illustration et stores de l'app 1j1s à fournir
      return (
        <MigrationApplicationJeunePage
          titre='[Titre en attente]'
          texte='[Texte en attente]'
          illustration={IllustrationName.MigrationPassEmploiJeune}
        />
      )

    case 'MIGRATION_PARCOURS_EMPLOI': {
      const migrationPassEmploi = estPopulationDeMigrationPassEmploi(population)
      if (typeUtilisateur === 'CONSEILLER') {
        return migrationPassEmploi ? (
          <MigrationPassEmploiConseillerPage />
        ) : (
          <MigrationConseillerPage />
        )
      }
      if (typeUtilisateur === 'JEUNE') {
        return migrationPassEmploi ? (
          <MigrationApplicationJeunePage
            titre='Vos outils évoluent'
            texte='L’application pass emploi n’est plus disponible. Vous devez désormais utiliser l’application Parcours Emploi.'
            illustration={IllustrationName.MigrationPassEmploiJeune}
            urlsStores={URLS_PARCOURS_EMPLOI}
          />
        ) : (
          <MigrationJeunePage nom={nom} prenom={prenom} email={email} />
        )
      }
      return undefined
    }

    default:
      return undefined
  }
}
