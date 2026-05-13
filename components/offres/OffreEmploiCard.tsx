import React from 'react'

import OffreCard from 'components/offres/OffreCard'
import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import { BaseOffreEmploi, TypeOffre } from 'interfaces/offre'

interface OffreEmploiCardProps {
  offre: BaseOffreEmploi
  withPartage?: boolean
}

export default function OffreEmploiCard({
  offre,
  withPartage = false,
}: Readonly<OffreEmploiCardProps>) {
  const typeOffre =
    offre.type === TypeOffre.ALTERNANCE ? 'alternance' : 'emploi'

  return (
    <OffreCard
      offrePath={typeOffre + '/' + offre.id}
      titreLien={offre.titre}
      withPartage={withPartage}
    >
      <TagMetier
        label={offre.type === TypeOffre.ALTERNANCE ? 'Alternance' : 'Emploi'}
        className={`text-content-color ${
          offre.type === TypeOffre.ALTERNANCE
            ? 'bg-additional-3-lighten'
            : 'bg-additional-4-lighten'
        } text-s-regular mb-4`}
      />

      <h3 className='text-base-bold text-accent-1 mb-2'>Offre n°{offre.id}</h3>
      <dl>
        <dt className='sr-only'>Titre</dt>
        <dd className='text-base-bold mb-2'>{offre.titre}</dd>

        {offre.nomEntreprise && (
          <>
            <dt className='sr-only'>Nom de l’entreprise</dt>
            <dd className='text-s-bold mb-2'>{offre.nomEntreprise}</dd>
          </>
        )}
        <div className='flex gap-2 mb-5'>
          {offre.localisation && (
            <div className='mb-5'>
              <dt className='sr-only'>Localité</dt>
              <dd>
                <DataTag
                  text={offre.localisation}
                  iconName={IconName.LocationOn}
                  iconLabel='Localité'
                />
              </dd>
            </div>
          )}
          <dt className='sr-only'>Contrat</dt>
          <dd className='inline'>
            <DataTag text={offre.typeContrat} />
          </dd>
          {offre.duree && (
            <>
              <dt className='sr-only'>Durée</dt>
              <dd className='inline'>
                <DataTag text={offre.duree} />
              </dd>
            </>
          )}
        </div>
      </dl>
    </OffreCard>
  )
}
