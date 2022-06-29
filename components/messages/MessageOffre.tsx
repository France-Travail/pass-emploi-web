import React, { useState } from 'react'

import ExternalLink from 'components/ui/ExternalLink'
import { InfoOffre } from 'interfaces/message'
import useMatomo from 'utils/analytics/useMatomo'

export function MessageOffre(props: { infoOffre: InfoOffre }) {
  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(undefined)

  useMatomo(labelMatomo)

  const label = 'Voir l’offre'

  return (
    <div className='p-4 rounded-medium bg-blanc mt-4'>
      <p className='text-base-medium text-content_color'>
        {props.infoOffre!.titre}
      </p>
      <div className='mt-4 w-max ml-auto'>
        <ExternalLink
          href={props.infoOffre!.lien}
          label={label}
          onClick={() => setLabelMatomo(label)}
        />
      </div>
    </div>
  )
}
