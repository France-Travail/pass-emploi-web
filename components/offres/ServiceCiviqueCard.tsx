import React from 'react'

import OffreCard from 'components/offres/OffreCard'
import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import { BaseServiceCivique } from 'interfaces/offre'
import { toLongMonthDate } from 'utils/date'

interface ServiceCiviqueCardProps {
  offre: BaseServiceCivique
  withPartage?: boolean
}

export default function ServiceCiviqueCard({
  offre,
  withPartage,
}: ServiceCiviqueCardProps) {
  return (
    <OffreCard
      offrePath={'service-civique/' + offre.id}
      titreLien={offre.titre}
      withPartage={withPartage}
    >
      <TagMetier
        label='Service civique'
        className='text-content-color bg-additional-2-lighten text-s-regular mb-4'
      />

      <h3 className='text-base-bold mb-2'>{offre.titre}</h3>
      <dl>
        <dt className='sr-only'>Domaine</dt>
        <dd className='text-base-bold text-accent-1 mb-2 capitalize'>
          {offre.domaine}
        </dd>

        {offre.organisation && (
          <>
            <dt className='sr-only'>Organisation</dt>
            <dd className='text-s-bold mb-2'>{offre.organisation}</dd>
          </>
        )}

        <div className='flex gap-2 mb-5'>
          {offre.ville && (
            <div className='mb-5'>
              <dt className='sr-only'>Ville</dt>
              <dd>
                <DataTag
                  text={offre.ville}
                  iconName={IconName.LocationOn}
                  iconLabel='Ville'
                />
              </dd>
            </div>
          )}

          {offre.dateDeDebut && (
            <>
              <dt className='sr-only'>Date de début</dt>
              <dd>
                <DataTag
                  text={'Dès le ' + toLongMonthDate(offre.dateDeDebut)}
                />
              </dd>
            </>
          )}
        </div>
      </dl>
    </OffreCard>
  )
}
