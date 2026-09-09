import React from 'react'

import propsStatutsDemarches, {
  propsDemarcheEnRetard,
} from 'components/action/propsStatutsDemarches'
import { TagStatut } from 'components/ui/Indicateurs/Tag'
import { StatutDemarche } from 'interfaces/json/beneficiaire'

interface TagStatutDemarcheProps {
  status: StatutDemarche
  demarcheEstEnRetard: boolean
}

export default function TagStatutDemarche({
  status,
  demarcheEstEnRetard,
}: TagStatutDemarcheProps) {
  const { label, style } = demarcheEstEnRetard
    ? propsDemarcheEnRetard
    : propsStatutsDemarches[status]

  return <TagStatut label={label} className={style + ' text-s-bold'} />
}
