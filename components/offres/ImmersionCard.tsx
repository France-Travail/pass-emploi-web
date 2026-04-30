import React from 'react'

import OffreCard from 'components/offres/OffreCard'
import TagAccessibleHandicap from 'components/offres/TagAccessibleHandicap'
import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import { BaseImmersion } from 'interfaces/offre'

interface ImmersionCardProps {
  offre: BaseImmersion
  withPartage?: boolean
}

export default function ImmersionCard({
  offre,
  withPartage = false,
}: Readonly<ImmersionCardProps>) {
  return (
    <OffreCard
      offrePath={'immersion/' + offre.id}
      titreLien={'chez ' + offre.nomEtablissement}
      withPartage={withPartage}
    >
      <span className='flex gap-2'>
        <TagMetier
          label='Immersion'
          className='text-content-color bg-additional-1-lighten text-s-regular mb-4'
        />
        <TagAccessibleHandicap
          accessibleTravailleurHandicape={offre.accessibleTravailleurHandicape}
          className='mb-4'
        />
      </span>

      <h3 className='text-base-bold mb-2'>{offre.titre}</h3>
      <dl>
        <dt className='sr-only'>Établissement</dt>
        <dd className='text-s-bold mb-2'>{offre.nomEtablissement}</dd>

        <div className='flex gap-2 mb-5'>
          <div>
            <dt className='sr-only'>Ville</dt>
            <dd>
              <DataTag
                text={offre.ville}
                iconName={IconName.LocationOn}
                iconLabel='Ville'
              />
            </dd>
          </div>
          <div>
            <dt className='sr-only'>Secteur</dt>
            <dd>
              <DataTag text={offre.secteurActivite} />
            </dd>
          </div>
        </div>
      </dl>
    </OffreCard>
  )
}
